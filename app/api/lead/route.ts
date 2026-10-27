import { NextResponse, after, type NextRequest } from "next/server";
import {
  MS_MINIMO,
  etiqueta,
  leadSchema,
  perfilamientoSchema,
  type LeadPayload,
  type PerfilamientoPayload,
} from "@/lib/lead-schema";
import {
  BrevoError,
  FUENTE,
  configBrevo,
  enviarDobleOptin,
  enviarTransaccional,
  htmlNotificacion,
  upsertContacto,
  type Atributos,
} from "@/lib/brevo";
import { permitido } from "@/lib/rate-limit";
import { crearToken, verificarToken } from "@/lib/token";
import { enviarLeadMeta } from "@/lib/meta-capi";

export const runtime = "nodejs";

const ERROR_GENERICO = "No pudimos registrar tus datos. Intenta de nuevo o escríbenos por WhatsApp.";

const json = (body: unknown, status = 200) => NextResponse.json(body, { status });

/** Quita atributos vacíos para no borrar en Brevo datos que ya existían. */
const compactar = (a: Record<string, string | undefined>): Atributos =>
  Object.fromEntries(Object.entries(a).filter((e): e is [string, string] => Boolean(e[1])));

function ipDe(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "desconocida";
}

export async function POST(req: NextRequest) {
  const ip = ipDe(req);
  if (!permitido(ip)) {
    return json({ ok: false, error: "Demasiados intentos. Espera unos minutos o escríbenos por WhatsApp." }, 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: ERROR_GENERICO }, 400);
  }

  if ((body as { paso?: unknown })?.paso === 2) return perfilamiento(body);
  return registro(req, body, ip);
}

async function registro(req: NextRequest, body: unknown, ip: string) {
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Revisa los campos marcados.", campos: parsed.error.flatten().fieldErrors }, 400);
  }
  const lead = parsed.data;

  // Honeypot lleno → bot. Respondemos "ok" para no darle pistas, pero no guardamos nada.
  if (lead.sitio_web) return json({ ok: true });
  if (lead.ms < MS_MINIMO) return json({ ok: false, error: "No pudimos validar el envío. Intenta de nuevo." }, 400);

  const cfg = configBrevo();

  if (!cfg.apiKey || !cfg.listId) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead] Brevo sin configurar; lead de prueba:", { ...lead, celular: "***" });
      return json({ ok: true, token: crearToken(lead.email) });
    }
    console.error("[lead] Faltan BREVO_API_KEY o BREVO_LIST_ID");
    return json({ ok: false, error: ERROR_GENERICO }, 503);
  }

  const t = lead.tracking ?? {};
  const atributos = compactar({
    NOMBRE: lead.nombre,
    CELULAR: lead.celular,
    PERFIL: lead.perfil,
    CIUDAD: lead.ciudad,
    UTM_SOURCE: t.utm_source,
    UTM_CAMPAIGN: t.utm_campaign,
    FUENTE,
  });

  try {
    if (cfg.doiTemplateId) {
      // Double opt-in: guardamos los atributos ya; Brevo agrega a la lista cuando confirme.
      await upsertContacto(cfg.apiKey, lead.email, atributos);
      await enviarDobleOptin(cfg.apiKey, lead.email, atributos, cfg.listId, cfg.doiTemplateId, `${cfg.siteUrl}/confirmado`);
    } else {
      await upsertContacto(cfg.apiKey, lead.email, atributos, cfg.listId);
    }
  } catch (e) {
    console.error("[lead] Error Brevo:", e instanceof BrevoError ? e.message : e);
    return json({ ok: false, error: ERROR_GENERICO }, 502);
  }

  const userAgent = req.headers.get("user-agent") ?? undefined;
  const pagina = req.headers.get("referer") ?? cfg.siteUrl;
  const fbp = req.cookies.get("_fbp")?.value;

  // Lo que no afecta al usuario corre después de responder.
  after(async () => {
    const resultados = await Promise.allSettled([
      notificar(cfg, lead, pagina),
      lead.eventId
        ? enviarLeadMeta({
            eventId: lead.eventId,
            email: lead.email,
            celular: lead.celular,
            perfil: lead.perfil,
            url: pagina,
            ip,
            userAgent,
            fbclid: t.fbclid,
            fbp,
          })
        : Promise.resolve(),
    ]);
    for (const r of resultados) if (r.status === "rejected") console.error("[lead] post-proceso:", r.reason);
  });

  return json({ ok: true, token: crearToken(lead.email) });
}

