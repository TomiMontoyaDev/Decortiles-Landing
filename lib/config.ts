// Configuración de despliegue compartida por cliente y servidor.
//
// - Modo servidor (Vercel / Render Web Service): BASE_PATH vacío y el formulario
//   envía a /api/lead del mismo dominio.
// - Modo estático (GitHub Pages / Render Static Site, STATIC_EXPORT=1): el sitio vive
//   bajo NEXT_PUBLIC_BASE_PATH (p. ej. /Decortiles-Landing) y el formulario envía a
//   NEXT_PUBLIC_LEAD_ENDPOINT (la /api/lead de un despliegue con servidor).

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const ES_ESTATICO = process.env.NEXT_PUBLIC_STATIC_EXPORT === "1";
export const LEAD_ENDPOINT = process.env.NEXT_PUBLIC_LEAD_ENDPOINT || `${BASE_PATH}/api/lead`;

/** next/image no antepone el basePath a `src`: se hace aquí. */
export const asset = (src: string) => `${BASE_PATH}${src}`;
