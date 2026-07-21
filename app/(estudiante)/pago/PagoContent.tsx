"use client";

import { useState, useActionState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard, Building2, User, FileText, Mail, ChevronDown,
  CheckCircle2, Loader2, AlertCircle, ArrowRight, BookOpen,
  Infinity as InfinityIcon, ShieldCheck, Lock,
} from "lucide-react";
import Link from "next/link";
import { procesarPagoCurso, procesarPagoMembresia, type PagoResult } from "./actions";
import type { CursoPublicado } from "@/lib/db/cursos";

const EASE = [0.16, 1, 0.3, 1] as const;

const BANCOS = [
  { value: "bancolombia",  label: "Bancolombia" },
  { value: "davivienda",   label: "Davivienda" },
  { value: "bogota",       label: "Banco de Bogotá" },
  { value: "occidente",    label: "Banco de Occidente" },
  { value: "popular",      label: "Banco Popular" },
  { value: "colpatria",    label: "Colpatria" },
  { value: "avvillas",     label: "AV Villas" },
  { value: "agrario",      label: "Banco Agrario" },
  { value: "bbva",         label: "BBVA Colombia" },
  { value: "itau",         label: "Itaú" },
  { value: "scotiabank",   label: "Scotiabank Colpatria" },
  { value: "nequi",        label: "Nequi" },
];

const TIPOS_PERSONA = [
  { value: "natural",  label: "Persona Natural" },
  { value: "juridica", label: "Persona Jurídica" },
];

const TIPOS_DOC = [
  { value: "CC",  label: "Cédula de Ciudadanía (CC)" },
  { value: "CE",  label: "Cédula de Extranjería (CE)" },
  { value: "NIT", label: "NIT" },
  { value: "PP",  label: "Pasaporte" },
];

const inputCls = (err?: boolean) =>
  [
    "h-11 w-full rounded-xl border bg-ink-800/70 px-4 text-sm text-white placeholder:text-mist-600",
    "outline-none transition focus:ring-1",
    err
      ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
      : "border-white/10 focus:border-gold-500/50 focus:ring-gold-500/20",
  ].join(" ");

const selectCls = (err?: boolean) =>
  `${inputCls(err)} appearance-none cursor-pointer`;

