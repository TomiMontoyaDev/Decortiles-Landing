"use client";

import { whatsappUrl } from "@/content/negocio";
import { trackContact } from "@/lib/tracking";

export function IconoChat({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden className={className}>
      <path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1L4 20z" strokeLinejoin="round" />
      <path d="M9 10h.01M12 10h.01M15 10h.01" strokeLinecap="round" strokeWidth="2.6" />
    </svg>
  );
}

export default function WhatsAppLink({
  mensaje,
  perfil,
  origen,
  className,
  children,
}: {
  mensaje: string;
  perfil: string;
  origen: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={whatsappUrl(mensaje)}
      target="_blank"
      rel="noopener"
      onClick={() => trackContact(perfil, origen)}
      className={className}
    >
      {children}
    </a>
  );
}
