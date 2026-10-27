// Cliente mínimo de la API de Brevo (v3). Solo se importa desde el servidor.
import "server-only";

const API = "https://api.brevo.com/v3";

export const FUENTE = "landing-proyectos";

export type Atributos = Record<string, string>;

export class BrevoError extends Error {
  constructor(
    public status: number,
    public detalle: string,
  ) {
    super(`Brevo ${status}: ${detalle}`);
  }
}

export function configBrevo() {
  const apiKey = process.env.BREVO_API_KEY ?? "";
  const listId = Number(process.env.BREVO_LIST_ID);
  const doiTemplateId = Number(process.env.BREVO_DOI_TEMPLATE_ID) || null;
  return {
    apiKey,
    listId: Number.isFinite(listId) && listId > 0 ? listId : null,
    doiTemplateId,
    notifyEmail: process.env.LEAD_NOTIFY_EMAIL ?? "",
    sender: {
      email: process.env.BREVO_SENDER_EMAIL ?? "",
      name: process.env.BREVO_SENDER_NAME || "DECORTILES",
    },
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://proyectos.decorcolombiatiles.com",
  };
}

async function llamar(apiKey: string, ruta: string, body: unknown) {
  const res = await fetch(`${API}${ruta}`, {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
    cache: "no-store",
  });
  if (!res.ok) throw new BrevoError(res.status, (await res.text()).slice(0, 500));
}

/**
 * Crea o actualiza el contacto. Con `listId` lo agrega a la lista; sin él solo
 * guarda atributos (modo double opt-in: la lista se asigna al confirmar).
 */
export function upsertContacto(apiKey: string, email: string, attributes: Atributos, listId?: number | null) {
  return llamar(apiKey, "/contacts", {
    email,
    attributes,
    updateEnabled: true,
    ...(listId ? { listIds: [listId] } : {}),
  });
}

export function enviarDobleOptin(
  apiKey: string,
  email: string,
  attributes: Atributos,
  listId: number,
  templateId: number,
  redirectionUrl: string,
) {
  return llamar(apiKey, "/contacts/doubleOptinConfirmation", {
    email,
    attributes,
    includeListIds: [listId],
    templateId,
    redirectionUrl,
  });
}

export function enviarTransaccional(
  apiKey: string,
  mensaje: { sender: { email: string; name: string }; to: string; replyTo?: string; subject: string; html: string },
) {
  return llamar(apiKey, "/smtp/email", {
    sender: mensaje.sender,
    to: [{ email: mensaje.to }],
    ...(mensaje.replyTo ? { replyTo: { email: mensaje.replyTo } } : {}),
    subject: mensaje.subject,
    htmlContent: mensaje.html,
  });
}

const escapar = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** HTML simple de la notificación interna para ventas. */
export function htmlNotificacion(titulo: string, filas: [string, string | undefined][]) {
  const tr = filas
    .filter(([, v]) => v)
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 12px 6px 0;color:#667;font:13px Arial,sans-serif;white-space:nowrap">${escapar(k)}</td><td style="padding:6px 0;font:14px Arial,sans-serif;color:#0a1424">${escapar(v!)}</td></tr>`,
    )
    .join("");
  return `<div style="max-width:560px"><h2 style="font:bold 18px Arial,sans-serif;color:#0a1424;margin:0 0 12px">${escapar(titulo)}</h2><table cellpadding="0" cellspacing="0" style="border-collapse:collapse">${tr}</table></div>`;
}