async function perfilamiento(body: unknown) {
  const parsed = perfilamientoSchema.safeParse(body);
  if (!parsed.success) {
    return json({ ok: false, error: "Revisa los campos marcados.", campos: parsed.error.flatten().fieldErrors }, 400);
  }
  const datos = parsed.data;
  if (!verificarToken(datos.token, datos.email)) {
    return json({ ok: false, error: "La sesión expiró. Tus datos principales ya quedaron registrados." }, 403);
  }

  const atributos = compactar({
    EMPRESA: datos.empresa,
    ETAPA: datos.etapa,
    M2_RANGO: datos.m2,
    INTERESES: datos.intereses?.join(","),
  });
  if (Object.keys(atributos).length === 0) return json({ ok: true });

  const cfg = configBrevo();
  if (!cfg.apiKey) {
    if (process.env.NODE_ENV !== "production") {
      console.info("[lead] Perfilamiento de prueba:", datos.email, atributos);
      return json({ ok: true });
    }
    return json({ ok: false, error: ERROR_GENERICO }, 503);
  }

  try {
    await upsertContacto(cfg.apiKey, datos.email, atributos);
  } catch (e) {
    console.error("[lead] Error Brevo (paso 2):", e instanceof BrevoError ? e.message : e);
    return json({ ok: false, error: ERROR_GENERICO }, 502);
  }

  after(() => notificarPerfil(cfg, datos).catch((e) => console.error("[lead] notificación paso 2:", e)));
  return json({ ok: true });
}

type Cfg = ReturnType<typeof configBrevo>;

async function notificar(cfg: Cfg, lead: LeadPayload, pagina: string) {
  if (!cfg.notifyEmail || !cfg.sender.email) return;
  const t = lead.tracking ?? {};
  await enviarTransaccional(cfg.apiKey, {
    sender: cfg.sender,
    to: cfg.notifyEmail,
    replyTo: lead.email,
    subject: `Lead ${etiqueta("perfil", lead.perfil)} · ${etiqueta("ciudad", lead.ciudad)} · ${lead.nombre}`,
    html: htmlNotificacion("Nuevo lead desde la landing de proyectos", [
      ["Nombre", lead.nombre],
      ["Correo", lead.email],
      ["Celular", lead.celular],
      ["WhatsApp", `https://wa.me/${lead.celular.replace(/\D/g, "")}`],
      ["Perfil", etiqueta("perfil", lead.perfil)],
      ["Ciudad", etiqueta("ciudad", lead.ciudad)],
      ["utm_source", t.utm_source],
      ["utm_medium", t.utm_medium],
      ["utm_campaign", t.utm_campaign],
      ["utm_content", t.utm_content],
      ["utm_term", t.utm_term],
      ["gclid", t.gclid ? "sí" : undefined],
      ["fbclid", t.fbclid ? "sí" : undefined],
      ["Página", pagina],
    ]),
  });
}

async function notificarPerfil(cfg: Cfg, datos: PerfilamientoPayload) {
  if (!cfg.notifyEmail || !cfg.sender.email) return;
  await enviarTransaccional(cfg.apiKey, {
    sender: cfg.sender,
    to: cfg.notifyEmail,
    replyTo: datos.email,
    subject: `Perfil completado · ${datos.empresa || datos.email}`,
    html: htmlNotificacion("El lead completó su perfil", [
      ["Correo", datos.email],
      ["Empresa", datos.empresa],
      ["Etapa", datos.etapa && etiqueta("etapa", datos.etapa)],
      ["m² estimados", datos.m2 && etiqueta("m2", datos.m2)],
      ["Intereses", datos.intereses?.map((i) => etiqueta("intereses", i)).join(", ")],
    ]),
  });
}
