import Image from "next/image";
import Link from "next/link";
import { NEGOCIO, whatsappUrl } from "@/content/negocio";
import { PROBLEMAS, type PerfilCopy } from "@/content/perfiles";
import { AMBIENTES, PRODUCTOS } from "@/content/productos";
import Arranque from "./Arranque";
import { LeadProvider } from "./LeadContext";
import LeadForm from "./LeadForm";
import StickyCta from "./StickyCta";
import WhatsAppLink, { IconoChat } from "./WhatsAppLink";

const contenedor = "mx-auto w-full max-w-7xl px-4 sm:px-8";

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
      <StickyCta cta={perfil.cta} whatsapp={perfil.whatsapp} perfil={perfil.id} />
    </LeadProvider>
  );
}

function Marca() {
  return (
    <div className="flex items-center gap-2.5">
      <Image src="/images/marca.png" alt="" width={40} height={40} className="size-9 sm:size-10" priority />
      <span className="display text-[1.35rem] tracking-[0.04em] text-bone sm:text-2xl">DECORTILES</span>
    </div>
  );
}

function Hero({ perfil }: { perfil: PerfilCopy }) {
  return (
    <section className="relative isolate overflow-hidden">
      {/* Foto de producto a sangre: arriba en móvil (tenue), mitad derecha en desktop. */}
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
        <p className="rotulo absolute right-4 bottom-6 hidden origin-bottom-right -rotate-90 translate-x-full text-bone/70 lg:block">
          Black Gold · 60×120 · 1,44 m²/caja
        </p>
      </div>

      <header className={`${contenedor} flex items-center justify-between pt-4 sm:pt-6`}>
        <Marca />
        <WhatsAppLink
          mensaje={perfil.whatsapp}
          perfil={perfil.id}
          origen="header"
          className="flex min-h-11 items-center gap-2 text-sm font-semibold text-bone/85 transition-colors hover:text-white"
        >
          <IconoChat />
          <span className="hidden sm:inline">{NEGOCIO.whatsapp[0].visible}</span>
          <span className="sm:hidden">WhatsApp</span>
        </WhatsAppLink>
      </header>

      <div className={`${contenedor} grid items-start gap-8 pt-7 pb-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14 lg:pt-16 lg:pb-24`}>
        <div className="lg:pt-6">
          <p className="rotulo flex items-center gap-3 text-signal-soft">
            <span className="h-[3px] w-8 origin-left animate-trazo bg-signal" aria-hidden />
            {perfil.etiqueta}
          </p>
          <h1 className="display mt-4 text-[2.85rem] text-bone sm:text-6xl lg:text-[5.4rem] xl:text-[6rem]">
            <span className="block">{perfil.h1[0]}</span>
            <span className="block text-signal">{perfil.h1[1]}</span>
          </h1>
          <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-bone/80 sm:text-lg">{perfil.subtitulo}</p>
          <dl className="mt-10 hidden max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-6 lg:grid">
            {[
              ["60×120", "formato"],
              ["1,44", "m² por caja"],
              ["+90", "referencias"],
            ].map(([n, t]) => (
              <div key={t}>
                <dt className="sr-only">{t}</dt>
                <dd className="display text-4xl text-bone">{n}</dd>
                <dd className="mt-1 text-xs tracking-wide text-steel uppercase">{t}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div id="registro" className="scroll-mt-4 lg:sticky lg:top-6">
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
      <ul className={`${contenedor} grid grid-cols-2 gap-x-4 gap-y-6 py-7 lg:grid-cols-4 lg:py-9`}>
        {items.map(([n, t]) => (
          <li key={t} className="border-l-2 border-signal pl-3.5">
            <span className="display block text-[1.9rem] text-bone sm:text-4xl">{n}</span>
            <span className="mt-1 block text-[0.8rem] leading-snug text-steel sm:text-sm">{t}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ProblemaSolucion() {
  return (
    <section className={`${contenedor} py-16 lg:py-28`}>
      <h2 className="display max-w-4xl text-[2.3rem] text-bone sm:text-5xl lg:text-7xl">
        Tres razones por las que se atrasa una obra. <span className="text-signal">Ninguna es la cuadrilla.</span>
      </h2>
      <ol className="mt-10 lg:mt-16">
        {PROBLEMAS.map((p, i) => (
          <li key={p.solucion} className="grid gap-4 border-t border-white/15 py-8 md:grid-cols-[5rem_1fr_1fr] md:gap-10 lg:py-10">
            <span className="display text-4xl text-signal lg:text-5xl" aria-hidden>
              0{i + 1}
            </span>
            <div>
              <p className="rotulo text-steel">El problema</p>
              <h3 className="mt-2 text-xl font-bold text-bone/90 line-through decoration-signal decoration-2 lg:text-2xl">{p.problema}</h3>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-steel">{p.detalle}</p>
            </div>
            <div className="border-l-2 border-signal pl-4 md:border-l-0 md:pl-0">
              <p className="rotulo text-signal-soft">Con DECORTILES</p>
              <p className="display mt-2 text-[1.75rem] text-bone lg:text-4xl">{p.solucion}</p>
              <p className="mt-2 text-[0.95rem] leading-relaxed text-bone/80">{p.respuesta}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Productos() {
  return (
    <section className="bg-ink-2 py-16 lg:py-28" aria-labelledby="productos-titulo">
      <div className={contenedor}>
        <p className="rotulo text-signal-soft">Referencias en movimiento</p>
        <h2 id="productos-titulo" className="display mt-3 max-w-3xl text-[2.3rem] text-bone sm:text-5xl lg:text-7xl">
          Lo que se está especificando ahora
        </h2>
        <p className="mt-4 max-w-xl text-bone/75">Datos por caja, no adjetivos. Si lo ves aquí, lo puedes cotizar hoy.</p>
      </div>

      {/* Carrusel con scroll-snap en móvil, grilla en desktop. */}
      <ul className="mx-auto mt-10 flex max-w-7xl snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-4 [scrollbar-width:none] sm:px-8 lg:grid lg:grid-cols-4 lg:gap-5 lg:overflow-visible">
        {PRODUCTOS.map((p) => (
          <li key={p.slug} className="w-[76%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
            <article className="h-full bg-ink">
              <div className="relative aspect-[3/4] overflow-hidden bg-black">
                <Image
                  src={p.imagen}
                  alt={p.alt}
                  fill
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 44vw, 76vw"
                  className="object-cover transition-transform duration-700 hover:scale-[1.03]"
                />
                <span className="display absolute top-3 left-3 bg-ink/85 px-2.5 py-1.5 text-xl text-bone">{p.formato}</span>
              </div>
              <div className="p-4">
                <p className="rotulo text-steel">{p.categoria}</p>
                <h3 className="display mt-1 text-2xl text-bone">{p.nombre}</h3>
                <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 border-t border-white/10 pt-3 text-sm">
                  <Dato k="m²/caja" v={p.m2Caja} />
                  <Dato k="kg/caja" v={p.kgCaja} />
                  <Dato k="Acabado" v={p.acabado ?? "Consultar"} />
                  <Dato k="Uso" v={p.uso} />
                </dl>
              </div>
            </article>
          </li>
        ))}
        <li className="w-[76%] shrink-0 snap-start sm:w-[44%] lg:w-auto">
          <a href="#registro" className="flex h-full min-h-72 flex-col justify-between bg-signal-strong p-6 text-white transition-colors hover:bg-signal">
            <span className="display text-6xl">+{NEGOCIO.referencias}</span>
            <span>
              <span className="display block text-3xl">referencias más</span>
              <span className="mt-2 block text-sm text-white/90">Sanitarios, lavamanos, pisos y fachadas. Regístrate y recibe el inventario completo.</span>
              <span className="mt-4 block font-bold">Recibir inventario →</span>
            </span>
          </a>
        </li>
      </ul>
    </section>
  );
}

function Dato({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-[0.7rem] tracking-wider text-steel uppercase">{k}</dt>
      <dd className="font-semibold text-bone">{v}</dd>
    </div>
  );
}

function Beneficios({ perfil }: { perfil: PerfilCopy }) {
  return (
    <section className="bg-bone py-16 text-ink lg:py-28" aria-labelledby="beneficios-titulo">
      <div className={contenedor}>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
          <div>
            <p className="rotulo text-signal-strong">Qué recibes al suscribirte</p>
            <h2 id="beneficios-titulo" className="display mt-3 text-[2.3rem] sm:text-5xl lg:text-6xl">
              Información de obra. No promociones.
            </h2>
            <a href="#registro" className="mt-6 hidden min-h-12 items-center gap-3 bg-ink px-5 font-bold text-bone transition-colors hover:bg-signal-strong lg:inline-flex">
              {perfil.cta} <span aria-hidden>→</span>
            </a>
          </div>
          <ol className="grid gap-px bg-ink/15 sm:grid-cols-2">
            {perfil.beneficios.map((b, i) => (
              <li key={b.titulo} className="bg-bone p-5 sm:p-6">
                <span className="display text-3xl text-signal-strong" aria-hidden>
                  0{i + 1}
                </span>
                <h3 className="mt-3 text-lg font-bold">{b.titulo}</h3>
                <p className="mt-1.5 text-[0.95rem] leading-relaxed text-ink/75">{b.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Galeria() {
  // Spans pensados para 7 fotos: la primera grande, las dos últimas anchas en desktop.
  const spans = ["col-span-2 lg:row-span-2", "", "", "", "", "lg:col-span-2", "lg:col-span-2"];
  return (
    <section className={`${contenedor} py-16 lg:py-28`} aria-labelledby="galeria-titulo">
      <p className="rotulo text-signal-soft">Proyectos instalados</p>
      <h2 id="galeria-titulo" className="display mt-3 text-[2.3rem] text-bone sm:text-5xl lg:text-7xl">
        Así se ve cuando llega a tiempo.
      </h2>
      <ul className="mt-10 grid auto-rows-[44vw] grid-cols-2 gap-2 sm:auto-rows-[30vw] lg:auto-rows-[230px] lg:grid-cols-4 lg:gap-3">
        {AMBIENTES.map((a, i) => (
          <li key={a.src} className={`relative overflow-hidden bg-ink-2 ${spans[i] ?? ""}`}>
            <Image
              src={a.src}
              alt={a.alt}
              fill
              sizes={i === 0 ? "(min-width: 1024px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
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
    <section id="cierre" className="relative isolate overflow-hidden border-t border-white/10 py-16 lg:py-28" aria-labelledby="cierre-titulo">
      <div className={`${contenedor} grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16`}>
        <div>
          <p className="rotulo text-signal-soft">Último paso</p>
          <h2 id="cierre-titulo" className="display mt-3 text-[2.5rem] text-bone sm:text-6xl lg:text-7xl">
            {perfil.cierre}
          </h2>
          <WhatsAppLink
            mensaje={perfil.whatsapp}
            perfil={perfil.id}
            origen="cierre"
            className="mt-8 inline-flex min-h-14 items-center gap-3 border-2 border-bone px-6 text-base font-bold text-bone transition-colors hover:bg-bone hover:text-ink"
          >
            <IconoChat />
            Hablar con un asesor por WhatsApp
          </WhatsAppLink>

          <div className="mt-12 grid gap-8 border-t border-white/15 pt-8 sm:grid-cols-2">
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
            <div className="text-sm leading-relaxed text-steel sm:col-span-2">
              <p>{NEGOCIO.horario}</p>
              <p>
                WhatsApp{" "}
                {NEGOCIO.whatsapp.map((w, i) => (
                  <span key={w.numero}>
                    {i > 0 && " · "}
                    <a
                      href={whatsappUrl(perfil.whatsapp, w.numero)}
                      target="_blank"
                      rel="noopener"
                      className="text-bone/85 underline-offset-2 hover:underline"
                    >
                      {w.visible}
                    </a>
                  </span>
                ))}
              </p>
              <p>{NEGOCIO.correo}</p>
            </div>
          </div>
        </div>
        <div id="cierre-form" className="scroll-mt-4">
          <LeadForm id="cierre" perfil={perfil.id} cta={perfil.cta} whatsapp={perfil.whatsapp} />
        </div>
      </div>
    </section>
  );
}

function Pie() {
  return (
    <footer className="border-t border-white/10 bg-black/30 pt-8 pb-24 md:pb-8">
      <div className={`${contenedor} flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between`}>
        <div className="w-fit bg-white px-3 py-2">
          <Image src="/images/logo-card.png" alt="DECORTILES" width={400} height={269} className="h-14 w-auto" />
        </div>
        <div className="text-xs leading-relaxed text-steel sm:text-right">
          <p>
            © {new Date().getFullYear()} {NEGOCIO.razonSocial} · Instagram y Facebook {NEGOCIO.redes}
          </p>
          <p className="mt-1">
            <Link href="/politica-de-datos" className="underline underline-offset-2 hover:text-bone">
              Política de tratamiento de datos personales
            </Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
