"use client";

import { useEffect, useState } from "react";
import { useLead } from "./LeadContext";
import WhatsAppLink, { IconoChat } from "./WhatsAppLink";

/**
 * Barra fija en móvil. Aparece solo cuando ningún formulario está en pantalla
 * y se ha pasado el hero, para no tapar el formulario ni competir con él.
 */
export default function StickyCta({ cta, whatsapp, perfil }: { cta: string; whatsapp: string; perfil: string }) {
  const { lead } = useLead();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById("registro");
    const cierre = document.getElementById("cierre-form");
    if (!hero || !cierre || !("IntersectionObserver" in window)) return;
    // El formulario del hero "cuenta" mientras esté en pantalla o todavía por debajo.
    let heroPendiente = true;
    let cierreEnVista = false;
    const obs = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === hero) heroPendiente = e.isIntersecting || e.boundingClientRect.top > 0;
        else cierreEnVista = e.isIntersecting;
      }
      setVisible(!heroPendiente && !cierreEnVista);
    });
    obs.observe(hero);
    obs.observe(cierre);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 p-3 backdrop-blur transition-transform duration-300 md:hidden ${
        visible ? "translate-y-0" : "pointer-events-none translate-y-full"
      }`}
      inert={!visible}
    >
      <div className="flex gap-2">
        {!lead && (
          <a
            href="#registro"
            className="flex min-h-12 flex-1 items-center justify-center bg-signal-strong px-4 text-[0.95rem] font-bold text-white"
          >
            {cta}
          </a>
        )}
        <WhatsAppLink
          mensaje={whatsapp}
          perfil={perfil}
          origen="sticky"
          className={`flex min-h-12 items-center justify-center gap-2 border border-bone/40 px-4 font-semibold text-bone ${lead ? "flex-1" : ""}`}
        >
          <IconoChat />
          <span className={lead ? "" : "sr-only"}>WhatsApp</span>
        </WhatsAppLink>
      </div>
    </div>
  );
}
