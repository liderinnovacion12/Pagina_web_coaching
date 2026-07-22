"use client";

import { useActionState, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Building2,
  Smartphone,
  User,
  FileText,
  Mail,
  Phone,
  ChevronDown,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  BookOpen,
  Infinity as InfinityIcon,
  ShieldCheck,
  Lock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import {
  iniciarPagoPSE,
  iniciarPagoNequi,
  generarUrlTarjeta,
  type PagoResult,
} from "./actions";
import type { CursoPublicado } from "@/lib/db/cursos";
import type { PseBanco } from "@/lib/wompi/client";

const EASE = [0.16, 1, 0.3, 1] as const;

const TIPOS_PERSONA = [
  { value: "natural", label: "Persona Natural" },
  { value: "juridica", label: "Persona Jurídica" },
];

const TIPOS_DOC = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "CE", label: "Cédula de Extranjería" },
  { value: "NIT", label: "NIT" },
  { value: "PP", label: "Pasaporte" },
];

type MetodoPago = "tarjeta" | "pse" | "nequi";

const METODOS: { id: MetodoPago; label: string; icon: React.ReactNode; sub: string }[] = [
  { id: "tarjeta", label: "Tarjeta", icon: <CreditCard className="h-4 w-4" />, sub: "Visa · Mastercard · Amex" },
  { id: "pse",     label: "PSE",     icon: <Building2  className="h-4 w-4" />, sub: "Débito bancario" },
  { id: "nequi",   label: "Nequi",   icon: <Smartphone className="h-4 w-4" />, sub: "Nequi · Daviplata" },
];

// ── Field helpers ─────────────────────────────────────────────────────────────

const field = (err?: boolean) =>
  [
    "h-11 w-full rounded-xl border bg-ink-800/60 px-4 text-sm text-white placeholder:text-mist-500",
    "outline-none transition-colors focus:ring-1",
    err
      ? "border-red-500/50 focus:border-red-500/60 focus:ring-red-500/20"
      : "border-white/10 focus:border-gold-500/50 focus:ring-gold-500/20",
  ].join(" ");

const sel = (err?: boolean) => `${field(err)} appearance-none cursor-pointer`;

function FieldLabel({ icon, children }: { icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-mist-400 mb-1.5">
      {icon && <span className="text-gold-500">{icon}</span>}
      {children}
    </label>
  );
}

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
      <p className="text-sm text-red-300">{message}</p>
    </div>
  );
}

function SubmitBtn({ pending, children }: { pending: boolean; children: React.ReactNode }) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.2)] transition-all hover:bg-gold-400 disabled:opacity-60 active:scale-[0.98]"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  );
}

// ── Success screen ────────────────────────────────────────────────────────────

function Exito({ plan, cursoId }: { plan: string; cursoId?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="flex flex-col items-center gap-6 py-14 text-center"
    >
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-green-500/10 animate-ping" style={{ animationDuration: "2s" }} />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-green-500/30 bg-green-500/10">
          <CheckCircle2 className="h-9 w-9 text-green-400" />
        </div>
      </div>
      <div>
        <h2 className="font-display text-2xl font-bold text-white">¡Pago confirmado!</h2>
        <p className="mt-2 max-w-xs text-sm text-mist-400">
          {plan === "membresia"
            ? "Tu membresía ilimitada está activa. Accede a todos los cursos sin límites."
            : "Tu curso ha sido desbloqueado. Puedes empezar ahora."}
        </p>
      </div>
      <div className="flex flex-col gap-3 w-full max-w-xs">
        {plan === "membresia" ? (
          <Link href="/clases" className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors">
            <InfinityIcon className="h-4 w-4" /> Ver todos los cursos
          </Link>
        ) : cursoId ? (
          <Link href={`/cursos/${cursoId}`} className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors">
            <ArrowRight className="h-4 w-4" /> Ir al curso
          </Link>
        ) : null}
        <Link href="/dashboard" className="flex h-11 items-center justify-center rounded-xl border border-white/10 text-sm text-mist-400 hover:border-white/20 hover:text-white transition-colors">
          Ir al dashboard
        </Link>
      </div>
    </motion.div>
  );
}

// ── Nequi waiting screen ──────────────────────────────────────────────────────

