import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NEGOCIO, whatsappUrl } from "@/content/negocio";

// Destino del enlace de double opt-in de Brevo (redirectionUrl).
export const metadata: Metadata = { title: "Correo confirmado · DECORTILES" };

export default function Confirmado() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16 sm:px-8">
      <Image src="/images/marca.png" alt="" width={56} height={56} />
      <p className="rotulo mt-8 text-signal-soft">Suscripción activa</p>
      <h1 className="display mt-3 text-5xl text-bone sm:text-7xl">Correo confirmado.</h1>
      <p className="mt-5 text-lg leading-relaxed text-bone/80">
        Desde ahora te llegan las alertas de stock, las llegadas de contenedor y lo que se está especificando cada mes.
        Si tienes una obra andando, no esperes el próximo correo.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={whatsappUrl("Hola DECORTILES, acabo de confirmar mi correo. Quiero cotizar acabados para un proyecto.")}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-14 items-center bg-signal-strong px-6 font-bold text-white hover:bg-signal"
        >
          Cotizar por WhatsApp
        </a>
        <Link href="/" className="inline-flex min-h-14 items-center border-2 border-bone/60 px-6 font-bold text-bone hover:border-bone">
          Volver
        </Link>
      </div>
      <p className="mt-10 text-sm text-steel">{NEGOCIO.horario}</p>
    </main>
  );
}
