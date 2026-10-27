"use client";

import { useEffect, useState } from "react";
import WhatsAppLink, { IconoChat } from "./WhatsAppLink";

/**
 * Botón flotante de WhatsApp (solo móvil). Se oculta mientras haya en pantalla
 * algún elemento marcado con `data-evita-fab` (formularios y footer), para no
 * tapar nunca el botón de enviar ni los datos del pie. Respeta el safe-area de iPhone.
 */
export default function WhatsAppFab({ mensaje, perfil }: { mensaje: string; perfil: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const evitar = document.querySelectorAll("[data-evita-fab]");
    if (!evitar.length || !("IntersectionObserver" in window)) return;
    const enVista = new Set<Element>();
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) enVista.add(e.target);
        else enVista.delete(e.target);
      }
      setVisible(enVista.size === 0);
    });
    evitar.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div
      inert={!visible}
      className={`fixed z-40 transition-[opacity,transform] duration-300 md:hidden ${
        visible ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0"
      }`}
      style={{
        bottom: "calc(1rem + env(safe-area-inset-bottom))",
        right: "calc(1rem + env(safe-area-inset-right))",
      }}
    >
      <WhatsAppLink
        mensaje={mensaje}
        perfil={perfil}
        origen="flotante"
        className="flex size-14 items-center justify-center rounded-full bg-[#128c7e] text-white shadow-[0_10px_30px_-8px_rgb(0_0_0/0.6)] ring-2 ring-white/15"
      >
        <IconoChat className="size-7" />
        <span className="sr-only">Escribir a DECORTILES por WhatsApp</span>
      </WhatsAppLink>
    </div>
  );
}
