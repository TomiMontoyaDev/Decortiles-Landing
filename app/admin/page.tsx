import type { Metadata } from "next";
import Panel from "@/components/admin/Panel";

// Dashboard del equipo: login con Supabase y lista de leads. Todo corre en el navegador,
// así que funciona en el export estático.
export const metadata: Metadata = { title: "Panel de leads · DECORTILES" };

export default function Admin() {
  return <Panel />;
}
