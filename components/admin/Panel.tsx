"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { asset } from "@/lib/config";
import { OPCIONES, etiqueta } from "@/lib/lead-schema";
import { COLUMNAS_LEAD, ESTADOS, supabase, type Lead } from "@/lib/supabase";

const POR_PAGINA = 50;
const DIA = 24 * 3600 * 1000;

const fecha = new Intl.DateTimeFormat("es-CO", { timeZone: "America/Bogota", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const diaBogota = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" });
const num = new Intl.NumberFormat("es-CO");

const etiquetaEstado = (v: string) => ESTADOS.find((e) => e.value === v)?.label ?? v;
const perfilCompleto = (l: Lead) => Boolean(l.empresa || l.etapa || l.m2 || l.intereses?.length);

/** Lleva la sesión y decide qué pantalla mostrar. */
export default function Panel() {
  const sb = supabase();
  const [sesion, setSesion] = useState<Session | null | undefined>(undefined);
  const [admin, setAdmin] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (!sb) return;
    sb.auth.getSession().then(({ data }) => setSesion(data.session));
    const { data } = sb.auth.onAuthStateChange((_e, s) => setSesion(s));
    return () => data.subscription.unsubscribe();
  }, [sb]);

  useEffect(() => {
    if (!sb || !sesion) return setAdmin(undefined);
    sb.rpc("es_admin").then(({ data }) => setAdmin(data === true));
  }, [sb, sesion]);

  const salir = () => sb?.auth.signOut();

  return (
    <div className="min-h-dvh pb-[max(3rem,env(safe-area-inset-bottom))]">
      <header className="border-b border-bone/10">
        <div className="contenedor flex min-h-16 items-center justify-between gap-3 pt-[env(safe-area-inset-top)]">
          <Link href="/" className="flex items-center gap-2.5" aria-label="Volver a la landing">
            <Image src={asset("/images/marca.png")} alt="" width={32} height={32} className="size-8" />
            <span className="display text-xl tracking-[0.04em] text-bone">DECORTILES</span>
            <span className="rotulo hidden text-steel sm:inline">· Panel de leads</span>
          </Link>
          {sesion && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden max-w-56 truncate text-steel md:inline">{sesion.user.email}</span>
              <button onClick={salir} className="min-h-11 border border-bone/25 px-3 font-semibold hover:border-bone">
                Salir
              </button>
            </div>
          )}
        </div>
      </header>

      <main className="contenedor pt-6 sm:pt-10">
        {!sb ? (
          <Aviso titulo="Falta configurar Supabase">
            Define <code>NEXT_PUBLIC_SUPABASE_URL</code> y <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> y vuelve a desplegar (README, sección 4).
          </Aviso>
        ) : sesion === undefined || (sesion && admin === undefined) ? (
          <p className="text-steel">Cargando…</p>
        ) : !sesion ? (
          <Login />
        ) : !admin ? (
          <Aviso titulo="Tu cuenta no tiene acceso">
            {sesion.user.email} no está en la tabla <code>admins</code> de Supabase. Pide que la agreguen y vuelve a entrar.
          </Aviso>
        ) : (
          <Dashboard />
        )}
      </main>
    </div>
  );
}

function Aviso({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="max-w-lg border border-bone/15 bg-ink-2 p-6">
      <h1 className="display text-3xl">{titulo}</h1>
      <p className="mt-3 leading-relaxed text-bone/80 [&_code]:text-signal-soft">{children}</p>
    </div>
  );
}

function Login() {
  const [email, setEmail] = useState("");
  const [clave, setClave] = useState("");
  const [error, setError] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    setEnviando(true);
    const { error } = await supabase()!.auth.signInWithPassword({ email: email.trim(), password: clave });
    if (error) setError(error.message === "Invalid login credentials" ? "Correo o contraseña incorrectos." : error.message);
    setEnviando(false);
  }

  return (
    <form onSubmit={entrar} className="mx-auto mt-4 max-w-sm bg-bone p-6 text-ink sm:mt-12 sm:p-8">
      <p className="rotulo text-signal-strong">Acceso del equipo</p>
      <h1 className="display mt-1.5 text-4xl">Iniciar sesión</h1>
      <label htmlFor="login-email" className="mt-6 mb-1 block text-[0.8rem] font-semibold">
        Correo
      </label>
      <input id="login-email" className="campo" type="email" autoComplete="username" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <label htmlFor="login-clave" className="mt-4 mb-1 block text-[0.8rem] font-semibold">
        Contraseña
      </label>
      <input id="login-clave" className="campo" type="password" autoComplete="current-password" required value={clave} onChange={(e) => setClave(e.target.value)} />
      <button type="submit" disabled={enviando} className="mt-6 min-h-12 w-full bg-signal-strong font-bold text-white hover:bg-ink disabled:opacity-70">
        {enviando ? "Entrando…" : "Entrar"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-error">
          {error}
        </p>
      )}
    </form>
  );
}

