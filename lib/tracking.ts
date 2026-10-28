// Eventos de conversión para Meta Pixel y GA4 / Google Ads.
// Si las variables NEXT_PUBLIC_* no están definidas, no se carga ningún script
// (ver components/Analytics.tsx) y estas funciones no hacen nada.

type Cola = ((...args: unknown[]) => void) & { queue?: unknown[]; callMethod?: unknown };

declare global {
  interface Window {
    fbq?: Cola;
    _fbq?: Cola;
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    __dtTracking?: boolean;
  }
}

export const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "";
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
/** Formato "AW-123456789/AbCdEfGhIj" (id de conversión / etiqueta). */
export const GADS_CONVERSION = process.env.NEXT_PUBLIC_GADS_CONVERSION ?? "";
export const GADS_ID = GADS_CONVERSION.split("/")[0] ?? "";

/**
 * Define los stubs de `fbq` y `gtag` (los eventos quedan en cola hasta que la
 * librería carga) y hace el init una sola vez. Idempotente.
 */
function iniciar() {
  if (typeof window === "undefined" || window.__dtTracking) return;
  window.__dtTracking = true;

  if (PIXEL_ID && !window.fbq) {
    const fbq: Cola = function (...args: unknown[]) {
      // Mismo contrato que el snippet oficial de Meta.
      if (typeof fbq.callMethod === "function") (fbq.callMethod as (...a: unknown[]) => void)(...args);
      else fbq.queue!.push(args);
    };
    Object.assign(fbq, { push: fbq, loaded: true, version: "2.0", queue: [] });
    window.fbq = window._fbq = fbq;
    fbq("init", PIXEL_ID);
    fbq("track", "PageView");
  }

  if ((GA_ID || GADS_ID) && !window.gtag) {
    window.dataLayer = window.dataLayer || [];
    // gtag.js necesita el objeto `arguments`, no un array.
    window.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag("js", new Date());
    if (GA_ID) window.gtag("config", GA_ID);
    if (GADS_ID) window.gtag("config", GADS_ID);
  }
}

function fbq(...args: unknown[]) {
  if (!PIXEL_ID || typeof window === "undefined") return;
  iniciar();
  window.fbq?.(...args);
}

function gtag(...args: unknown[]) {
  if (!(GA_ID || GADS_ID) || typeof window === "undefined") return;
  iniciar();
  window.gtag?.(...args);
}

export function nuevoEventId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function trackViewContent(perfil: string) {
  fbq("track", "ViewContent", { content_name: "landing-proyectos", content_category: perfil });
  gtag("event", "view_item", { item_category: perfil, page_type: "landing-proyectos" });
}

export function trackLead(perfil: string, eventId: string) {
  fbq("track", "Lead", { content_category: perfil }, { eventID: eventId });
  gtag("event", "generate_lead", { perfil, event_id: eventId });
  if (GADS_CONVERSION) gtag("event", "conversion", { send_to: GADS_CONVERSION, transaction_id: eventId });
}

/** Clic en "Abrir catálogo" después del registro. */
export function trackCatalogo(perfil: string, origen: string) {
  fbq("track", "ViewContent", { content_name: "catalogo-digital", content_category: perfil });
  gtag("event", "select_content", { content_type: "catalogo-digital", perfil, origen });
}