function NequiEsperando({ transactionId }: { transactionId: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE }}
      className="flex flex-col items-center gap-6 py-10 text-center"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#7B2D8B]/15 border border-[#7B2D8B]/30">
        <Smartphone className="h-8 w-8 text-[#CE6BDB]" />
      </div>
      <div>
        <h3 className="font-display text-xl font-bold text-white">Revisa tu app Nequi</h3>
        <p className="mt-2 text-sm text-mist-400 max-w-xs">
          Te enviamos una notificación a tu celular. Aprueba el pago en la aplicación Nequi para continuar.
        </p>
      </div>
      <div className="w-full rounded-2xl border border-white/8 bg-ink-900/60 p-4 text-left space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
          <span className="font-mono text-xs text-mist-400">Esperando confirmación…</span>
        </div>
        <p className="font-mono text-[10px] text-mist-500 truncate">ID: {transactionId}</p>
      </div>
      <p className="text-xs text-mist-500 max-w-xs">
        Si la notificación no llegó, abre Nequi y ve a <strong className="text-mist-400">Pagos pendientes</strong>.
      </p>
    </motion.div>
  );
}

// ── Resumen de orden ──────────────────────────────────────────────────────────

function ResumenOrden({
  plan,
  curso,
  leccionInfo,
}: {
  plan: string;
  curso: CursoPublicado | null;
  leccionInfo?: { titulo: string; precio: number };
}) {
  const precio = plan === "membresia" ? 100 : leccionInfo ? leccionInfo.precio : (curso?.precio ?? 0);
  const copAprox = (precio * 4200).toLocaleString("es-CO");

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-ink-900/40 p-6 space-y-5">
      <h3 className="font-display text-sm font-semibold text-white">Resumen del pedido</h3>

      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500/12 border border-gold-500/20">
          {plan === "membresia"
            ? <InfinityIcon className="h-5 w-5 text-gold-400" />
            : <BookOpen className="h-5 w-5 text-gold-400" />}
        </div>
        <div>
          <p className="font-display text-sm font-semibold text-white leading-tight">
            {plan === "membresia" ? "Plan Ilimitado" : leccionInfo ? leccionInfo.titulo : (curso?.titulo ?? "Curso")}
          </p>
          <p className="text-xs text-mist-400 mt-0.5">
            {plan === "membresia" ? "Acceso total · 1 mes" : leccionInfo ? "Acceso de por vida al video" : "Acceso de por vida"}
          </p>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/[0.06] pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist-400">Subtotal</span>
          <span className="text-white">${precio} USD</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-mist-400">IVA</span>
          <span className="text-mist-400">Incluido</span>
        </div>
        <div className="flex items-center justify-between border-t border-white/[0.06] pt-2">
          <span className="font-display text-sm font-semibold text-white">Total</span>
          <div className="text-right">
            <p className="font-display text-lg font-bold text-gold-400">${precio} USD</p>
            <p className="font-mono text-[10px] text-mist-500">≈ ${copAprox} COP</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-white/[0.06] pt-4">
        {[
          { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "Cifrado SSL 256-bit" },
          { icon: <Lock className="h-3.5 w-3.5" />, label: "Procesado por Wompi" },
          { icon: <CheckCircle2 className="h-3.5 w-3.5" />, label: "Acceso inmediato al aprobar" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-mist-500">
            {item.icon}
            <span className="font-mono text-[10px]">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Plan selector ─────────────────────────────────────────────────────────────

function SelectorPlan({ onSelect }: { onSelect: (plan: "curso" | "membresia") => void }) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Elige tu plan</h1>
        <p className="mt-1 text-sm text-mist-400">Selecciona cómo quieres acceder al contenido de Team 100%.</p>
      </div>
      <div className="grid gap-3">
        <button
          onClick={() => onSelect("curso")}
          className="group flex items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-5 py-4 text-left transition hover:border-gold-500/30 hover:bg-ink-900/80"
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
          className="group flex items-center justify-between rounded-xl border border-gold-500/30 bg-gold-500/[0.04] px-5 py-4 text-left transition hover:border-gold-500/50 hover:bg-gold-500/[0.07]"
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

// ── Curso selector ────────────────────────────────────────────────────────────

function SelectorCurso({
  cursos,
  onSelect,
  onBack,
}: {
  cursos: CursoPublicado[];
  onSelect: (c: CursoPublicado) => void;
  onBack: () => void;
}) {
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1 font-mono text-xs text-mist-400 hover:text-white transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Volver
      </button>
      <div>
        <h2 className="font-display text-xl font-bold text-white">Elige tu curso</h2>
        <p className="mt-1 text-sm text-mist-400">{cursos.length} disponible{cursos.length !== 1 ? "s" : ""}</p>
      </div>
      <div className="space-y-2">
        {cursos.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => onSelect(c)}
            whileHover={{ x: 3 }}
            transition={{ duration: 0.15 }}
            className="flex w-full items-center justify-between rounded-xl border border-white/10 bg-ink-900/60 px-5 py-4 text-left hover:border-gold-500/30 hover:bg-ink-900/80 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10">
                <BookOpen className="h-4 w-4 text-gold-400" />
              </div>
              <span className="font-medium text-sm text-white truncate">{c.titulo}</span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-display text-base font-bold text-gold-400">${c.precio}</span>
              <ArrowRight className="h-4 w-4 text-mist-500" />
            </div>
          </motion.button>
        ))}
        {cursos.length === 0 && (
          <div className="rounded-xl border border-white/8 bg-ink-900/40 px-6 py-10 text-center">
            <p className="text-sm text-mist-500">No hay cursos disponibles en este momento.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Formulario Tarjeta ────────────────────────────────────────────────────────

function FormTarjeta({
  tipo,
  cursoId,
  leccionId,
}: {
  tipo: string;
  cursoId: string;
  leccionId?: string;
}) {
  const [result, formAction, pending] = useActionState(generarUrlTarjeta, null);

  useEffect(() => {
    if (result?.ok && "redirectUrl" in result) {
      window.location.href = result.redirectUrl;
    }
  }, [result]);

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="curso_id" value={cursoId} />
      {leccionId && <input type="hidden" name="leccion_id" value={leccionId} />}

      <div className="rounded-2xl border border-white/8 bg-ink-800/30 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-4 w-4 text-gold-400 shrink-0" />
          <p className="text-sm text-white font-medium">Pago seguro con Wompi</p>
        </div>
        <p className="text-xs text-mist-400 leading-relaxed">
          Al hacer clic serás redirigido al portal de pago de Wompi, donde ingresarás los datos de tu tarjeta de forma segura. Aceptamos Visa, Mastercard y American Express.
        </p>
        <div className="flex gap-2 pt-1">
          {["Visa", "Mastercard", "Amex"].map((b) => (
            <span key={b} className="rounded-lg border border-white/10 bg-ink-800 px-3 py-1.5 font-mono text-[10px] text-mist-400">{b}</span>
          ))}
        </div>
      </div>

      {result && !result.ok && <ErrorBox message={result.error} />}

      <SubmitBtn pending={pending}>
        <CreditCard className="h-4 w-4" />
        {pending ? "Preparando pago…" : "Pagar con tarjeta"}
        {!pending && <ExternalLink className="h-3.5 w-3.5 opacity-60" />}
      </SubmitBtn>
    </form>
  );
}

// ── Formulario PSE ────────────────────────────────────────────────────────────

function FormPSE({
  tipo,
  cursoId,
  leccionId,
  bancos,
}: {
  tipo: string;
  cursoId: string;
  leccionId?: string;
  bancos: PseBanco[];
}) {
  const [result, formAction, pending] = useActionState(iniciarPagoPSE, null);

  useEffect(() => {
    if (result?.ok && "redirectUrl" in result) {
      window.location.href = result.redirectUrl;
    }
  }, [result]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="curso_id" value={cursoId} />
      {leccionId && <input type="hidden" name="leccion_id" value={leccionId} />}

      {/* Banco */}
      <div>
        <FieldLabel icon={<Building2 className="h-3.5 w-3.5" />}>Banco</FieldLabel>
        <SelectWrapper>
          <select name="banco" className={sel()} defaultValue="" required>
            <option value="" disabled>Selecciona tu banco</option>
            {bancos.map((b) => (
              <option key={b.financial_institution_code} value={b.financial_institution_code}>
                {b.financial_institution_name}
              </option>
            ))}
          </select>
        </SelectWrapper>
      </div>

      {/* Tipo persona */}
      <div>
        <FieldLabel icon={<User className="h-3.5 w-3.5" />}>Tipo de persona</FieldLabel>
        <SelectWrapper>
          <select name="tipo_persona" className={sel()} defaultValue="" required>
            <option value="" disabled>Selecciona</option>
            {TIPOS_PERSONA.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </SelectWrapper>
      </div>

      {/* Documento */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel icon={<FileText className="h-3.5 w-3.5" />}>Tipo de documento</FieldLabel>
          <SelectWrapper>
            <select name="tipo_doc" className={sel()} defaultValue="" required>
              <option value="" disabled>—</option>
              {TIPOS_DOC.map((t) => (
                <option key={t.value} value={t.value}>{t.value}</option>
              ))}
            </select>
          </SelectWrapper>
        </div>
        <div>
          <FieldLabel>Número</FieldLabel>
          <input type="text" name="num_doc" placeholder="1234567890" className={field()} inputMode="numeric" required />
        </div>
      </div>

      {/* Email */}
      <div>
        <FieldLabel icon={<Mail className="h-3.5 w-3.5" />}>Correo para notificación</FieldLabel>
        <input type="email" name="email_pago" placeholder="correo@ejemplo.com" className={field()} required />
      </div>

      {result && !result.ok && <ErrorBox message={result.error} />}

      <SubmitBtn pending={pending}>
        <Building2 className="h-4 w-4" />
        {pending ? "Conectando con el banco…" : "Pagar con PSE"}
        {!pending && <ExternalLink className="h-3.5 w-3.5 opacity-60" />}
      </SubmitBtn>
    </form>
  );
}

// ── Formulario Nequi ──────────────────────────────────────────────────────────

function FormNequi({
  tipo,
  cursoId,
  leccionId,
  onTransaccion,
}: {
  tipo: string;
  cursoId: string;
  leccionId?: string;
  onTransaccion: (id: string) => void;
}) {
  const [result, formAction, pending] = useActionState(iniciarPagoNequi, null);

  useEffect(() => {
    if (result?.ok && "pendingNequi" in result) {
      onTransaccion(result.transactionId);
    }
  }, [result, onTransaccion]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="tipo" value={tipo} />
      <input type="hidden" name="curso_id" value={cursoId} />
      {leccionId && <input type="hidden" name="leccion_id" value={leccionId} />}

      <div className="flex items-start gap-3 rounded-2xl border border-[#7B2D8B]/25 bg-[#7B2D8B]/8 p-4">
        <Smartphone className="h-5 w-5 text-[#CE6BDB] shrink-0 mt-0.5" />
        <p className="text-xs text-mist-400 leading-relaxed">
          Ingresa tu número Nequi o Daviplata. Recibirás una notificación push para aprobar el pago directamente en la app.
        </p>
      </div>

      {/* Celular */}
      <div>
        <FieldLabel icon={<Phone className="h-3.5 w-3.5" />}>Número celular Nequi</FieldLabel>
        <input
          type="tel"
          name="celular"
          placeholder="300 000 0000"
          className={field()}
          inputMode="numeric"
          maxLength={10}
          required
        />
      </div>

      {/* Email */}
      <div>
        <FieldLabel icon={<Mail className="h-3.5 w-3.5" />}>Correo para recibo</FieldLabel>
        <input type="email" name="email_pago" placeholder="correo@ejemplo.com" className={field()} required />
      </div>

      {result && !result.ok && <ErrorBox message={result.error} />}

      <SubmitBtn pending={pending}>
        <Smartphone className="h-4 w-4" />
        {pending ? "Enviando notificación…" : "Pagar con Nequi"}
      </SubmitBtn>
    </form>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function PagoContent({
  plan: planInicial,
  cursos,
  bancos,
  tipoParam,
  cursoIdParam,
  leccionIdParam,
  leccionInfo,
}: {
  plan?: string;
  cursos: CursoPublicado[];
  bancos: PseBanco[];
  tipoParam?: string;
  cursoIdParam?: string;
  leccionIdParam?: string;
  leccionInfo?: { titulo: string; precio: number };
}) {
  const esLeccion = tipoParam === "leccion" && !!leccionIdParam;

  const [plan, setPlan] = useState<string | undefined>(esLeccion ? "leccion" : planInicial);
  const [curso, setCurso] = useState<CursoPublicado | null>(null);
  const [metodo, setMetodo] = useState<MetodoPago>("tarjeta");
  const [nequiTxId, setNequiTxId] = useState<string | null>(null);

  const cursoId = esLeccion ? (cursoIdParam ?? "") : (curso?.id ?? "");
  const leccionId = esLeccion ? leccionIdParam : undefined;
  const listo = plan === "membresia" || (plan === "curso" && !!curso) || esLeccion;

  // ── screens ─────────────────────────────────────────────────────────────────

  if (nequiTxId) return <NequiEsperando transactionId={nequiTxId} />;

  if (!plan) {
    return <SelectorPlan onSelect={setPlan} />;
  }

  if (plan === "curso" && !curso) {
    return (
      <SelectorCurso
        cursos={cursos}
        onSelect={setCurso}
        onBack={() => setPlan(undefined)}
      />
    );
  }

  // ── checkout layout ──────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-8 lg:flex-row lg:gap-10 lg:items-start">

      {/* Left: form */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* Back + title */}
        <div>
          {!esLeccion && (
            <button
              onClick={() => { plan === "curso" ? setCurso(null) : setPlan(undefined); }}
              className="flex items-center gap-1 font-mono text-xs text-mist-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver
            </button>
          )}
          {esLeccion && (
            <Link
              href={`/cursos/${cursoIdParam}`}
              className="flex items-center gap-1 font-mono text-xs text-mist-400 hover:text-white transition-colors mb-3"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Volver al curso
            </Link>
          )}
          <h1 className="font-display text-xl font-bold text-white">
            {esLeccion ? "Acceder a este video" : plan === "membresia" ? "Activa tu membresía" : "Comprar curso"}
          </h1>
          <p className="mt-1 text-sm text-mist-400">
            {esLeccion
              ? leccionInfo?.titulo
              : plan === "membresia"
                ? "Todos los cursos, certificados y contenido nuevo."
                : curso?.titulo}
          </p>
        </div>

        {/* Method tabs */}
        <div>
          <p className="font-mono text-[11px] uppercase tracking-wider text-mist-500 mb-3">Método de pago</p>
          <div className="grid grid-cols-3 gap-2">
            {METODOS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMetodo(m.id)}
                className={[
                  "flex flex-col items-center gap-1.5 rounded-xl border px-3 py-3 transition-all text-center",
                  metodo === m.id
                    ? "border-gold-500/50 bg-gold-500/8 text-gold-300"
                    : "border-white/8 bg-ink-900/40 text-mist-400 hover:border-white/15 hover:text-mist-300",
                ].join(" ")}
              >
                {m.icon}
                <span className="font-display text-xs font-semibold leading-none">{m.label}</span>
                <span className="font-mono text-[9px] leading-none opacity-70 hidden sm:block">{m.sub}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Active form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={metodo}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: EASE }}
          >
            {metodo === "tarjeta" && (
              <FormTarjeta tipo={plan} cursoId={cursoId} leccionId={leccionId} />
            )}
            {metodo === "pse" && (
              <FormPSE tipo={plan} cursoId={cursoId} leccionId={leccionId} bancos={bancos} />
            )}
            {metodo === "nequi" && (
              <FormNequi
                tipo={plan}
                cursoId={cursoId}
                leccionId={leccionId}
                onTransaccion={setNequiTxId}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Trust bar */}
        <div className="flex items-center justify-center gap-5 border-t border-white/[0.06] pt-4">
          {[
            { icon: <ShieldCheck className="h-3.5 w-3.5" />, label: "SSL" },
            { icon: <Lock className="h-3.5 w-3.5" />, label: "Wompi" },
            { icon: <Building2 className="h-3.5 w-3.5" />, label: "PSE Colombia" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-1.5 text-mist-500">
              {item.icon}
              <span className="font-mono text-[10px]">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: summary (desktop) */}
      {listo && (
        <div className="w-full lg:w-72 shrink-0">
          <ResumenOrden plan={plan} curso={curso} leccionInfo={leccionInfo} />
        </div>
      )}
    </div>
  );
}
