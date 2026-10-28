import Image from "next/image";
import Link from "next/link";
import { asset } from "@/lib/config";
import { NEGOCIO } from "@/content/negocio";
import { PROBLEMAS, type PerfilCopy } from "@/content/perfiles";
import { AMBIENTES, AMBIENTES_LANDING, DESTACADOS, PRODUCTOS } from "@/content/productos";
import Arranque from "./Arranque";
import { LeadProvider } from "./LeadContext";
import LeadForm from "./LeadForm";
import WhatsAppFab from "./WhatsAppFab";
import WhatsAppLink, { IconoChat } from "./WhatsAppLink";

export default function Landing({ perfil }: { perfil: PerfilCopy }) {
  return (
    <LeadProvider>
      <Arranque perfil={perfil.id} />
      <main>
        <Hero perfil={perfil} />
        <BarraPrueba />
        <ProblemaSolucion />
        <Productos />
        <Galeria />
        <Cierre perfil={perfil} />
      </main>
      <Pie />
      <WhatsAppFab mensaje={perfil.whatsapp} perfil={perfil.id} />
    </LeadProvider>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src={asset("/images/marca.png")} alt="" width={40} height={40} className="size-9 sm:size-10" priority />
      <span className="display text-[1.3rem] tracking-[0.04em] text-bone sm:text-2xl">DECORTILES</span>
    </div>
  );
}

/**
 * Hero con tres disposiciones:
 * - móvil (<768): H1 → formulario → subtítulo (el formulario va justo debajo del H1).
 * - tablet (768–1023): H1 a todo el ancho; debajo, texto y formulario en dos columnas.
 * - desktop (≥1024): texto a la izquierda y formulario fijo a la derecha.
 */
function Hero({ perfil }: { perfil: PerfilCopy }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Foto de producto a sangre: tenue detrás del texto en móvil/tablet, mitad derecha en desktop. */}
      <div className="absolute inset-0 -z-10 lg:left-auto lg:w-[52%]">
        <Image
          src={asset("/images/productos/black-gold.jpg")}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 52vw, 100vw"
          className="object-cover object-[50%_30%] opacity-35 lg:opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/85 to-ink lg:bg-gradient-to-r lg:from-ink lg:via-ink/40 lg:to-ink/10" />
        <p className="rotulo absolute right-4 bottom-6 hidden origin-bottom-right translate-x-full -rotate-90 text-bone/70 lg:block">
          Black Gold · 60×120 · 1,44 m²/caja
        </p>
      </div>

      <header className="contenedor flex items-center justify-between gap-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:pt-6">
        <Marca />
        <WhatsAppLink
          mensaje={perfil.whatsapp}
          perfil={perfil.id}
          origen="header"
          className="-mr-2 flex min-h-11 min-w-11 items-center justify-center gap-2 px-2 text-sm font-semibold text-bone/85 transition-colors hover:text-white"
        >
          <IconoChat />
          <span className="hidden sm:inline">{NEGOCIO.whatsapp.visible}</span>
          <span className="sm:hidden">WhatsApp</span>
        </WhatsAppLink>
      </header>

      <div
        className="contenedor grid gap-y-5 pt-4 pb-12 [grid-template-areas:'h'_'f'_'t'] sm:pt-8
          md:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)] md:gap-x-8 md:gap-y-8 md:[grid-template-areas:'h_h'_'t_f']
          lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:grid-rows-[auto_1fr] lg:gap-x-14 lg:gap-y-0 lg:pt-16 lg:pb-24 lg:[grid-template-areas:'h_f'_'t_f']"
      >
        <div className="[grid-area:h] lg:pt-6">
          <p className="rotulo flex items-center gap-3 text-signal-soft">
            <span className="h-[3px] w-8 shrink-0 origin-left animate-trazo bg-signal" aria-hidden />
            {perfil.etiqueta}
          </p>
          <h1 className="display t-h1 mt-3 text-bone sm:mt-4">
            <span className="block">{perfil.h1[0]}</span>
            <span className="block text-signal">{perfil.h1[1]}</span>
          </h1>
        </div>

        <div className="[grid-area:t] lg:pt-6">
          <p className="t-lead max-w-xl leading-relaxed text-bone/80">{perfil.subtitulo}</p>
        </div>

        <div id="registro" data-evita-fab className="scroll-mt-4 self-start [grid-area:f] lg:sticky lg:top-6">
          <LeadForm id="hero" perfil={perfil.id} cta={perfil.cta} whatsapp={perfil.whatsapp} />
        </div>
      </div>
    </section>
  );
}

