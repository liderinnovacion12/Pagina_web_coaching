"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { registrar, type RegistroState } from "./actions";

const SECTORES = [
  { valor: "liderazgo", etiqueta: "Liderazgo" },
  { valor: "ventas", etiqueta: "Ventas" },
  { valor: "finanzas", etiqueta: "Finanzas" },
  { valor: "marketing", etiqueta: "Marketing" },
  { valor: "tecnologia", etiqueta: "Tecnología" },
];

const estadoInicial: RegistroState = { error: null };

const CAMPO_CLASES =
  "h-11 w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]";

export function RegistroForm({ plan }: { plan?: string }) {
  const [estado, formAction, pendiente] = useActionState(registrar, estadoInicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="plan" value={plan ?? ""} />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-mist-300">
            Correo
          </label>
          <div className="relative">
            <Mail
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="correo@ejemplo.com"
              className={CAMPO_CLASES}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-mist-300">
            Contraseña
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="password"
              name="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={`${CAMPO_CLASES} pr-11`}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-4 text-mist-500 transition hover:text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            >
              {mostrarPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-0.5 text-sm font-medium text-mist-300">
            Tus intereses
          </legend>
          <div className="grid grid-cols-2 gap-2">
            {SECTORES.map((sector) => (
              <label
                key={sector.valor}
                className="flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 bg-ink-950 px-3 py-1.5 text-sm text-mist-300 transition duration-150 hover:border-white/20 has-[:checked]:border-gold-500/60 has-[:checked]:bg-gold-500/10 has-[:checked]:text-gold-200"
              >
                <input
                  type="checkbox"
                  name="intereses"
                  value={sector.valor}
                  className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
                />
                {sector.etiqueta}
              </label>
            ))}
          </div>
        </fieldset>

        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          whileTap={pendiente ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="flex h-11 items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {pendiente ? "Creando cuenta..." : "Crear cuenta"}
        </motion.button>
      </form>
    </motion.div>
  );
}
