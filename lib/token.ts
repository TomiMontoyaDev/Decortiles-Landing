// Token firmado que se entrega tras el paso 1 y autoriza el paso 2 (perfilamiento)
// para ese mismo correo durante 2 horas. Evita que cualquiera edite contactos ajenos.
import { createHmac, timingSafeEqual } from "node:crypto";

const VIGENCIA_MS = 2 * 60 * 60 * 1000;

function clave() {
  const base = process.env.LEAD_TOKEN_SECRET || process.env.BREVO_API_KEY || "dev-solo-local";
  return `decortiles-lead:${base}`;
}

function firmar(datos: string) {
  return createHmac("sha256", clave()).update(datos).digest("base64url");
}

export function crearToken(email: string) {
  const exp = Date.now() + VIGENCIA_MS;
  return `${exp}.${firmar(`${email}|${exp}`)}`;
}

export function verificarToken(token: string, email: string) {
  const [expStr, firma] = token.split(".");
  const exp = Number(expStr);
  if (!firma || !Number.isFinite(exp) || exp < Date.now()) return false;
  const esperada = Buffer.from(firmar(`${email}|${exp}`));
  const recibida = Buffer.from(firma);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
