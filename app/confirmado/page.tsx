import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { NEGOCIO } from "@/content/negocio";
import { asset } from "@/lib/config";

// Destino del enlace de double opt-in de Brevo (redirectionUrl).
export const metadata: Metadata = { title: "Correo confirmado · DECORTILES" };

export default function Confirmado() {
  return (
    <main className="contenedor flex min-h-dvh max-w-2xl flex-col justify-center pt-[max(4rem,env(safe-area-inset-top))] pb-[max(4rem,env(safe-area-inset-bottom))]">
      <Image src={asset("/images/marca.png")} alt="" width={56} height={56} />
      <p className="rotulo mt-8 text-signal-strong">Suscripción activa</p>
      <h1 className="display t-h1 mt-3 text-ink">Correo confirmado.</h1>
      <p className="mt-5 text-lg leading-relaxed text-ink/75">
        Desde ahora te llegan las novedades y los lanzamientos de DECORTILES. Mientras tanto, explora el catálogo digital.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={NEGOCIO.catalogo}
          target="_blank"
          rel="noopener"
          className="inline-flex min-h-14 items-center bg-signal-strong px-6 font-bold text-white hover:bg-ink"
        >
          Abrir catálogo ↗
        </a>
        <Link href="/" className="inline-flex min-h-14 items-center border-2 border-ink/30 px-6 font-bold text-ink hover:border-ink">
          Volver
        </Link>
      </div>
      <p className="mt-10 text-sm text-ink/60">{NEGOCIO.horario}</p>
    </main>
  );
}
