"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { PerfilId } from "@/content/perfiles";
import { OPCIONES, leadCamposSchema, perfilamientoSchema } from "@/lib/lead-schema";
import { nuevoEventId, trackLead } from "@/lib/tracking";
import { capturarTracking } from "@/lib/utm";
import { useLead } from "./LeadContext";
import WhatsAppLink, { IconoChat } from "./WhatsAppLink";

interface Props {
  /** Prefijo único para los ids de los campos (hay dos formularios en la página). */
  id: string;
  perfil: PerfilId;
  cta: string;
  whatsapp: string;
}

type Valores = {
  nombre: string;
  email: string;
  celular: string;
  perfil: string;
  ciudad: string;
  autorizacion: boolean;
};
type Campo = keyof Valores;
type Errores = Partial<Record<Campo, string>>;

const ORDEN: Campo[] = ["nombre", "celular", "email", "perfil", "ciudad", "autorizacion"];
const ERROR_RED = "No hay conexión. Revisa tu internet o escríbenos por WhatsApp.";

const etiquetaCampo = "mb-1 block text-[0.8rem] font-semibold";

function primerosErrores(campos: Partial<Record<string, string[] | undefined>>): Errores {
  const out: Errores = {};
  for (const c of ORDEN) if (campos[c]?.[0]) out[c] = campos[c]![0];
  return out;
}

export default function LeadForm({ id, perfil, cta, whatsapp }: Props) {
  const { lead } = useLead();
  return (
    <div className="bg-bone text-ink shadow-[0_30px_80px_-30px_rgb(0_0_0/0.7)]">
      <div className="h-1.5 bg-signal" aria-hidden />
      <div className="p-4 min-[360px]:p-5 sm:p-7">
        {lead ? <Gracias id={id} perfil={perfil} whatsapp={whatsapp} /> : <Registro id={id} perfil={perfil} cta={cta} whatsapp={whatsapp} />}
      </div>
    </div>
  );
}