/* ── PSE Form shared between both flows ── */
function FormPSE({
  action,
  extraFields,
  monto,
  concepto,
  pending,
}: {
  action: (prev: PagoResult | null, fd: FormData) => Promise<PagoResult>;
  extraFields?: React.ReactNode;
  monto: string;
  concepto: string;
  pending: boolean;
}) {
  const [result, formAction, isPending] = useActionState(action, null);

  if (result?.ok) return null; // handled by parent

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {extraFields}

      {/* Banco */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mist-400">
          <Building2 className="h-3.5 w-3.5 text-gold-500" />
          Banco
        </label>
        <div className="relative">
          <select name="banco" className={selectCls()} defaultValue="">
            <option value="" disabled>Selecciona tu banco</option>
            {BANCOS.map((b) => (
              <option key={b.value} value={b.value}>{b.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
        </div>
      </div>

      {/* Tipo persona */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mist-400">
          <User className="h-3.5 w-3.5 text-gold-500" />
          Tipo de persona
        </label>
        <div className="relative">
          <select name="tipo_persona" className={selectCls()} defaultValue="">
            <option value="" disabled>Selecciona</option>
            {TIPOS_PERSONA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
        </div>
      </div>

      {/* Tipo y número de documento */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mist-400">
            <FileText className="h-3.5 w-3.5 text-gold-500" />
            Tipo doc.
          </label>
          <div className="relative">
            <select name="tipo_doc" className={selectCls()} defaultValue="">
              <option value="" disabled>—</option>
              {TIPOS_DOC.map((t) => (
                <option key={t.value} value={t.value}>{t.value}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-[11px] uppercase tracking-wider text-mist-400">
            &nbsp;Número
          </label>
          <input
            type="text"
            name="num_doc"
            placeholder="1234567890"
            className={inputCls()}
            inputMode="numeric"
          />
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-mist-400">
          <Mail className="h-3.5 w-3.5 text-gold-500" />
          Correo para notificación
        </label>
        <input
          type="email"
          name="email_pago"
          placeholder="correo@ejemplo.com"
          className={inputCls()}
        />
      </div>

      {/* Resumen */}
      <div className="rounded-xl border border-white/8 bg-ink-900/60 px-5 py-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist-400">{concepto}</span>
          <span className="font-display text-lg font-bold text-gold-400">{monto}</span>
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <Lock className="h-3.5 w-3.5 text-mist-500" />
          <span className="font-mono text-[10px] text-mist-500 uppercase tracking-wider">
            Pago 100% seguro · PSE Colombia
          </span>
        </div>
      </div>

      {result && !result.ok && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
          <p className="text-sm text-red-300">{result.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex h-12 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-all hover:bg-gold-400 disabled:opacity-60 active:scale-[0.98]"
      >
        {isPending ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Procesando pago…</>
        ) : (
          <><ShieldCheck className="h-4 w-4" /> Pagar con PSE</>
        )}
      </button>

      <div className="flex items-center justify-center gap-3">
        {["Bancolombia", "Davivienda", "Colpatria", "BBVA"].map((b) => (
          <span key={b} className="font-mono text-[9px] uppercase tracking-widest text-mist-600">{b}</span>
        ))}
      </div>
    </form>
  );
}

/* ── Success screen ── */
function Exito({ plan, cursoId }: { plan: string; cursoId?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center gap-6 py-12 text-center"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/12">
        <CheckCircle2 className="h-10 w-10 text-green-400" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-white">¡Pago exitoso!</h2>
        <p className="mt-2 text-mist-400">
          {plan === "membresia"
            ? "Tu membresía ilimitada está activa. Accede a todos los cursos."
            : "Tu curso ha sido desbloqueado. ¡Comienza a aprender ahora!"}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {plan === "membresia" ? (
          <Link
            href="/clases"
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
          >
            <InfinityIcon className="h-4 w-4" />
            Ver todos los cursos
          </Link>
        ) : cursoId ? (
          <Link
            href={`/cursos/${cursoId}`}
            className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
          >
            <ArrowRight className="h-4 w-4" />
            Ir al curso
          </Link>
        ) : null}
        <Link
          href="/dashboard"
          className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-mist-300 hover:border-white/20 hover:text-white transition-colors"
        >
          Ir al dashboard
        </Link>
      </div>
    </motion.div>
  );
}

/* ── Plan selector when no plan is pre-selected ── */
function SelectorPlan({ onSelect }: { onSelect: (plan: "curso" | "membresia") => void }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Elige tu plan</h1>
        <p className="mt-1 text-sm text-mist-400">
          Selecciona cómo quieres acceder al contenido de Team 100%.
        </p>
      </div>
      <div className="grid gap-4">
        <button
          onClick={() => onSelect("curso")}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-6 py-5 text-left transition hover:border-gold-500/30 hover:bg-ink-900 group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/10">
              <BookOpen className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <p className="font-display font-bold text-white">Por Curso</p>
              <p className="text-sm text-mist-400">Paga solo el curso que quieres</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-mist-500 transition group-hover:text-gold-400" />
        </button>

        <button
          onClick={() => onSelect("membresia")}
          className="flex items-center justify-between rounded-xl border border-gold-500/30 bg-gradient-to-b from-gold-500/[0.07] to-transparent px-6 py-5 text-left transition hover:border-gold-500/50 group"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/15">
              <InfinityIcon className="h-5 w-5 text-gold-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-display font-bold text-gold-300">Plan Ilimitado</p>
                <span className="rounded-full bg-gold-500 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink-950">Popular</span>
              </div>
              <p className="text-sm text-mist-400">Todos los cursos por $100/mes</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-mist-500 transition group-hover:text-gold-400" />
        </button>
      </div>
    </div>
  );
}

/* ── Main ── */
export function PagoContent({
  plan: planInicial,
  cursos,
}: {
  plan?: string;
  cursos: CursoPublicado[];
}) {
  const [plan, setPlan] = useState<string | undefined>(planInicial);
  const [cursoSeleccionado, setCursoSeleccionado] = useState<CursoPublicado | null>(null);
  const [pagoOk, setPagoOk] = useState(false);
  const [cursoIdPagado, setCursoIdPagado] = useState<string | undefined>();

  // Wrapper actions to detect success
  async function accionCurso(_prev: PagoResult | null, fd: FormData): Promise<PagoResult> {
    const r = await procesarPagoCurso(_prev, fd);
    if (r.ok) { setPagoOk(true); setCursoIdPagado(String(fd.get("curso_id") ?? "")); }
    return r;
  }

  async function accionMembresia(_prev: PagoResult | null, fd: FormData): Promise<PagoResult> {
    const r = await procesarPagoMembresia(_prev, fd);
    if (r.ok) setPagoOk(true);
    return r;
  }

  if (pagoOk) {
    return <Exito plan={plan ?? "curso"} cursoId={cursoIdPagado} />;
  }

  if (!plan) {
    return <SelectorPlan onSelect={setPlan} />;
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 rounded-full border border-gold-500/20 bg-gold-500/8 px-4 py-1.5 mb-4">
          {plan === "membresia" ? (
            <><InfinityIcon className="h-3.5 w-3.5 text-gold-400" /><span className="font-mono text-xs text-gold-400 uppercase tracking-wider">Plan Ilimitado</span></>
          ) : (
            <><BookOpen className="h-3.5 w-3.5 text-gold-400" /><span className="font-mono text-xs text-gold-400 uppercase tracking-wider">Compra por curso</span></>
          )}
        </div>
        <h1 className="font-display text-2xl font-bold text-white">
          {plan === "membresia" ? "Activa tu membresía ilimitada" : "Elige tu curso"}
        </h1>
        <p className="mt-1 text-sm text-mist-400">
          {plan === "membresia"
            ? "Accede a todos los cursos, certificados y nuevo contenido por $100/mes."
            : "Selecciona el curso que quieres comprar y completa el pago con PSE."}
        </p>
      </div>

      {plan === "membresia" ? (
        /* ── MEMBRESÍA ── */
        <div className="rounded-2xl border border-gold-500/20 bg-gradient-to-b from-gold-500/[0.06] to-transparent p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="font-display text-lg font-bold text-white">Plan Ilimitado</p>
              <p className="text-sm text-mist-400">Todos los cursos · Todos los certificados</p>
            </div>
            <div className="text-right">
              <p className="font-display text-3xl font-extrabold text-gold-400">$100</p>
              <p className="font-mono text-xs text-mist-500">/mes USD</p>
            </div>
          </div>
          <FormPSE
            action={accionMembresia}
            monto="$100 USD"
            concepto="Plan Ilimitado — 1 mes"
            pending={false}
          />
        </div>
      ) : (
        /* ── POR CURSO ── */
        <div className="flex flex-col gap-4">
          {/* Catálogo */}
          {!cursoSeleccionado ? (
            <>
              <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
                {cursos.length} curso{cursos.length !== 1 ? "s" : ""} disponible{cursos.length !== 1 ? "s" : ""}
              </p>
              <div className="grid gap-3">
                {cursos.map((c) => (
                  <motion.button
                    key={c.id}
                    onClick={() => setCursoSeleccionado(c)}
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-5 py-4 text-left transition hover:border-gold-500/30 hover:bg-ink-900/80"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
                        <BookOpen className="h-4 w-4 text-gold-400" />
                      </div>
                      <span className="font-medium text-sm text-white">{c.titulo}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-display text-lg font-bold text-gold-400">
                        ${c.precio}
                      </span>
                      <ArrowRight className="h-4 w-4 text-mist-500" />
                    </div>
                  </motion.button>
                ))}
                {cursos.length === 0 && (
                  <div className="rounded-xl border border-white/8 bg-ink-900/40 px-6 py-10 text-center">
                    <p className="text-mist-500">No hay cursos disponibles en este momento.</p>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Formulario PSE para el curso seleccionado */
            <AnimatePresence mode="wait">
              <motion.div
                key="pse-curso"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="rounded-2xl border border-white/10 bg-ink-900/60 p-6"
              >
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-mist-500 mb-1">Curso seleccionado</p>
                    <p className="font-display text-base font-bold text-white">{cursoSeleccionado.titulo}</p>
                  </div>
                  <button
                    onClick={() => setCursoSeleccionado(null)}
                    className="shrink-0 rounded-lg border border-white/10 px-3 py-1.5 font-mono text-xs text-mist-400 hover:border-white/20 hover:text-white transition-colors"
                  >
                    Cambiar
                  </button>
                </div>

                <FormPSE
                  action={accionCurso}
                  monto={`$${cursoSeleccionado.precio} USD`}
                  concepto={cursoSeleccionado.titulo}
                  pending={false}
                  extraFields={
                    <input type="hidden" name="curso_id" value={cursoSeleccionado.id} />
                  }
                />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Seguridad */}
      <div className="flex items-center justify-center gap-6 border-t border-white/8 pt-4">
        <div className="flex items-center gap-1.5 text-mist-600">
          <ShieldCheck className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">Cifrado SSL</span>
        </div>
        <div className="flex items-center gap-1.5 text-mist-600">
          <Lock className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">PSE Colombia</span>
        </div>
        <div className="flex items-center gap-1.5 text-mist-600">
          <CreditCard className="h-3.5 w-3.5" />
          <span className="font-mono text-[10px]">Pago seguro</span>
        </div>
      </div>
    </div>
  );
}
