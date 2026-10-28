// Configuración de despliegue compartida por cliente y servidor.
//
// - Modo estático (GitHub Pages / Render Static Site, STATIC_EXPORT=1): el sitio vive
//   bajo NEXT_PUBLIC_BASE_PATH (p. ej. /Decortiles-Landing). El formulario envía a la
//   Edge Function `lead` de Supabase y el dashboard /admin/ lee de la misma base.
// - Modo servidor (Vercel / Render Web Service): sin Supabase, el formulario envía a
//   /api/lead del mismo dominio.

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const ES_ESTATICO = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";

/**
 * https://<proyecto>.supabase.co y su clave pública: la nueva "publishable" (sb_publishable_…)
 * o la antigua "anon". Ambas pueden ir en el navegador.
 */
export const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const LEAD_ENDPOINT =
  process.env.NEXT_PUBLIC_LEAD_ENDPOINT || (SUPABASE_URL ? `${SUPABASE_URL}/functions/v1/lead` : `${BASE_PATH}/api/lead`);

/** next/image no antepone el basePath a `src`: se hace aquí. */
export const asset = (src: string) => `${BASE_PATH}${src}`;