function Registro({ id, perfil, cta, whatsapp }: Props) {
  const { setLead } = useLead();
  const [v, setV] = useState<Valores>({
    nombre: "",
    email: "",
    celular: "",
    perfil: perfil === "general" ? "" : perfil,
    ciudad: "",
    autorizacion: false,
  });
  const [errores, setErrores] = useState<Errores>({});
  const [errorGeneral, setErrorGeneral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const intentado = useRef(false);
  const inicio = useRef(0);
  const honeypot = useRef<HTMLInputElement>(null);
  const form = useRef<HTMLFormElement>(null);

  useEffect(() => {
    inicio.current = Date.now();
  }, []);

  function validar(valores: Valores) {
    const r = leadCamposSchema.safeParse(valores);
    return r.success ? { ok: true as const, data: r.data } : { ok: false as const, errores: primerosErrores(r.error.flatten().fieldErrors) };
  }

  function cambiar<K extends Campo>(campo: K, valor: Valores[K]) {
    const next = { ...v, [campo]: valor };
    setV(next);
    // Tras el primer intento, revalida en vivo para que el error desaparezca al corregir.
    if (intentado.current) {
      const r = validar(next);
      setErrores(r.ok ? {} : r.errores);
    }
  }

  function enfocarPrimerError(e: Errores) {
    const campo = ORDEN.find((c) => e[c]);
    if (campo) form.current?.querySelector<HTMLElement>(`#${id}-${campo}`)?.focus();
  }

  async function enviar(ev: React.FormEvent) {
    ev.preventDefault();
    if (enviando) return;
    intentado.current = true;
    setErrorGeneral("");
    const r = validar(v);
    if (!r.ok) {
      setErrores(r.errores);
      enfocarPrimerError(r.errores);
      return;
    }
    setErrores({});
    setEnviando(true);
    const eventId = nuevoEventId();
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...r.data,
          paso: 1,
          sitio_web: honeypot.current?.value ?? "",
          ms: Math.max(0, Date.now() - inicio.current),
          tracking: capturarTracking(),
          eventId,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; token?: string; error?: string; campos?: Record<string, string[]> };
      if (!res.ok || !data.ok) {
        const e = data.campos ? primerosErrores(data.campos) : {};
        setErrores(e);
        setErrorGeneral(data.error ?? "No pudimos registrar tus datos. Intenta de nuevo.");
        setEnviando(false);
        return;
      }
      trackLead(r.data.perfil, eventId);
      setLead({ nombre: r.data.nombre.split(" ")[0], email: r.data.email, token: data.token ?? "", origen: id });
    } catch {
      setErrorGeneral(ERROR_RED);
      setEnviando(false);
    }
  }

  const err = (c: Campo) =>
    errores[c] ? (
      <p id={`${id}-${c}-error`} className="mt-1 text-[0.8rem] font-medium text-error">
        {errores[c]}
      </p>
    ) : null;
  const attrs = (c: Campo) => ({
    id: `${id}-${c}`,
    name: c,
    "aria-invalid": errores[c] ? ("true" as const) : undefined,
    "aria-describedby": errores[c] ? `${id}-${c}-error` : undefined,
  });

  return (
    <form ref={form} onSubmit={enviar} noValidate aria-labelledby={`${id}-titulo`}>
      <p className="rotulo text-signal-strong">Registro para profesionales</p>
      <h2 id={`${id}-titulo`} className="display mt-1.5 text-[clamp(1.5rem,1.25rem+1vw,2rem)] text-ink">
        Stock, tendencias y fichas en tu correo
      </h2>
      <p className="mt-1.5 text-[0.85rem] leading-snug text-ink/70 max-[379px]:hidden sm:text-sm">
        Un correo al mes y alertas cuando llega material. Te das de baja con un clic.
      </p>

      {/* Nombre/celular en una columna por debajo de 360 px; perfil y ciudad siempre en dos (selects cortos). */}
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 min-[360px]:mt-4 min-[360px]:gap-y-3">
        <div className="col-span-2 min-[360px]:col-span-1">
          <label htmlFor={`${id}-nombre`} className={etiquetaCampo}>
            Nombre
          </label>
          <input
            {...attrs("nombre")}
            className="campo"
            type="text"
            autoComplete="name"
            autoCapitalize="words"
            enterKeyHint="next"
            value={v.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
          />
          {err("nombre")}
        </div>
        <div className="col-span-2 min-[360px]:col-span-1">
          <label htmlFor={`${id}-celular`} className={etiquetaCampo}>
            Celular
          </label>
          <input
            {...attrs("celular")}
            className="campo"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            enterKeyHint="next"
            placeholder="312 345 6789"
            value={v.celular}
            onChange={(e) => cambiar("celular", e.target.value)}
          />
          {err("celular")}
        </div>
        <div className="col-span-2">
          <label htmlFor={`${id}-email`} className={etiquetaCampo}>
            Correo
          </label>
          <input
            {...attrs("email")}
            className="campo"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            enterKeyHint="next"
            spellCheck={false}
            value={v.email}
            onChange={(e) => cambiar("email", e.target.value)}
          />
          {err("email")}
        </div>
        <div>
          <label htmlFor={`${id}-perfil`} className={etiquetaCampo}>
            Perfil
          </label>
          <select {...attrs("perfil")} className="campo" autoComplete="organization-title" value={v.perfil} onChange={(e) => cambiar("perfil", e.target.value)}>
            <option value="" disabled>
              Elige…
            </option>
            {OPCIONES.perfil.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {err("perfil")}
        </div>
        <div>
          <label htmlFor={`${id}-ciudad`} className={etiquetaCampo}>
            Ciudad
          </label>
          <select {...attrs("ciudad")} className="campo" autoComplete="address-level2" value={v.ciudad} onChange={(e) => cambiar("ciudad", e.target.value)}>
            <option value="" disabled>
              Elige…
            </option>
            {OPCIONES.ciudad.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          {err("ciudad")}
        </div>
      </div>

      {/* Honeypot: invisible para personas, tentador para bots. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor={`${id}-sitio_web`}>No llenar este campo</label>
        <input ref={honeypot} id={`${id}-sitio_web`} name="sitio_web" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="mt-3">
        <label className="flex min-h-11 cursor-pointer items-start gap-3 py-1.5 text-[0.8rem] leading-snug text-ink/80">
          <input
            {...attrs("autorizacion")}
            type="checkbox"
            className="mt-px size-6 shrink-0 accent-ink"
            checked={v.autorizacion}
            onChange={(e) => cambiar("autorizacion", e.target.checked)}
          />
          <span>
            Autorizo el tratamiento de mis datos para recibir información comercial, según la{" "}
            <Link href="/politica-de-datos" target="_blank" className="font-semibold underline underline-offset-2">
              política de datos
            </Link>{" "}
            (Ley 1581 de 2012).
          </span>
        </label>
        {err("autorizacion")}
      </div>

      <button
        type="submit"
        disabled={enviando}
        className="group mt-4 flex min-h-14 w-full items-center justify-between gap-3 bg-signal-strong px-5 text-left text-base font-bold text-white transition-colors hover:bg-ink disabled:opacity-70"
      >
        <span>{enviando ? "Enviando…" : cta}</span>
        <span aria-hidden className="text-xl transition-transform group-hover:translate-x-1">
          →
        </span>
      </button>

      <p role="alert" aria-live="assertive" className="mt-3 text-sm font-semibold text-error empty:hidden">
        {errorGeneral}
      </p>

      <p className="mt-2 flex flex-wrap items-center justify-center gap-x-1 text-center text-[0.8rem] text-ink/70">
        ¿Prefieres hablar ya?
        <WhatsAppLink
          mensaje={whatsapp}
          perfil={perfil}
          origen={`${id}-form`}
          className="inline-flex min-h-11 items-center px-1 font-semibold text-ink underline underline-offset-2"
        >
          Escríbenos por WhatsApp
        </WhatsAppLink>
      </p>
    </form>
  );
}

function Gracias({ id, perfil, whatsapp }: Omit<Props, "cta">) {
  const { lead, perfilCompleto } = useLead();
  const titulo = useRef<HTMLHeadingElement>(null);
  const esOrigen = lead?.origen === id;

  useEffect(() => {
    // Lleva el foco al mensaje para lectores de pantalla, solo en el formulario que se usó.
    if (esOrigen) titulo.current?.focus();
  }, [esOrigen]);

  if (!lead) return null;
  return (
    <div role="status" aria-live="polite">
      <p className="rotulo text-signal-strong">Registro confirmado</p>
      <h2 ref={titulo} tabIndex={-1} className="display mt-1.5 text-[clamp(1.9rem,1.5rem+1.6vw,2.4rem)] text-ink outline-none">
        Listo, {lead.nombre}.
      </h2>
      <p className="mt-2 text-[0.95rem] leading-relaxed text-ink/80">
        Revisa tu correo <strong className="text-ink [overflow-wrap:anywhere]">{lead.email}</strong> (y la carpeta de promociones).
        Si necesitas cotizar hoy, no esperes el correo:
      </p>
      <WhatsAppLink
        mensaje={whatsapp}
        perfil={perfil}
        origen={`${id}-gracias`}
        className="mt-4 flex min-h-14 w-full items-center justify-center gap-2.5 bg-ink px-5 text-center text-base font-bold text-bone transition-colors hover:bg-signal-strong"
      >
        <IconoChat />
        Cotizar ya por WhatsApp
      </WhatsAppLink>
      {lead.token && (perfilCompleto ? <PerfilListo /> : <Perfilamiento id={id} />)}
    </div>
  );
}

function PerfilListo() {
  return (
    <p className="mt-6 border-t border-ink/15 pt-5 text-sm font-semibold text-ink">
      Perfil guardado. Lo que te enviemos va a ir filtrado para tu proyecto.
    </p>
  );
}

/** Opción táctil (≥44 px) para radio y checkbox, con marca visible al seleccionar. */
function Chip({
  type,
  name,
  value,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  value: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-2 border-[1.5px] border-ink/25 bg-white px-3 py-2 text-[0.9rem] leading-tight font-medium transition-colors select-none has-[:checked]:border-ink has-[:checked]:bg-ink has-[:checked]:text-bone has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-signal">
      <input type={type} name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      <span
        aria-hidden
        className={`flex size-4 shrink-0 items-center justify-center border-[1.5px] text-[0.65rem] ${type === "radio" ? "rounded-full" : ""} ${
          checked ? "border-bone bg-bone text-ink" : "border-ink/40"
        }`}
      >
        {checked ? "✓" : ""}
      </span>
      {children}
    </label>
  );
}

function Perfilamiento({ id }: { id: string }) {
  const { lead, setPerfilCompleto } = useLead();
  const [empresa, setEmpresa] = useState("");
  const [etapa, setEtapa] = useState("");
  const [m2, setM2] = useState("");
  const [intereses, setIntereses] = useState<string[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  if (!lead) return null;

  async function guardar(ev: React.FormEvent) {
    ev.preventDefault();
    setError("");
    const r = perfilamientoSchema.safeParse({
      paso: 2,
      token: lead!.token,
      email: lead!.email,
      empresa: empresa || undefined,
      etapa: etapa || undefined,
      m2: m2 || undefined,
      intereses: intereses.length ? intereses : undefined,
    });
    if (!r.success) {
      setError("Revisa los datos.");
      return;
    }
    setEnviando(true);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(r.data),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "No pudimos guardar. Tus datos principales ya quedaron registrados.");
        setEnviando(false);
        return;
      }
      setPerfilCompleto(true);
    } catch {
      setError(ERROR_RED);
      setEnviando(false);
    }
  }

  const toggle = (val: string) => setIntereses((xs) => (xs.includes(val) ? xs.filter((x) => x !== val) : [...xs, val]));

  return (
    <form onSubmit={guardar} className="mt-6 border-t border-ink/15 pt-5" aria-labelledby={`${id}-p2`}>
      <h3 id={`${id}-p2`} className="text-base font-bold text-ink">
        Afina lo que te enviamos <span className="font-normal text-ink/70">· opcional, 20 segundos</span>
      </h3>

      <label htmlFor={`${id}-empresa`} className={`mt-4 ${etiquetaCampo}`}>
        Empresa
      </label>
      <input
        id={`${id}-empresa`}
        name="empresa"
        className="campo"
        type="text"
        autoComplete="organization"
        enterKeyHint="done"
        value={empresa}
        onChange={(e) => setEmpresa(e.target.value)}
      />

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-[0.8rem] font-semibold">Etapa del proyecto</legend>
        <div className="grid grid-cols-2 gap-2">
          {OPCIONES.etapa.map((o) => (
            <Chip key={o.value} type="radio" name={`${id}-etapa`} value={o.value} checked={etapa === o.value} onChange={() => setEtapa(o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <label htmlFor={`${id}-m2`} className={`mt-4 ${etiquetaCampo}`}>
        m² estimados
      </label>
      <select id={`${id}-m2`} name="m2" className="campo" autoComplete="off" value={m2} onChange={(e) => setM2(e.target.value)}>
        <option value="">Sin definir</option>
        {OPCIONES.m2.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      <fieldset className="mt-4">
        <legend className="mb-1.5 text-[0.8rem] font-semibold">Qué te interesa · puedes marcar varias</legend>
        <div className="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
          {OPCIONES.intereses.map((o) => (
            <Chip key={o.value} type="checkbox" name={`${id}-intereses`} value={o.value} checked={intereses.includes(o.value)} onChange={() => toggle(o.value)}>
              {o.label}
            </Chip>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={enviando}
        className="mt-5 min-h-12 w-full border-2 border-ink px-5 text-base font-bold text-ink transition-colors hover:bg-ink hover:text-bone disabled:opacity-60"
      >
        {enviando ? "Guardando…" : "Guardar mi perfil"}
      </button>
      {error && (
        <p role="alert" className="mt-3 text-sm font-semibold text-error">
          {error}
        </p>
      )}
    </form>
  );
}
