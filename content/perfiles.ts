// Copy por perfil de pauta (?perfil=...). Todo el texto de la landing que cambia
// según el público vive aquí: se edita sin tocar componentes.
//
// Promesas marcadas con "TODO cliente" deben confirmarse con DECORTILES antes de
// lanzar campañas (ver README › TODO del cliente).

export const PERFILES_PAUTA = ["constructora", "arquitecto", "disenador", "contratista"] as const;
export type PerfilPauta = (typeof PERFILES_PAUTA)[number];
export type PerfilId = PerfilPauta | "general";

export interface Beneficio {
  titulo: string;
  texto: string;
}

export interface PerfilCopy {
  id: PerfilId;
  /** Etiqueta corta sobre el H1. */
  etiqueta: string;
  /** H1 en dos líneas; la segunda va en el color de acento. */
  h1: [string, string];
  subtitulo: string;
  cta: string;
  /** "Qué recibes al suscribirte", ordenado según lo que más le importa al perfil. */
  beneficios: Beneficio[];
  /** Título del bloque final con el formulario repetido. */
  cierre: string;
  /** Mensaje prellenado de WhatsApp. */
  whatsapp: string;
}

const B = {
  tendencias: {
    titulo: "Tendencias del mes",
    texto: "Qué formatos, tonos y acabados se están especificando en obra. Un correo al mes, sin relleno.",
  },
  stock: {
    titulo: "Alertas de stock y llegadas",
    texto: "Qué entró a bodega en Medellín y Barranquilla, cuántos m² hay y qué se está acabando.",
  },
  // TODO cliente: confirmar que existen precios por volumen y desde qué metraje aplican.
  volumen: {
    titulo: "Precios por volumen",
    texto: "Tarifa de proyecto para pedidos de obra. Cotizas por metraje total, no por caja suelta.",
  },
  fichas: {
    titulo: "Fichas técnicas",
    texto: "Formato, m² y kg por caja, piezas, acabado y uso. Listas para pliego, presupuesto o interventoría.",
  },
} satisfies Record<string, Beneficio>;

export const PERFILES: Record<PerfilId, PerfilCopy> = {
  general: {
    id: "general",
    etiqueta: "Para profesionales de obra y diseño",
    h1: ["Acabados con stock.", "No con promesas."],
    subtitulo: "Más de 90 referencias de importación directa, con stock en Medellín y Barranquilla.",
    cta: "Recibir stock y tendencias",
    beneficios: [B.stock, B.tendencias, B.fichas, B.volumen],
    cierre: "Deja de cotizar material que no existe.",
    whatsapp: "Hola DECORTILES, vengo de la página de proyectos. Quiero cotizar acabados para un proyecto.",
  },
  constructora: {
    id: "constructora",
    etiqueta: "Para constructoras",
    h1: ["Tu obra no espera barcos.", "El material ya llegó."],
    // TODO cliente: confirmar la promesa de "un solo lote para toda la torre".
    subtitulo: "Porcelanato 60×120 con inventario local. Un solo lote para toda la torre.",
    cta: "Ver inventario disponible",
    beneficios: [B.stock, B.volumen, B.fichas, B.tendencias],
    cierre: "Cotiza contra inventario real, no contra un contenedor en altamar.",
    whatsapp:
      "Hola DECORTILES, soy de una constructora. Necesito cotizar acabados para un proyecto de ___ m² en ___.",
  },
  arquitecto: {
    id: "arquitecto",
    etiqueta: "Para arquitectos",
    h1: ["Tú especificas.", "Nosotros ya lo tenemos en bodega."],
    subtitulo: "Fichas técnicas y stock confirmado antes de que la referencia llegue al plano.",
    cta: "Recibir fichas técnicas",
    beneficios: [B.fichas, B.tendencias, B.stock, B.volumen],
    cierre: "Especifica algo que sí se pueda comprar el día de la obra.",
    whatsapp:
      "Hola DECORTILES, soy arquitecto/a. Estoy especificando acabados para un proyecto y necesito fichas técnicas y stock.",
  },
  disenador: {
    id: "disenador",
    etiqueta: "Para diseñadores de interiores",
    h1: ["La referencia que eliges", "es la que llega."],
    subtitulo: "Mosaicos, maderas cerámicas y gran formato con muestra física en showroom.",
    cta: "Ver lo que se está usando",
    beneficios: [B.tendencias, B.stock, B.fichas, B.volumen],
    cierre: "Que el render y la obra terminada se vean igual.",
    whatsapp:
      "Hola DECORTILES, soy diseñador/a de interiores. Quiero ver muestras y saber qué hay en stock para un proyecto.",
  },
  contratista: {
    id: "contratista",
    etiqueta: "Para contratistas e instaladores",
    h1: ["Pides. Separas. Instalas.", "Sin vueltas."],
    // TODO cliente: confirmar precios por volumen y condiciones de despacho.
    subtitulo: "Precio por volumen y despacho desde Medellín o Barranquilla.",
    cta: "Recibir precios por volumen",
    beneficios: [B.volumen, B.stock, B.fichas, B.tendencias],
    cierre: "Material listo cuando la cuadrilla está lista.",
    whatsapp: "Hola DECORTILES, soy contratista. Necesito precio por volumen para ___ m² de ___.",
  },
};

export function resolverPerfil(valor: string | null | undefined): PerfilCopy {
  const v = (valor ?? "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return (PERFILES_PAUTA as readonly string[]).includes(v) ? PERFILES[v as PerfilPauta] : PERFILES.general;
}

// Bloques Problema → Solución (iguales para todos los perfiles).
export const PROBLEMAS = [
  {
    problema: "La importación se demora. La obra no.",
    detalle: "Esperar un contenedor con la cuadrilla parada y el cronograma corriendo.",
    solucion: "Stock local",
    respuesta: "Material en bodega en Medellín y Barranquilla. Ves la pieza, separas y despachas.",
  },
  {
    problema: "El lote no coincide.",
    detalle: "Compras en dos tandas y el tono cambia entre un piso y el siguiente.",
    // TODO cliente: confirmar que se separa el metraje completo del mismo lote.
    solucion: "Un despacho para todo el proyecto",
    respuesta: "Separamos el metraje completo del mismo lote desde el inicio.",
  },
  {
    problema: "Nadie responde con datos.",
    detalle: "Pides una ficha técnica y te mandan un catálogo de 80 páginas.",
    // TODO cliente: confirmar alcance del acompañamiento (¿visita a obra o solo asesoría?).
    solucion: "Acompañamiento en especificación",
    respuesta: "Formato, rendimiento por caja, uso y alternativas con stock real. Por WhatsApp o en showroom.",
  },
] as const;
