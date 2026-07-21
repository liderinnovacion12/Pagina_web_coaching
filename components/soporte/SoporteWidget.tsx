"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle, X, Send, Check, ChevronDown, Loader2,
  User, Mail, Phone, Tag, FileText, AlertCircle,
} from "lucide-react";
import { crearTicketAction } from "@/lib/soporte/actions";

const CATEGORIAS = [
  { value: "acceso",     label: "Problemas de acceso" },
  { value: "pagos",      label: "Pagos y facturación" },
  { value: "cursos",     label: "Cursos y contenido" },
  { value: "tecnico",    label: "Problema técnico" },
  { value: "cuenta",     label: "Mi cuenta" },
  { value: "general",    label: "Consulta general" },
];

const EASE = [0.16, 1, 0.3, 1] as const;

type Estado = "idle" | "sending" | "success" | "error";

const EMPTY = {
  nombre: "", email: "", telefono: "",
  categoria: "", asunto: "", descripcion: "",
};

export function SoporteWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState<Partial<typeof EMPTY>>({});
  const [estado, setEstado] = useState<Estado>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Bloquear scroll del body cuando el panel está abierto (mobile)
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  function set(field: keyof typeof EMPTY, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: "" }));
  }

  function validate() {
    const e: Partial<typeof EMPTY> = {};
    if (!form.nombre.trim())      e.nombre      = "Requerido";
    if (!form.email.trim())       e.email       = "Requerido";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                                  e.email       = "Email inválido";
    if (!form.categoria)          e.categoria   = "Selecciona una categoría";
    if (!form.asunto.trim())      e.asunto      = "Requerido";
    if (!form.descripcion.trim()) e.descripcion = "Describe tu problema";
    else if (form.descripcion.trim().length < 20)
                                  e.descripcion = "Mínimo 20 caracteres";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setEstado("sending");
    const result = await crearTicketAction(form);
    if (result.ok) {
      setEstado("success");
    } else {
      setErrorMsg(result.error ?? "Error desconocido");
      setEstado("error");
    }
  }

  function handleClose() {
    setOpen(false);
    setTimeout(() => {
      if (estado === "success") {
        setForm(EMPTY);
        setErrors({});
        setEstado("idle");
      }
    }, 400);
  }

  return (
    <>
      {/* Overlay para cerrar al hacer clic fuera */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] sm:hidden"
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="panel"
            ref={panelRef}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="fixed bottom-24 right-4 z-50 w-[calc(100vw-2rem)] max-w-sm sm:right-6"
          >
            <div className="flex max-h-[85vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink-950 shadow-[0_24px_80px_rgba(0,0,0,0.7)]">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/8 bg-ink-900/80 px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gold-500/15 border border-gold-500/25">
                    <MessageCircle className="h-4 w-4 text-gold-400" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-semibold text-white">Centro de Soporte</p>
                    <p className="font-mono text-[10px] text-mist-500">Team 100% Real Estate</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-mist-500 transition hover:bg-white/8 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto">
                {estado === "success" ? (
                  /* ── Éxito ── */
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: EASE }}
                    className="flex flex-col items-center gap-4 px-6 py-12 text-center"
                  >
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/15 border border-green-500/25">
                      <Check className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-white">¡Ticket enviado!</h3>
                    <p className="text-sm leading-relaxed text-mist-400">
                      Recibimos tu solicitud. Nuestro equipo de soporte la revisará y te contactará a la brevedad.
                    </p>
                    <button
                      onClick={handleClose}
                      className="mt-2 rounded-xl bg-gold-500 px-6 py-2.5 font-semibold text-sm text-ink-950 hover:bg-gold-400 transition-colors"
                    >
                      Cerrar
                    </button>
                  </motion.div>
                ) : (
                  /* ── Formulario ── */
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-5">

                    {estado === "error" && (
                      <div className="flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/8 px-4 py-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
                        <p className="text-sm text-red-300">{errorMsg}</p>
                      </div>
                    )}

                    {/* Nombre */}
                    <Field
                      label="Nombre completo"
                      icon={<User className="h-3.5 w-3.5" />}
                      error={errors.nombre}
                    >
                      <input
                        type="text"
                        value={form.nombre}
                        onChange={(e) => set("nombre", e.target.value)}
                        placeholder="Tu nombre"
                        className={inputCls(!!errors.nombre)}
                      />
                    </Field>

                    {/* Email */}
                    <Field
                      label="Correo electrónico"
                      icon={<Mail className="h-3.5 w-3.5" />}
                      error={errors.email}
                    >
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => set("email", e.target.value)}
                        placeholder="correo@ejemplo.com"
                        className={inputCls(!!errors.email)}
                      />
                    </Field>

                    {/* Teléfono (opcional) */}
                    <Field
                      label="Teléfono (opcional)"
                      icon={<Phone className="h-3.5 w-3.5" />}
                    >
                      <input
                        type="tel"
                        value={form.telefono}
                        onChange={(e) => set("telefono", e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className={inputCls(false)}
                      />
                    </Field>

                    {/* Categoría */}
                    <Field
                      label="Categoría"
                      icon={<Tag className="h-3.5 w-3.5" />}
                      error={errors.categoria}
                    >
                      <div className="relative">
                        <select
                          value={form.categoria}
                          onChange={(e) => set("categoria", e.target.value)}
                          className={`${inputCls(!!errors.categoria)} appearance-none`}
                        >
                          <option value="">Selecciona una categoría</option>
                          {CATEGORIAS.map((c) => (
                            <option key={c.value} value={c.value}>{c.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500" />
                      </div>
                    </Field>

                    {/* Asunto */}
                    <Field
                      label="Asunto"
                      icon={<FileText className="h-3.5 w-3.5" />}
                      error={errors.asunto}
                    >
                      <input
                        type="text"
                        value={form.asunto}
                        onChange={(e) => set("asunto", e.target.value)}
                        placeholder="Resume tu problema en una línea"
                        className={inputCls(!!errors.asunto)}
                      />
                    </Field>

                    {/* Descripción */}
                    <Field
                      label="Descripción del problema"
                      icon={<MessageCircle className="h-3.5 w-3.5" />}
                      error={errors.descripcion}
                    >
                      <textarea
                        value={form.descripcion}
                        onChange={(e) => set("descripcion", e.target.value)}
                        placeholder="Describe con detalle qué está pasando, cuándo ocurre y qué pasos seguiste…"
                        rows={4}
                        className={`${inputCls(!!errors.descripcion)} resize-none`}
                      />
                      <p className={`mt-1 text-right font-mono text-[10px] ${
                        form.descripcion.length < 20 ? "text-mist-600" : "text-green-500"
                      }`}>
                        {form.descripcion.length} / mín. 20
                      </p>
                    </Field>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={estado === "sending"}
                      className="flex items-center justify-center gap-2 rounded-xl bg-gold-500 py-3 font-semibold text-sm text-ink-950 transition-all hover:bg-gold-400 disabled:opacity-60 active:scale-[0.98]"
                    >
                      {estado === "sending" ? (
                        <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</>
                      ) : (
                        <><Send className="h-4 w-4" /> Enviar ticket</>
                      )}
                    </button>

                    <p className="text-center font-mono text-[10px] text-mist-600">
                      Tiempo de respuesta: 24–48 horas hábiles
                    </p>
                  </form>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón flotante */}
      <motion.button
        onClick={() => setOpen((o) => !o)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Soporte"
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 shadow-[0_8px_32px_rgba(217,169,78,0.45)] transition-colors hover:bg-gold-400 sm:right-6"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <X className="h-6 w-6 text-ink-950" />
            </motion.span>
          ) : (
            <motion.span
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              <MessageCircle className="h-6 w-6 text-ink-950" />
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
}

/* ── Helpers ── */

function inputCls(hasError: boolean) {
  return [
    "w-full rounded-lg border bg-ink-800/80 px-3 py-2.5 text-sm text-white placeholder:text-mist-600",
    "focus:outline-none focus:ring-1 transition-colors",
    hasError
      ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20"
      : "border-white/10 focus:border-gold-500/50 focus:ring-gold-500/20",
  ].join(" ");
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-mist-400">
        <span className="text-gold-500">{icon}</span>
        {label}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1 font-mono text-[11px] text-red-400">
          <AlertCircle className="h-3 w-3" />{error}
        </p>
      )}
    </div>
  );
}