type Filtros = { q: string; perfil: string; ciudad: string; estado: string; dias: string };
const SIN_FILTROS: Filtros = { q: "", perfil: "", ciudad: "", estado: "", dias: "" };

function Dashboard() {
  const [leads, setLeads] = useState<Lead[] | null>(null);
  const [error, setError] = useState("");
  const [f, setF] = useState<Filtros>(SIN_FILTROS);
  const [visibles, setVisibles] = useState(POR_PAGINA);
  const [abierto, setAbierto] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    setError("");
    const sb = supabase()!;
    const todos: Lead[] = [];
    // Supabase devuelve como máximo 1.000 filas por consulta: se pide por páginas.
    for (let desde = 0; ; desde += 1000) {
      const { data, error } = await sb.from("leads").select(COLUMNAS_LEAD).order("creado", { ascending: false }).range(desde, desde + 999);
      if (error) return setError(`No se pudieron cargar los leads: ${error.message}`);
      todos.push(...(data as Lead[]));
      if (data.length < 1000) break;
    }
    setLeads(todos);
  }, []);

  useEffect(() => {
    cargar();
  }, [cargar]);

  const filtrados = useMemo(() => {
    if (!leads) return [];
    const q = f.q.trim().toLowerCase();
    const desde = f.dias ? Date.now() - Number(f.dias) * DIA : 0;
    return leads.filter(
      (l) =>
        (!f.perfil || l.perfil === f.perfil) &&
        (!f.ciudad || l.ciudad === f.ciudad) &&
        (!f.estado || l.estado === f.estado) &&
        (!desde || new Date(l.creado).getTime() >= desde) &&
        (!q || [l.nombre, l.email, l.celular, l.empresa, l.utm_campaign].some((v) => v?.toLowerCase().includes(q))),
    );
  }, [leads, f]);

  async function cambiarEstado(id: string, estado: string) {
    const antes = leads!.find((l) => l.id === id)?.estado;
    setLeads((ls) => ls!.map((l) => (l.id === id ? { ...l, estado } : l)));
    const { error } = await supabase()!.from("leads").update({ estado }).eq("id", id);
    if (error) {
      setLeads((ls) => ls!.map((l) => (l.id === id ? { ...l, estado: antes ?? l.estado } : l)));
      setError(`No se pudo cambiar el estado: ${error.message}`);
    }
  }

  const filtro = <K extends keyof Filtros>(k: K, v: string) => {
    setF((x) => ({ ...x, [k]: v }));
    setVisibles(POR_PAGINA);
  };

  if (!leads) return error ? <p className="font-semibold text-signal-soft">{error}</p> : <p className="text-steel">Cargando leads…</p>;

  const hoy = diaBogota.format(new Date());
  const kpis = [
    { label: "Leads en total", valor: leads.length },
    { label: "Hoy", valor: leads.filter((l) => diaBogota.format(new Date(l.creado)) === hoy).length },
    { label: "Últimos 7 días", valor: leads.filter((l) => new Date(l.creado).getTime() >= Date.now() - 7 * DIA).length },
    { label: "Sin contactar", valor: leads.filter((l) => l.estado === "nuevo").length },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="display t-h2">Leads</h1>
        <div className="flex gap-2">
          <button onClick={cargar} className="min-h-11 border border-bone/25 px-4 text-sm font-semibold hover:border-bone">
            Actualizar
          </button>
          <button
            onClick={() => descargarCsv(filtrados)}
            disabled={!filtrados.length}
            className="min-h-11 bg-signal-strong px-4 text-sm font-bold text-white hover:bg-signal disabled:opacity-50"
          >
            Descargar CSV
          </button>
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-4 font-semibold text-signal-soft">
          {error}
        </p>
      )}

      <dl className="mt-6 grid grid-cols-2 gap-px bg-bone/10 lg:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="bg-ink-2 p-4 sm:p-5">
            <dt className="rotulo text-steel">{k.label}</dt>
            <dd className="display mt-2 text-4xl sm:text-5xl">{num.format(k.valor)}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <Reparto titulo="Por perfil" filas={contar(filtrados, (l) => etiqueta("perfil", l.perfil))} />
        <Reparto titulo="Por ciudad" filas={contar(filtrados, (l) => etiqueta("ciudad", l.ciudad))} />
        <Reparto titulo="Por campaña" filas={contar(filtrados, (l) => l.utm_campaign || "(sin campaña)").slice(0, 5)} />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <div className="col-span-2 md:col-span-1">
          <label htmlFor="f-q" className="rotulo mb-1 block text-steel">
            Buscar
          </label>
          <input id="f-q" className="campo" type="search" placeholder="Nombre, correo, celular, empresa…" value={f.q} onChange={(e) => filtro("q", e.target.value)} />
        </div>
        <Selector id="f-perfil" label="Perfil" value={f.perfil} onChange={(v) => filtro("perfil", v)} opciones={OPCIONES.perfil} />
        <Selector id="f-ciudad" label="Ciudad" value={f.ciudad} onChange={(v) => filtro("ciudad", v)} opciones={OPCIONES.ciudad} />
        <Selector id="f-estado" label="Estado" value={f.estado} onChange={(v) => filtro("estado", v)} opciones={ESTADOS} />
        <Selector
          id="f-dias"
          label="Fecha"
          value={f.dias}
          onChange={(v) => filtro("dias", v)}
          todos="Siempre"
          opciones={[
            { value: "1", label: "Últimas 24 h" },
            { value: "7", label: "Últimos 7 días" },
            { value: "30", label: "Últimos 30 días" },
          ]}
        />
      </div>

      <p className="mt-4 text-sm text-steel" aria-live="polite">
        {num.format(filtrados.length)} {filtrados.length === 1 ? "lead" : "leads"}
        {JSON.stringify(f) !== JSON.stringify(SIN_FILTROS) && (
          <>
            {" · "}
            <button onClick={() => setF(SIN_FILTROS)} className="min-h-11 font-semibold text-bone underline underline-offset-2">
              Quitar filtros
            </button>
          </>
        )}
      </p>

      {filtrados.length === 0 ? (
        <p className="mt-6 border border-dashed border-bone/20 p-8 text-center text-steel">
          {leads.length ? "Ningún lead coincide con los filtros." : "Todavía no hay leads. Aparecerán aquí apenas alguien llene el formulario."}
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-bone/10 border-y border-bone/10">
          {filtrados.slice(0, visibles).map((l) => (
            <Fila key={l.id} lead={l} abierto={abierto === l.id} alternar={() => setAbierto(abierto === l.id ? null : l.id)} cambiarEstado={cambiarEstado} />
          ))}
        </ul>
      )}

      {filtrados.length > visibles && (
        <button onClick={() => setVisibles((n) => n + POR_PAGINA)} className="mt-4 min-h-12 w-full border border-bone/25 font-semibold hover:border-bone">
          Ver {Math.min(POR_PAGINA, filtrados.length - visibles)} más
        </button>
      )}
    </>
  );
}

