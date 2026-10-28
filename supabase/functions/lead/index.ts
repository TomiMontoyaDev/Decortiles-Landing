// Edge Function de Supabase: recibe el formulario de la landing estática.
//   1. Valida y guarda el lead en la tabla `leads` (supabase/schema.sql).
//   2. Lo sincroniza con Brevo (lista, atributos y double opt-in) y anota el resultado.
//   3. Avisa a ventas por correo (Brevo transaccional).
// Brevo y el aviso corren después de responder, así el formulario contesta rápido.
//
// Corre en Deno, no en Next: está excluida de tsconfig y eslint.
// Secrets (Edge Functions → Secrets): ver README, sección 4.1.
import { createClient } from "npm:@supabase/supabase-js@2";

declare const EdgeRuntime: { waitUntil(p: Promise<unknown>): void };

const FUENTE = "landing-proyectos";
const MS_MINIMO = 2500;
const ENVIOS_POR_CORREO = 3; // por cada 10 minutos
const TOKEN_HORAS = 2;
const ERROR_GENERICO = "No pudimos registrar tus datos. Intenta de nuevo.";

// Mismos valores que lib/lead-schema.ts (OPCIONES).
const ETIQUETAS: Record<string, Record<string, string>> = {
  perfil: { constructora: "Constructora", arquitecto: "Arquitecto/a", disenador: "Diseñador/a", contratista: "Contratista" },
  // Si no está aquí, es una ciudad que escribió el cliente y se guarda tal cual.
  ciudad: {
    medellin: "Medellín", barranquilla: "Barranquilla", armenia: "Armenia", bello: "Bello", bogota: "Bogotá",
    bucaramanga: "Bucaramanga", cali: "Cali", cartagena: "Cartagena", chia: "Chía", cucuta: "Cúcuta",
    envigado: "Envigado", florencia: "Florencia", ibague: "Ibagué", itagui: "Itagüí", manizales: "Manizales",
    monteria: "Montería", neiva: "Neiva", pasto: "Pasto", pereira: "Pereira", popayan: "Popayán",
    "puerto-colombia": "Puerto Colombia", quibdo: "Quibdó", riohacha: "Riohacha", rionegro: "Rionegro",
    sabaneta: "Sabaneta", "san-andres": "San Andrés", "santa-marta": "Santa Marta", sincelejo: "Sincelejo",
    soledad: "Soledad", tunja: "Tunja", valledupar: "Valledupar", villavicencio: "Villavicencio", yopal: "Yopal",
  },
  etapa: { diseno: "Diseño", licitacion: "Licitación", "obra-gris": "Obra gris", acabados: "Acabados" },
  m2: { "<200": "Menos de 200 m²", "200-1000": "200 – 1.000 m²", "1000-5000": "1.000 – 5.000 m²", ">5000": "Más de 5.000 m²" },
  intereses: {
    "porcelanato-gran-formato": "Porcelanato 60×120",
    "pisos-alto-transito": "Pisos alto tránsito",
    "revestimientos-mallas": "Revestimientos y mallas",
    fachadas: "Fachadas",
    "sanitarios-lavamanos": "Sanitarios y lavamanos",
  },
};
const UTMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;

const env = (k: string) => (Deno.env.get(k) ?? "").trim();

