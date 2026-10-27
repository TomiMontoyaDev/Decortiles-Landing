// Captura de UTMs y click ids. Se guardan en sessionStorage para que sobrevivan
// si el usuario navega a /politica-de-datos y vuelve.
import type { Tracking } from "./lead-schema";

const CLAVES = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "gclid", "fbclid"] as const;
const STORAGE_KEY = "dt_tracking";

function leerGuardado(): Tracking {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Tracking;
  } catch {
    return {};
  }
}

/** Lee la URL actual, la mezcla con lo guardado (la URL gana) y persiste. */
export function capturarTracking(): Tracking {
  const params = new URLSearchParams(window.location.search);
  const actual: Tracking = {};
  for (const k of CLAVES) {
    const v = params.get(k);
    if (v) actual[k] = v.slice(0, 300);
  }
  const combinado = { ...leerGuardado(), ...actual };
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(combinado));
  } catch {
    // Modo privado o storage bloqueado: seguimos con lo que hay en memoria.
  }
  return combinado;
}