function Selector({
  id,
  label,
  value,
  onChange,
  opciones,
  todos = "Todos",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  opciones: readonly { value: string; label: string }[];
  todos?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="rotulo mb-1 block text-steel">
        {label}
      </label>
      <select id={id} className="campo" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">{todos}</option>
        {opciones.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function contar(leads: Lead[], clave: (l: Lead) => string) {
  const m = new Map<string, number>();
  for (const l of leads) m.set(clave(l), (m.get(clave(l)) ?? 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1]);
}

function Reparto({ titulo, filas }: { titulo: string; filas: [string, number][] }) {
  const max = Math.max(1, ...filas.map(([, n]) => n));
  return (
    <section className="border border-bone/10 bg-ink-2 p-4 sm:p-5">
      <h2 className="rotulo text-steel">{titulo}</h2>
      {filas.length === 0 ? (
        <p className="mt-3 text-sm text-steel">Sin datos</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {filas.map(([nombre, n]) => (
            <li key={nombre}>
              <div className="flex justify-between gap-3 text-sm">
                <span className="truncate">{nombre}</span>
                <span className="font-semibold tabular-nums">{num.format(n)}</span>
              </div>
              <div className="mt-1 h-1.5 bg-bone/10" aria-hidden>
                <div className="h-full bg-signal" style={{ width: `${(n / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function Fila({
  lead: l,
  abierto,
  alternar,
  cambiarEstado,
}: {
  lead: Lead;
  abierto: boolean;
  alternar: () => void;
  cambiarEstado: (id: string, estado: string) => void;
}) {
  const wa = `https://wa.me/${l.celular.replace(/\D/g, "")}`;
  return (
    <li className="py-4">
      <div className="grid gap-x-6 gap-y-2 md:grid-cols-[7rem_minmax(0,1.3fr)_minmax(0,1.5fr)_minmax(0,1fr)_9rem] md:items-center">
        <p className="text-sm text-steel tabular-nums">{fecha.format(new Date(l.creado))}</p>
        <div className="min-w-0">
          <p className="truncate font-semibold">{l.nombre}</p>
          {l.empresa && <p className="truncate text-sm text-steel">{l.empresa}</p>}
        </div>
        <div className="flex min-w-0 flex-col text-sm">
          <a href={`mailto:${l.email}`} className="truncate underline-offset-2 hover:underline">
            {l.email}
          </a>
          <a href={wa} target="_blank" rel="noopener" className="w-fit font-semibold text-signal-soft underline-offset-2 hover:underline">
            {l.celular} · WhatsApp
          </a>
        </div>
        <p className="text-sm">
          {etiqueta("perfil", l.perfil)} · {etiqueta("ciudad", l.ciudad)}
          {perfilCompleto(l) && <span className="ml-2 rotulo text-signal-soft">perfil</span>}
        </p>
        <div className="flex items-center gap-2">
          <label htmlFor={`estado-${l.id}`} className="sr-only">
            Estado de {l.nombre}
          </label>
          <select
            id={`estado-${l.id}`}
            value={l.estado}
            onChange={(e) => cambiarEstado(l.id, e.target.value)}
            className="min-h-11 w-full border border-bone/25 bg-ink-2 px-2 text-sm text-bone"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>
          <button onClick={alternar} aria-expanded={abierto} aria-label={abierto ? "Ocultar detalle" : "Ver detalle"} className="flex size-11 shrink-0 items-center justify-center border border-bone/25 hover:border-bone">
            <span aria-hidden className={`transition-transform ${abierto ? "rotate-180" : ""}`}>
              ▾
            </span>
          </button>
        </div>
      </div>
      {abierto && (
        <dl className="mt-4 grid gap-x-6 gap-y-3 bg-ink-2 p-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <Dato k="Etapa" v={l.etapa && etiqueta("etapa", l.etapa)} />
          <Dato k="m² estimados" v={l.m2 && etiqueta("m2", l.m2)} />
          <Dato k="Intereses" v={l.intereses?.map((i) => etiqueta("intereses", i)).join(", ")} />
          <Dato k="Origen" v={[l.utm_source, l.utm_medium].filter(Boolean).join(" / ")} />
          <Dato k="Campaña" v={l.utm_campaign} />
          <Dato k="Anuncio" v={[l.utm_content, l.utm_term].filter(Boolean).join(" · ")} />
          <Dato k="Página" v={l.pagina} />
          <Dato k="Brevo" v={l.brevo} />
        </dl>
      )}
    </li>
  );
}

function Dato({ k, v }: { k: string; v: string | null | undefined }) {
  return (
    <div className="min-w-0">
      <dt className="rotulo text-steel">{k}</dt>
      <dd className="mt-1 [overflow-wrap:anywhere]">{v || "—"}</dd>
    </div>
  );
}

/** CSV con ";" y BOM para que Excel en español lo abra con tildes y columnas bien. */
function descargarCsv(leads: Lead[]) {
  const columnas: [string, (l: Lead) => string | null | undefined][] = [
    ["Fecha", (l) => fecha.format(new Date(l.creado))],
    ["Nombre", (l) => l.nombre],
    ["Correo", (l) => l.email],
    ["Celular", (l) => l.celular],
    ["Perfil", (l) => etiqueta("perfil", l.perfil)],
    ["Ciudad", (l) => etiqueta("ciudad", l.ciudad)],
    ["Estado", (l) => etiquetaEstado(l.estado)],
    ["Empresa", (l) => l.empresa],
    ["Etapa", (l) => l.etapa && etiqueta("etapa", l.etapa)],
    ["m² estimados", (l) => l.m2 && etiqueta("m2", l.m2)],
    ["Intereses", (l) => l.intereses?.map((i) => etiqueta("intereses", i)).join(", ")],
    ["utm_source", (l) => l.utm_source],
    ["utm_medium", (l) => l.utm_medium],
    ["utm_campaign", (l) => l.utm_campaign],
    ["utm_content", (l) => l.utm_content],
    ["utm_term", (l) => l.utm_term],
    ["Página", (l) => l.pagina],
  ];
  // Las comillas protegen ";" y saltos de línea; el apóstrofo evita que Excel ejecute fórmulas.
  const celda = (v: string | null | undefined) => `"${(v ?? "").replace(/^[=+\-@]/, "'$&").replace(/"/g, '""')}"`;
  const csv = [columnas.map(([k]) => celda(k)).join(";"), ...leads.map((l) => columnas.map(([, f]) => celda(f(l))).join(";"))].join("\r\n");
  const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: `leads-decortiles-${diaBogota.format(new Date())}.csv` });
  a.click();
  URL.revokeObjectURL(url);
}
