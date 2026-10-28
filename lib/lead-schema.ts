// Esquemas zod compartidos por el formulario (cliente) y /api/lead (servidor).
import { z } from "zod";
import { PERFILES_PAUTA } from "@/content/perfiles";

export const OPCIONES = {
  perfil: [
    { value: "constructora", label: "Constructora" },
    { value: "arquitecto", label: "Arquitecto/a" },
    { value: "disenador", label: "Diseñador/a" },
    { value: "contratista", label: "Contratista" },
  ],
  // Primero las dos sedes; luego las principales ciudades en orden alfabético.
  // "otra" abre un campo de texto y se guarda lo que escriba el cliente.
  ciudad: [
    { value: "medellin", label: "Medellín" },
    { value: "barranquilla", label: "Barranquilla" },
    { value: "armenia", label: "Armenia" },
    { value: "bello", label: "Bello" },
    { value: "bogota", label: "Bogotá" },
    { value: "bucaramanga", label: "Bucaramanga" },
    { value: "cali", label: "Cali" },
    { value: "cartagena", label: "Cartagena" },
    { value: "chia", label: "Chía" },
    { value: "cucuta", label: "Cúcuta" },
    { value: "envigado", label: "Envigado" },
    { value: "florencia", label: "Florencia" },
    { value: "ibague", label: "Ibagué" },
    { value: "itagui", label: "Itagüí" },
    { value: "manizales", label: "Manizales" },
    { value: "monteria", label: "Montería" },
    { value: "neiva", label: "Neiva" },
    { value: "pasto", label: "Pasto" },
    { value: "pereira", label: "Pereira" },
    { value: "popayan", label: "Popayán" },
    { value: "puerto-colombia", label: "Puerto Colombia" },
    { value: "quibdo", label: "Quibdó" },
    { value: "riohacha", label: "Riohacha" },
    { value: "rionegro", label: "Rionegro" },
    { value: "sabaneta", label: "Sabaneta" },
    { value: "san-andres", label: "San Andrés" },
    { value: "santa-marta", label: "Santa Marta" },
    { value: "sincelejo", label: "Sincelejo" },
    { value: "soledad", label: "Soledad" },
    { value: "tunja", label: "Tunja" },
    { value: "valledupar", label: "Valledupar" },
    { value: "villavicencio", label: "Villavicencio" },
    { value: "yopal", label: "Yopal" },
    { value: "otra", label: "Otra (escríbela)" },
  ],
  etapa: [
    { value: "diseno", label: "Diseño" },
    { value: "licitacion", label: "Licitación" },
    { value: "obra-gris", label: "Obra gris" },
    { value: "acabados", label: "Acabados" },
  ],
  m2: [
    { value: "<200", label: "Menos de 200 m²" },
    { value: "200-1000", label: "200 – 1.000 m²" },
    { value: "1000-5000", label: "1.000 – 5.000 m²" },
    { value: ">5000", label: "Más de 5.000 m²" },
  ],
  intereses: [
    { value: "porcelanato-gran-formato", label: "Porcelanato 60×120" },
    { value: "pisos-alto-transito", label: "Pisos alto tránsito" },
    { value: "revestimientos-mallas", label: "Revestimientos y mallas" },
    { value: "fachadas", label: "Fachadas" },
    { value: "sanitarios-lavamanos", label: "Sanitarios y lavamanos" },
  ],
} as const;

type Opts = readonly { value: string }[];
const valores = <T extends Opts>(o: T) =>
  o.map((x) => x.value) as unknown as [T[number]["value"], ...T[number]["value"][]];

export const etiqueta = (grupo: keyof typeof OPCIONES, value: string) =>
  (OPCIONES[grupo] as readonly { value: string; label: string }[]).find((o) => o.value === value)?.label ?? value;

