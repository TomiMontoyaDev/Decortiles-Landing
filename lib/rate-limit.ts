// Rate limit en memoria por IP (ventana deslizante).
// En Vercel cada instancia tiene su propia memoria, así que es un freno básico,
// no un límite global. TODO opcional: migrar a Upstash Redis si llega spam real.

const VENTANA_MS = 10 * 60 * 1000;
const MAXIMO = 6;
const registros = new Map<string, number[]>();

export function permitido(ip: string): boolean {
  const ahora = Date.now();
  const recientes = (registros.get(ip) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAXIMO) {
    registros.set(ip, recientes);
    return false;
  }
  recientes.push(ahora);
  registros.set(ip, recientes);
  if (registros.size > 5000) {
    for (const [k, v] of registros) if (v.every((t) => ahora - t >= VENTANA_MS)) registros.delete(k);
  }
  return true;
}
