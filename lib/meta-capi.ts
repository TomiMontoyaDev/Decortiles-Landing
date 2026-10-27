// Meta Conversions API (servidor). TODO opcional: queda listo pero apagado.
// Se activa al definir META_CAPI_TOKEN (y NEXT_PUBLIC_META_PIXEL_ID). Antes de
// activarlo en producción, probar con META_CAPI_TEST_CODE en el Events Manager.
// El `eventId` es el mismo que usa el Pixel en el navegador → Meta deduplica.
import "server-only";
import { createHash } from "node:crypto";

const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function enviarLeadMeta(datos: {
  eventId: string;
  email: string;
  celular: string;
  perfil: string;
  url: string;
  ip?: string;
  userAgent?: string;
  fbclid?: string;
  fbp?: string;
}) {
  const token = process.env.META_CAPI_TOKEN;
  const pixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!token || !pixel) return;

  const ahora = Math.floor(Date.now() / 1000);
  const body = {
    data: [
      {
        event_name: "Lead",
        event_time: ahora,
        event_id: datos.eventId,
        action_source: "website",
        event_source_url: datos.url,
        user_data: {
          em: [sha256(datos.email)],
          ph: [sha256(datos.celular.replace(/\D/g, ""))],
          client_ip_address: datos.ip,
          client_user_agent: datos.userAgent,
          ...(datos.fbclid ? { fbc: `fb.1.${ahora * 1000}.${datos.fbclid}` } : {}),
          ...(datos.fbp ? { fbp: datos.fbp } : {}),
        },
        custom_data: { content_category: datos.perfil },
      },
    ],
    ...(process.env.META_CAPI_TEST_CODE ? { test_event_code: process.env.META_CAPI_TEST_CODE } : {}),
  };

  const res = await fetch(`https://graph.facebook.com/v21.0/${pixel}/events?access_token=${token}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) console.error("[meta-capi]", res.status, (await res.text()).slice(0, 300));
}