/** Clave con acceso total a la base: la antigua service_role o la nueva sb_secret_… (SUPABASE_SECRET_KEYS es un JSON). */
function claveSecreta() {
  try {
    const nuevas = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    const k = nuevas.default ?? Object.values(nuevas)[0];
    if (k) return k;
  } catch {
    // formato inesperado: se usa la clave antigua
  }
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

const db = createClient(env("SUPABASE_URL"), claveSecreta(), { auth: { persistSession: false } });

type Body = Record<string, unknown>;
type Resultado = { ok: boolean; error?: string; token?: string; campos?: Record<string, string[]> };

// ── Entrada ──────────────────────────────────────────────────────────────────

/** Solo los orígenes de LEAD_ALLOWED_ORIGINS (separados por coma); vacío = cualquiera. */
function cors(req: Request): Record<string, string> {
  const permitidos = env("LEAD_ALLOWED_ORIGINS").split(",").map((s) => s.trim().replace(/\/$/, "")).filter(Boolean);
  const origen = req.headers.get("origin") ?? "";
  const permitido = !permitidos.length ? "*" : permitidos.includes(origen) ? origen : "";
  return permitido
    ? {
        "Access-Control-Allow-Origin": permitido,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
        Vary: "Origin",
      }
    : {};
}

Deno.serve(async (req) => {
  const headers = { ...cors(req), "content-type": "application/json" };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (req.method !== "POST") return new Response(JSON.stringify({ ok: true, servicio: "leads-decortiles" }), { headers });

  let r: Resultado;
  try {
    const body = (await req.json()) as Body;
    r = body?.paso === 2 ? await perfilamiento(body) : await registro(body ?? {});
  } catch (e) {
    console.error(e);
    r = { ok: false, error: ERROR_GENERICO };
  }
  return new Response(JSON.stringify(r), { status: r.ok ? 200 : 400, headers });
});

// ── Paso 1: registro ─────────────────────────────────────────────────────────

async function registro(b: Body): Promise<Resultado> {
  // Honeypot lleno → bot. Respondemos "ok" para no darle pistas, pero no guardamos nada.
  if (b.sitio_web) return { ok: true };
  if (!(Number(b.ms) >= MS_MINIMO)) return { ok: false, error: "No pudimos validar el envío. Intenta de nuevo." };

  const lead = {
    nombre: limpio(b.nombre, 80),
    email: texto(b.email, 120).toLowerCase(),
    celular: celular(b.celular),
    perfil: texto(b.perfil, 20),
    ciudad: ciudad(b.ciudad),
  };
  const campos: Record<string, string[]> = {};
  if (lead.nombre.length < 2) campos.nombre = ["Escribe tu nombre"];
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) campos.email = ["Revisa el correo"];
  if (!lead.celular) campos.celular = ["Escribe un celular de 10 dígitos (ej. 312 345 6789)"];
  if (!ETIQUETAS.perfil[lead.perfil]) campos.perfil = ["Elige tu perfil"];
  if (lead.ciudad.length < 2) campos.ciudad = ["Elige o escribe tu ciudad"];
  if (b.autorizacion !== true) campos.autorizacion = ["Necesitamos tu autorización para escribirte"];
  if (Object.keys(campos).length) return { ok: false, error: "Revisa los campos marcados.", campos };

  const hace10min = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db.from("leads").select("id", { count: "exact", head: true }).eq("email", lead.email).gte("creado", hace10min);
  if ((count ?? 0) >= ENVIOS_POR_CORREO) {
    return { ok: false, error: "Demasiados intentos. Espera unos minutos." };
  }

  const t = (b.tracking && typeof b.tracking === "object" ? b.tracking : {}) as Body;
  const tracking = Object.fromEntries(UTMS.map((k) => [k, texto(t[k], 300) || null]));
  const pagina = texto(b.pagina, 500) || null;

  const { data, error } = await db.from("leads").insert({ ...lead, ...tracking, pagina }).select("id, token").single();
  if (error) {
    console.error("insert:", error);
    return { ok: false, error: ERROR_GENERICO };
  }

  EdgeRuntime.waitUntil(
    (async () => {
      const brevo = await registrarEnBrevo(lead, tracking).catch((e) => `error: ${String(e?.message ?? e).slice(0, 300)}`);
      await db.from("leads").update({ brevo }).eq("id", data.id);
      const wa = `https://wa.me/${lead.celular.replace(/\D/g, "")}`;
      await notificar(`Lead ${ETIQUETAS.perfil[lead.perfil]} · ${nombreCiudad(lead.ciudad)} · ${lead.nombre}`, lead.email, [
        ["Nombre", lead.nombre],
        ["Correo", lead.email],
        ["Celular", lead.celular],
        ["WhatsApp", wa],
        ["Perfil", ETIQUETAS.perfil[lead.perfil]],
        ["Ciudad", nombreCiudad(lead.ciudad)],
        ...UTMS.filter((k) => !["gclid", "fbclid"].includes(k)).map((k): [string, string | null] => [k, tracking[k]]),
        ["gclid", tracking.gclid ? "sí" : null],
        ["fbclid", tracking.fbclid ? "sí" : null],
        ["Página", pagina],
        ["Brevo", brevo],
      ]).catch((e) => console.error("notificación:", e));
    })(),
  );

  return { ok: true, token: `${data.id}.${data.token}` };
}

