// Cliente de Supabase para el navegador (solo lo usa el dashboard /admin/).
// Con la clave anon solo se puede iniciar sesión: los datos los protege RLS (supabase/schema.sql).
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./config";

let cliente: SupabaseClient | null = null;

/** null si faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY. */
export function supabase() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  return (cliente ??= createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { storageKey: "decortiles-admin" } }));
}

export const ESTADOS = [
  { value: "nuevo", label: "Nuevo" },
  { value: "contactado", label: "Contactado" },
  { value: "cotizado", label: "Cotizado" },
  { value: "ganado", label: "Ganado" },
  { value: "descartado", label: "Descartado" },
] as const;

export type Lead = {
  id: string;
  creado: string;
  nombre: string;
  email: string;
  celular: string;
  perfil: string;
  ciudad: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  pagina: string | null;
  empresa: string | null;
  etapa: string | null;
  m2: string | null;
  intereses: string[] | null;
  estado: string;
  brevo: string | null;
};

export const COLUMNAS_LEAD =
  "id,creado,nombre,email,celular,perfil,ciudad,utm_source,utm_medium,utm_campaign,utm_content,utm_term,pagina,empresa,etapa,m2,intereses,estado,brevo";