// Quita caracteres de control y signos que no tienen por qué estar en un nombre o empresa.
const limpio = (max: number) =>
  z
    .string()
    .transform((s) => s.replace(/[\u0000-\u001f\u007f<>{}]/g, "").replace(/\s+/g, " ").trim())
    .pipe(z.string().max(max));

const sinTildes = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

/**
 * Ciudad: el valor de la lista (p. ej. "medellin") o el nombre que escribió el cliente en "Otra".
 * Si lo escrito coincide con una ciudad de la lista ("medellin", "Medellín"), se guarda su valor.
 */
export function normalizarCiudad(s: string) {
  const t = s.replace(/[\u0000-\u001f\u007f<>{}]/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
  const conocida = OPCIONES.ciudad.find((o) => o.value !== "otra" && (o.value === sinTildes(t) || sinTildes(o.label) === sinTildes(t)));
  return conocida?.value ?? t;
}

export const esCiudadDeLista = (v: string) => OPCIONES.ciudad.some((o) => o.value === v && o.value !== "otra");

/** Celular colombiano: 10 dígitos que empiezan por 3, con o sin +57. Devuelve "+573XXXXXXXXX". */
export const celularSchema = z
  .string()
  .transform((s) => s.replace(/\D/g, "").replace(/^57(?=3\d{9}$)/, ""))
  .refine((d) => /^3\d{9}$/.test(d), "Escribe un celular de 10 dígitos (ej. 312 345 6789)")
  .transform((d) => `+57${d}`);

export const trackingSchema = z
  .object({
    utm_source: z.string().max(120),
    utm_medium: z.string().max(120),
    utm_campaign: z.string().max(200),
    utm_content: z.string().max(200),
    utm_term: z.string().max(200),
    gclid: z.string().max(300),
    fbclid: z.string().max(300),
  })
  .partial();

export type Tracking = z.infer<typeof trackingSchema>;

/** Campos del paso 1 (lo que valida el formulario en el navegador). */
export const leadCamposSchema = z.object({
  nombre: limpio(80).pipe(z.string().min(2, "Escribe tu nombre")),
  email: z.string().trim().toLowerCase().email("Revisa el correo").max(120),
  celular: celularSchema,
  perfil: z.enum(PERFILES_PAUTA, { errorMap: () => ({ message: "Elige tu perfil" }) }),
  ciudad: z
    .string()
    .transform(normalizarCiudad)
    .refine((c) => c.length >= 2 && c !== "otra", "Elige o escribe tu ciudad"),
  autorizacion: z.literal(true, { errorMap: () => ({ message: "Necesitamos tu autorización para escribirte" }) }),
});

/** Payload completo del paso 1 que llega a /api/lead. */
export const leadSchema = leadCamposSchema.extend({
  paso: z.literal(1),
  /** Honeypot: debe llegar vacío. */
  sitio_web: z.string().max(200).optional(),
  /** Milisegundos que tardó en llenarse el formulario. */
  ms: z.number().int().nonnegative(),
  tracking: trackingSchema.optional(),
  /** Id del evento de conversión (deduplicación con Conversions API). */
  eventId: z.string().max(64).optional(),
});

/** Paso 2 opcional: perfilamiento. Requiere el token devuelto en el paso 1. */
export const perfilamientoSchema = z.object({
  paso: z.literal(2),
  token: z.string().max(300),
  email: z.string().trim().toLowerCase().email().max(120),
  empresa: limpio(120).optional(),
  etapa: z.enum(valores(OPCIONES.etapa)).optional(),
  m2: z.enum(valores(OPCIONES.m2)).optional(),
  intereses: z.array(z.enum(valores(OPCIONES.intereses))).max(OPCIONES.intereses.length).optional(),
});

export type LeadCampos = z.infer<typeof leadCamposSchema>;
export type LeadPayload = z.infer<typeof leadSchema>;
export type PerfilamientoPayload = z.infer<typeof perfilamientoSchema>;

/** Tiempo mínimo de llenado; por debajo se asume bot. */
export const MS_MINIMO = 2500;
