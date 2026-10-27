"use client";

import { useEffect } from "react";
import { capturarTracking } from "@/lib/utm";
import { trackViewContent } from "@/lib/tracking";

/** Al cargar: guarda UTMs/click ids y dispara ViewContent con el perfil. */
export default function Arranque({ perfil }: { perfil: string }) {
  useEffect(() => {
    capturarTracking();
    trackViewContent(perfil);
  }, [perfil]);
  return null;
}