function BarraPrueba() {
  const items = [
    [`+${NEGOCIO.anios}`, "años importando"],
    ["Directo", "importación directa, sin revendedor"],
    ["MDE · BAQ", "stock en Medellín y Barranquilla"],
    ["60×120", "gran formato en bodega"],
  ];
  return (
    <section aria-label="Por qué DECORTILES" className="border-y border-white/10 bg-ink-2">
      <ul className="contenedor grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4 lg:py-9">
        {items.map(([n, t]) => (
          <li key={t} className="min-w-0 border-l-2 border-signal pl-3">
            <span className="display t-num block whitespace-nowrap text-bone">{n}</span>
            <span className="mt-1 block text-[0.8rem] leading-snug text-steel sm:text-sm">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProblemaSolucion() {
  return (
    <section className="contenedor py-12 sm:py-16 lg:py-20" aria-labelledby="porque-titulo">
      <h2 id="porque-titulo" className="rotulo text-signal-soft">
        Por qué la obra no se frena con nosotros
      </h2>
      <ol className="mt-6 grid gap-6 md:grid-cols-3 md:gap-8">
        {PROBLEMAS.map((p, i) => (
          <li key={p.solucion} className="border-l-2 border-signal pl-4">
            <span className="display text-xl text-signal-soft" aria-hidden>
              0{i + 1}
            </span>
            <p className="display t-h3 mt-1 text-bone">{p.solucion}</p>
            <p className="mt-1.5 text-[0.95rem] leading-relaxed text-bone/75">{p.respuesta}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 4 productos destacados: 1 columna (tarjeta horizontal) en móvil, 2 en tablet y 4 en desktop. */
function Productos() {
  const productos = DESTACADOS.map((slug) => PRODUCTOS.find((p) => p.slug === slug)).filter((p) => p !== undefined);
  return (
    <section className="bg-ink-2 py-12 sm:py-16 lg:py-20" aria-labelledby="productos-titulo">
      <div className="contenedor">
        <h2 id="productos-titulo" className="display t-h2 max-w-3xl text-bone">
          Lo que se está especificando ahora
        </h2>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          {productos.map((p) => (
            <li key={p.slug}>
              <article className="grid h-full grid-cols-[6.5rem_minmax(0,1fr)] bg-ink min-[400px]:grid-cols-[7.5rem_minmax(0,1fr)] sm:block">
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <Image
                    src={asset(p.imagen)}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1024px) 300px, (min-width: 640px) 46vw, 120px"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                </div>
                <div className="flex min-w-0 flex-col justify-center p-4">
                  <p className="rotulo text-steel">{p.categoria}</p>
                  <h3 className="display mt-1 text-[1.35rem] leading-none text-bone sm:text-2xl">{p.nombre}</h3>
                  <p className="mt-2 text-sm font-semibold text-bone/85">
                    {p.formato} · {p.m2Caja} m²/caja
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <a href="#registro" className="mt-5 inline-flex min-h-11 items-center font-semibold text-bone underline underline-offset-4 hover:text-white">
          +{NEGOCIO.referencias} referencias más en el inventario completo →
        </a>
      </div>
    </section>
  );
}

/** 4 fotos: carrusel con scroll-snap en móvil, 2 columnas en tablet y 4 en desktop. */
function Galeria() {
  const fotos = AMBIENTES_LANDING.map((src) => AMBIENTES.find((a) => a.src === src)).filter((a) => a !== undefined);
  return (
    <section className="contenedor py-12 sm:py-16 lg:py-20" aria-labelledby="galeria-titulo">
      <h2 id="galeria-titulo" className="display t-h2 text-bone">
        Así se ve cuando llega a tiempo.
      </h2>
      <ul
        tabIndex={0}
        aria-label="Fotos de proyectos instalados, desliza para ver más"
        className="mt-6 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:mt-8 md:grid md:grid-cols-2 md:gap-3 md:overflow-visible lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
      >
        {fotos.map((a) => (
          <li key={a.src} className="relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden bg-ink-2 min-[480px]:w-[70%] md:w-auto lg:aspect-[3/4]">
            <Image src={asset(a.src)} alt={a.alt} fill sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 85vw" className="object-cover" />
            <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-10 text-[0.72rem] font-semibold tracking-wide text-white uppercase sm:text-xs">
              {a.pie}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Cierre({ perfil }: { perfil: PerfilCopy }) {
  return (
    <section id="cierre" className="border-t border-white/10 py-12 sm:py-16 lg:py-20" aria-labelledby="cierre-titulo">
      <div className="contenedor grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)] md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <h2 id="cierre-titulo" className="display t-h2 text-bone">
            {perfil.cierre}
          </h2>
          <WhatsAppLink
            mensaje={perfil.whatsapp}
            perfil={perfil.id}
            origen="cierre"
            className="mt-6 flex min-h-14 w-full items-center justify-center gap-3 border-2 border-bone px-5 text-center text-base font-bold text-bone transition-colors hover:bg-bone hover:text-ink sm:inline-flex sm:w-auto sm:px-6"
          >
            <IconoChat />
            Hablar con un asesor por WhatsApp
          </WhatsAppLink>
          <p className="mt-6 text-sm leading-relaxed text-steel">
            {NEGOCIO.sedes.map((s) => `${s.ciudad}: ${s.direcciones.join(" · ")}`).join("  |  ")} · {NEGOCIO.horario}
          </p>
        </div>
        <div id="cierre-form" data-evita-fab className="scroll-mt-4 self-start">
          <LeadForm id="cierre" perfil={perfil.id} cta={perfil.cta} whatsapp={perfil.whatsapp} />
        </div>
      </div>
    </section>
  );
}

function Pie() {
  return (
    <footer data-evita-fab className="border-t border-white/10 bg-black/30 pt-8 pb-[max(2rem,calc(1rem+env(safe-area-inset-bottom)))]">
      <div className="contenedor flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-fit bg-white px-3 py-2">
          <Image src={asset("/images/logo-card.png")} alt="DECORTILES" width={84} height={56} className="h-14 w-auto" />
        </div>
        <div className="text-xs leading-relaxed text-steel sm:text-right">
          <p>
            © {new Date().getFullYear()} {NEGOCIO.razonSocial} · Instagram y Facebook {NEGOCIO.redes}
          </p>
          <p className="mt-1">
            <Link href="/politica-de-datos" className="inline-flex min-h-11 items-center underline underline-offset-2 hover:text-bone">
              Política de tratamiento de datos personales
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
