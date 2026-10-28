// Copy por perfil de pauta (?perfil=...). Todo el texto de la landing que cambia
// según el público vive aquí: se edita sin tocar componentes.
//
// Oferta (gerencia, 28/10/2026): el registro da acceso al catálogo digital. La landing no
// promete stock, lotes ni despachos y no enlaza a WhatsApp.

export const PERFILES_PAUTA = ["constructora", "arquitecto", "disenador", "contratista"] as const;
export type PerfilPauta = (typeof PERFILES_PAUTA)[number];
export type PerfilId = PerfilPauta | "general";

export interface PerfilCopy {
  id: PerfilId;
  /** Etiqueta corta sobre el H1. */
  etiqueta: string;
  /** H1 en dos líneas; la segunda va en el color de acento. */
  h1: [string, string];
  subtitulo: string;
  cta: string;
  /** Título del bloque final con el formulario repetido. */
  cierre: string;
}

// Texto aprobado por gerencia, igual para todos los perfiles.
const H1: [string, string] = ["Tu próximo proyecto empieza", "con una buena selección de materiales."];
const SUBTITULO =
  "Recibe nuestro catálogo digital de porcelanatos, pisos y revestimientos. Explora diseños, formatos y referencias para tu proyecto.";
const CTA = "Recibir catálogo";

export const PERFILES: Record<PerfilId, PerfilCopy> = {
  general: {
    id: "general",
    etiqueta: "Catálogo digital",
    h1: H1,
    subtitulo: SUBTITULO,
    cta: CTA,
    cierre: "Todas las referencias, en un solo catálogo.",
  },
  constructora: {
    id: "constructora",
    etiqueta: "Catálogo digital · constructoras",
    h1: H1,
    subtitulo: SUBTITULO,
    cta: CTA,
    cierre: "Elige los acabados de todo tu proyecto en un solo lugar.",
  },
  arquitecto: {
    id: "arquitecto",
    etiqueta: "Catálogo digital · arquitectos",
    h1: H1,
    subtitulo: SUBTITULO,
    cta: CTA,
    cierre: "Formatos y referencias listos para especificar.",
  },
  disenador: {
    id: "disenador",
    etiqueta: "Catálogo digital · diseño interior",
    h1: H1,
    subtitulo: SUBTITULO,
    cta: CTA,
    cierre: "Diseños y acabados para inspirar tu próximo espacio.",
  },
  contratista: {
    id: "contratista",
    etiqueta: "Catálogo digital · contratistas",
    h1: H1,
    subtitulo: SUBTITULO,
    cta: CTA,
    cierre: "Todas las referencias a mano para tu próxima obra.",
  },
};

export function resolverPerfil(valor: string | null | undefined): PerfilCopy {
  const v = (valor ?? "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  return (PERFILES_PAUTA as readonly string[]).includes(v) ? PERFILES[v as PerfilPauta] : PERFILES.general;
}

// Lo que trae el catálogo (igual para todos los perfiles).
export const CONTENIDO_CATALOGO = [
  {
    titulo: "Porcelanatos y pisos",
    texto: "Gran formato, maderas cerámicas y pisos de alto tránsito para interior y exterior.",
  },
  {
    titulo: "Revestimientos y mosaicos",
    texto: "Mallas, piedras y texturas para baños, cocinas, muros y fachadas.",
  },
  {
    titulo: "Fichas para especificar",
    texto: "Formato, rendimiento por caja, acabado y uso de cada referencia.",
  },
] as const;
