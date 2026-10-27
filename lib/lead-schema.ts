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
  ciudad: [
    { value: "medellin", label: "Medellín" },
    { value: "barranquilla", label: "Barranquilla" },
    { value: "bogota", label: "Bogotá" },
    { value: "cali", label: "Cali" },
    { value: "otra", label: "Otra" },
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
  ciudad: z.enum(valores(OPCIONES.ciudad), { errorMap: () => ({ message: "Elige una ciudad" }) }),
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
