import Image from "next/image";
import Link from "next/link";
import { NEGOCIO } from "@/content/negocio";
import { PROBLEMAS, type PerfilCopy } from "@/content/perfiles";
import { AMBIENTES, PRODUCTOS } from "@/content/productos";
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
        <Beneficios perfil={perfil} />
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
      <Image src="/images/marca.png" alt="" width={40} height={40} className="size-9 sm:size-10" priority />
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
          src="/images/productos/black-gold.jpg"
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
          <dl className="mt-6 grid max-w-lg grid-cols-3 gap-4 border-t border-white/15 pt-5 md:mt-8 lg:mt-10 lg:gap-6 lg:pt-6">
            {[
              ["60×120", "formato"],
              ["1,44", "m² por caja"],
              ["+90", "referencias"],
            ].map(([n, t]) => (
              <div key={t} className="flex flex-col-reverse">
                <dt className="mt-1 text-[0.7rem] tracking-wide text-steel uppercase sm:text-xs">{t}</dt>
                <dd className="display t-num text-bone">{n}</dd>
              </div>
            ))}
          </dl>
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
    <section className="contenedor py-14 sm:py-20 lg:py-28">
      <h2 className="display t-h2 max-w-4xl text-bone">
        Tres razones por las que se atrasa una obra. <span className="text-signal">Ninguna es la cuadrilla.</span>
      </h2>
      <ol className="mt-8 lg:mt-16">
        {PROBLEMAS.map((p, i) => (
          <li
            key={p.solucion}
            className="grid gap-4 border-t border-white/15 py-7 md:grid-cols-[3.5rem_minmax(0,1fr)_minmax(0,1fr)] md:gap-8 lg:grid-cols-[5rem_minmax(0,1fr)_minmax(0,1fr)] lg:gap-10 lg:py-10"
          >
            <span className="display t-num text-signal" aria-hidden>
              0{i + 1}
            </span>
            <div>
              <p className="rotulo text-steel">El problema</p>
              <h3 className="mt-2 text-lg font-bold text-bone/90 line-through decoration-signal decoration-2 sm:text-xl lg:text-2xl">
                {p.problema}
              </h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-steel">{p.detalle}</p>
            </div>
            <div className="border-l-2 border-signal pl-4 md:border-l-0 md:pl-0">
              <p className="rotulo text-signal-soft">Con DECORTILES</p>
              <p className="display t-h3 mt-2 text-bone">{p.solucion}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-bone/80">{p.respuesta}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** 1 columna (tarjeta horizontal) en móvil, 2 en tablet, 3 en desktop y 4 en pantallas anchas. */
function Productos() {
  return (
    <section className="bg-ink-2 py-14 sm:py-20 lg:py-28" aria-labelledby="productos-titulo">
      <div className="contenedor">
        <p className="rotulo text-signal-soft">Referencias en movimiento</p>
        <h2 id="productos-titulo" className="display t-h2 mt-3 max-w-3xl text-bone">
          Lo que se está especificando ahora
        </h2>
        <p className="t-lead mt-4 max-w-xl text-bone/75">Datos por caja, no adjetivos. Si lo ves aquí, lo puedes cotizar hoy.</p>

        <ul className="mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 lg:gap-5 xl:grid-cols-4">
          {PRODUCTOS.map((p) => (
            <li key={p.slug}>
              <article className="grid h-full grid-cols-[7.25rem_minmax(0,1fr)] bg-ink min-[400px]:grid-cols-[8.5rem_minmax(0,1fr)] sm:block">
                <div className="relative aspect-[3/4] overflow-hidden bg-black">
                  <Image
                    src={p.imagen}
                    alt={p.alt}
                    fill
                    sizes="(min-width: 1280px) 300px, (min-width: 1024px) 31vw, (min-width: 640px) 46vw, 136px"
                    className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                  />
                  <span className="display absolute top-2 left-2 bg-ink/85 px-2 py-1 text-base text-bone sm:top-3 sm:left-3 sm:px-2.5 sm:py-1.5 sm:text-xl">
                    {p.formato}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col justify-center p-3.5 sm:p-4">
                  <p className="rotulo text-steel">{p.categoria}</p>
                  <h3 className="display mt-1 text-[1.35rem] leading-none text-bone sm:text-2xl">{p.nombre}</h3>
                  <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-white/10 pt-2.5 text-sm sm:mt-3 sm:gap-y-2 sm:pt-3">
                    <Dato k="m²/caja" v={p.m2Caja} />
                    <Dato k="kg/caja" v={p.kgCaja} />
                    <Dato k="Acabado" v={p.acabado ?? "Consultar"} />
                    <Dato k="Uso" v={p.uso} />
                  </dl>
                </div>
              </article>
            </li>
          ))}
          <li className="lg:col-span-2 xl:col-span-1">
            <a
              href="#registro"
              className="flex h-full min-h-40 flex-col justify-between gap-4 bg-signal-strong p-5 text-white transition-colors hover:bg-signal sm:min-h-72 sm:p-6"
            >
              <span className="display text-5xl sm:text-6xl">+{NEGOCIO.referencias}</span>
              <span>
                <span className="display block text-2xl sm:text-3xl">referencias más</span>
                <span className="mt-2 block text-sm text-white/90">
                  Sanitarios, lavamanos, pisos y fachadas. Regístrate y recibe el inventario completo.
                </span>
                <span className="mt-3 block font-bold">Recibir inventario →</span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[0.68rem] tracking-wider text-steel uppercase">{k}</dt>
      <dd className="font-semibold text-bone">{v}</dd>
    </div>
  );
}

function Beneficios({ perfil }: { perfil: PerfilCopy }) {
  return (
    <section className="bg-bone py-14 text-ink sm:py-20 lg:py-28" aria-labelledby="beneficios-titulo">
      <div className="contenedor grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
        <div>
          <p className="rotulo text-signal-strong">Qué recibes al suscribirte</p>
          <h2 id="beneficios-titulo" className="display t-h2 mt-3">
            Información de obra. No promociones.
          </h2>
          <a
            href="#registro"
            className="mt-6 hidden min-h-12 items-center gap-3 bg-ink px-5 font-bold text-bone transition-colors hover:bg-signal-strong lg:inline-flex"
          >
            {perfil.cta} <span aria-hidden>→</span>
          </a>
        </div>
        <ol className="grid gap-px bg-ink/15 sm:grid-cols-2">
          {perfil.beneficios.map((b, i) => (
            <li key={b.titulo} className="bg-bone py-5 sm:p-6">
              <span className="display text-3xl text-signal-strong" aria-hidden>
                0{i + 1}
              </span>
              <h3 className="mt-2 text-lg font-bold sm:mt-3">{b.titulo}</h3>
              <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink/75">{b.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Carrusel con scroll-snap en móvil; grilla de 2 columnas en tablet y mosaico de 4 en desktop. */
function Galeria() {
  const spans = ["md:col-span-2 lg:row-span-2", "", "", "", "", "lg:col-span-2", "lg:col-span-2"];
  return (
    <section className="contenedor py-14 sm:py-20 lg:py-28" aria-labelledby="galeria-titulo">
      <p className="rotulo text-signal-soft">Proyectos instalados</p>
      <h2 id="galeria-titulo" className="display t-h2 mt-3 text-bone">
        Así se ve cuando llega a tiempo.
      </h2>
      <p className="rotulo mt-4 text-steel md:hidden" aria-hidden>
        Desliza para ver más →
      </p>
      <ul
        tabIndex={0}
        aria-label="Fotos de proyectos instalados"
        className="mt-4 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:none] md:mt-10 md:grid md:auto-rows-[clamp(200px,34vw,340px)] md:grid-cols-2 md:gap-3 md:overflow-visible lg:auto-rows-[clamp(180px,16vw,280px)] lg:grid-cols-4 [&::-webkit-scrollbar]:hidden"
      >
        {AMBIENTES.map((a, i) => (
          <li
            key={a.src}
            className={`relative aspect-[4/3] w-[85%] shrink-0 snap-center overflow-hidden bg-ink-2 min-[480px]:w-[70%] md:aspect-auto md:w-auto ${spans[i] ?? ""}`}
          >
            <Image
              src={a.src}
              alt={a.alt}
              fill
              sizes={
                i === 0
                  ? "(min-width: 1024px) 50vw, (min-width: 768px) 100vw, 85vw"
                  : i >= 5
                    ? "(min-width: 1024px) 50vw, (min-width: 768px) 50vw, 85vw"
                    : "(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 85vw"
              }
              className="object-cover"
            />
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
    <section id="cierre" className="border-t border-white/10 py-14 sm:py-20 lg:py-28" aria-labelledby="cierre-titulo">
      <div className="contenedor grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,22.5rem)] md:gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
        <div>
          <p className="rotulo text-signal-soft">Último paso</p>
          <h2 id="cierre-titulo" className="display t-h2 mt-3 text-bone">
            {perfil.cierre}
          </h2>
          <WhatsAppLink
            mensaje={perfil.whatsapp}
            perfil={perfil.id}
            origen="cierre"
            className="mt-8 flex min-h-14 w-full items-center justify-center gap-3 border-2 border-bone px-5 text-center text-base font-bold text-bone transition-colors hover:bg-bone hover:text-ink sm:inline-flex sm:w-auto sm:px-6"
          >
            <IconoChat />
            Hablar con un asesor por WhatsApp
          </WhatsAppLink>

          <div className="mt-10 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2 md:grid-cols-1 lg:mt-12 lg:grid-cols-2">
            {NEGOCIO.sedes.map((s) => (
              <div key={s.ciudad}>
                <h3 className="display text-3xl text-bone">{s.ciudad}</h3>
                <ul className="mt-2 space-y-1 text-[0.95rem] text-bone/80">
                  {s.direcciones.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </div>
            ))}
            <div className="text-sm leading-relaxed text-steel sm:col-span-2 md:col-span-1 lg:col-span-2">
              <p>{NEGOCIO.horario}</p>
              <p>WhatsApp {NEGOCIO.whatsapp.visible}</p>
              <p className="[overflow-wrap:anywhere]">{NEGOCIO.correo}</p>
            </div>
          </div>
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
          <Image src="/images/logo-card.png" alt="DECORTILES" width={84} height={56} className="h-14 w-auto" />
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