// ── Paso 2: perfilamiento (opcional) ─────────────────────────────────────────

async function perfilamiento(b: Body): Promise<Resultado> {
  const email = texto(b.email, 120).toLowerCase();
  const [id, token] = texto(b.token, 300).split(".");
  const expirado = { ok: false, error: "La sesión expiró. Tus datos principales ya quedaron registrados." };
  if (!esUuid(id) || !esUuid(token)) return expirado;

  const datos = {
    empresa: limpio(b.empresa, 120) || null,
    etapa: ETIQUETAS.etapa[String(b.etapa)] ? String(b.etapa) : null,
    m2: ETIQUETAS.m2[String(b.m2)] ? String(b.m2) : null,
    intereses: (Array.isArray(b.intereses) ? b.intereses : []).filter((i) => ETIQUETAS.intereses[i]) as string[],
  };
  if (!datos.empresa && !datos.etapa && !datos.m2 && !datos.intereses.length) return { ok: true };

  const desde = new Date(Date.now() - TOKEN_HORAS * 3600 * 1000).toISOString();
  const { data, error } = await db
    .from("leads")
    .update({ ...datos, intereses: datos.intereses.length ? datos.intereses : null })
    .eq("id", id)
    .eq("token", token)
    .eq("email", email)
    .gte("creado", desde)
    .select("id");
  if (error) {
    console.error("update paso 2:", error);
    return { ok: false, error: "No pudimos guardar. Tus datos principales ya quedaron registrados." };
  }
  if (!data?.length) return expirado;

  EdgeRuntime.waitUntil(
    (async () => {
      const cfg = configBrevo();
      if (cfg.apiKey) {
        await upsertContacto(cfg.apiKey, email, compactar({
          EMPRESA: datos.empresa,
          ETAPA: datos.etapa,
          M2_RANGO: datos.m2,
          INTERESES: datos.intereses.join(","),
        })).catch(async (e) => {
          await db.from("leads").update({ brevo: `error paso 2: ${String(e?.message ?? e).slice(0, 300)}` }).eq("id", id);
        });
      }
      await notificar(`Perfil completado · ${datos.empresa || email}`, email, [
        ["Correo", email],
        ["Empresa", datos.empresa],
        ["Etapa", datos.etapa && ETIQUETAS.etapa[datos.etapa]],
        ["m² estimados", datos.m2 && ETIQUETAS.m2[datos.m2]],
        ["Intereses", datos.intereses.map((x) => ETIQUETAS.intereses[x]).join(", ")],
      ]).catch((e) => console.error("notificación paso 2:", e));
    })(),
  );
  return { ok: true };
}

// ── Brevo ────────────────────────────────────────────────────────────────────

function configBrevo() {
  const listId = Number(env("BREVO_LIST_ID"));
  return {
    apiKey: env("BREVO_API_KEY"),
    listId: listId > 0 ? listId : null,
    doiTemplateId: Number(env("BREVO_DOI_TEMPLATE_ID")) || null,
    notifyEmail: env("LEAD_NOTIFY_EMAIL"),
    sender: { email: env("BREVO_SENDER_EMAIL"), name: env("BREVO_SENDER_NAME") || "DECORTILES" },
    siteUrl: (env("SITE_URL") || "https://proyectos.decorcolombiatiles.com").replace(/\/$/, ""),
  };
}

