"use client";

import { createContext, useContext, useState } from "react";

// Estado compartido entre el formulario del hero y el del cierre: si el lead
// se registra en uno, el otro también pasa a "gracias".

export interface LeadRegistrado {
  nombre: string;
  email: string;
  token: string;
  /** Id del formulario que se envió (solo ese toma el foco al mostrar "gracias"). */
  origen: string;
}

interface Ctx {
  lead: LeadRegistrado | null;
  setLead: (l: LeadRegistrado) => void;
  perfilCompleto: boolean;
  setPerfilCompleto: (v: boolean) => void;
}

const LeadCtx = createContext<Ctx | null>(null);

export function LeadProvider({ children }: { children: React.ReactNode }) {
  const [lead, setLead] = useState<LeadRegistrado | null>(null);
  const [perfilCompleto, setPerfilCompleto] = useState(false);
  return (
    <LeadCtx.Provider value={{ lead, setLead, perfilCompleto, setPerfilCompleto }}>{children}</LeadCtx.Provider>
  );
}

export function useLead() {
  const ctx = useContext(LeadCtx);
  if (!ctx) throw new Error("useLead debe usarse dentro de <LeadProvider>");
  return ctx;
}