/** Devuelve el estado que se guarda en la columna `brevo`. */
async function registrarEnBrevo(lead: { nombre: string; email: string; celular: string; perfil: string; ciudad: string }, t: Record<string, string | null>) {
  const cfg = configBrevo();
  if (!cfg.apiKey || !cfg.listId) return "sin configurar";
  const atributos = compactar({
    NOMBRE: lead.nombre,
    CELULAR: lead.celular,
    PERFIL: lead.perfil,
    CIUDAD: lead.ciudad,
    UTM_SOURCE: t.utm_source,
    UTM_CAMPAIGN: t.utm_campaign,
    FUENTE,
  });
  if (cfg.doiTemplateId) {
    // Double opt-in: guardamos los atributos ya; Brevo agrega a la lista cuando confirme.
    await upsertContacto(cfg.apiKey, lead.email, atributos);
    await llamarBrevo(cfg.apiKey, "/contacts/doubleOptinConfirmation", {
      email: lead.email,
      attributes: atributos,
      includeListIds: [cfg.listId],
      templateId: cfg.doiTemplateId,
      redirectionUrl: `${cfg.siteUrl}/confirmado/`,
    });
    return "ok (doble opt-in enviado)";
  }
  await upsertContacto(cfg.apiKey, lead.email, atributos, cfg.listId);
  return "ok";
}

function upsertContacto(apiKey: string, email: string, attributes: Record<string, string>, listId?: number | null) {
  return llamarBrevo(apiKey, "/contacts", { email, attributes, updateEnabled: true, ...(listId ? { listIds: [listId] } : {}) });
}

async function llamarBrevo(apiKey: string, ruta: string, body: unknown) {
  const res = await fetch(`https://api.brevo.com/v3${ruta}`, {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Brevo ${res.status}: ${(await res.text()).slice(0, 300)}`);
}

/** Aviso a ventas. Requiere LEAD_NOTIFY_EMAIL y un remitente verificado en Brevo. */
async function notificar(asunto: string, replyTo: string, filas: [string, string | null | undefined][]) {
  const cfg = configBrevo();
  if (!cfg.apiKey || !cfg.notifyEmail || !cfg.sender.email) return;
  const tr = filas
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#667;font:13px Arial,sans-serif;white-space:nowrap">${escapar(k)}</td><td style="padding:6px 0;font:14px Arial,sans-serif;color:#0a1424">${escapar(v!)}</td></tr>`,
    )
    .join("");
  await llamarBrevo(cfg.apiKey, "/smtp/email", {
    sender: cfg.sender,
    to: [{ email: cfg.notifyEmail }],
    replyTo: { email: replyTo },
    subject: asunto,
    htmlContent: `<div style="max-width:560px"><h2 style="font:bold 18px Arial,sans-serif;color:#0a1424;margin:0 0 12px">${escapar(asunto)}</h2><table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${tr}</table></div>`,
  });
}

// ── Utilidades ───────────────────────────────────────────────────────────────

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");

/** Quita caracteres de control y signos que no tienen por qué estar en un nombre o empresa. */
const limpio = (v: unknown, max: number) =>
  texto(v, 1000).replace(/[\u0000-\u001f\u007f<>{}]/g, "").replace(/\s+/g, " ").trim().slice(0, max);

/** Celular colombiano: 10 dígitos que empiezan por 3, con o sin +57. Devuelve "+573XXXXXXXXX" o "". */
function celular(v: unknown) {
  const d = String(v ?? "").replace(/\D/g, "").replace(/^57(?=3\d{9}$)/, "");
  return /^3\d{9}$/.test(d) ? `+57${d}` : "";
}

const sinTildes = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/** Valor de la lista ("medellin") o el nombre escrito por el cliente; "" si no es válido. */
function ciudad(v: unknown) {
  const t = limpio(v, 60);
  if (!t || t === "otra") return "";
  const conocida = Object.entries(ETIQUETAS.ciudad).find(([k, label]) => k === sinTildes(t) || sinTildes(label) === sinTildes(t));
  return conocida?.[0] ?? t;
}

const nombreCiudad = (c: string) => ETIQUETAS.ciudad[c] ?? c;

const esUuid = (s: string | undefined) => !!s && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s);

/** Quita atributos vacíos para no borrar en Brevo datos que ya existían. */
const compactar = (a: Record<string, string | null | undefined>) =>
  Object.fromEntries(Object.entries(a).filter((e): e is [string, string] => Boolean(e[1])));

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
