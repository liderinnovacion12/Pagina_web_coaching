"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { actualizarPassword, type ActualizarPasswordState } from "./actions";

const estadoInicial: ActualizarPasswordState = { error: null };

const CAMPO_CLASES =
  "h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-11 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]";

export function ActualizarPasswordForm() {
  const [estado, formAction, pendiente] = useActionState(
    actualizarPassword,
    estadoInicial
  );
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <form action={formAction} noValidate className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-mist-300">
            Nueva contraseña
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
              className={CAMPO_CLASES}
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

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmacion"
            className="text-sm font-medium text-mist-300"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="confirmacion"
              name="confirmacion"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={CAMPO_CLASES}
            />
          </div>
        </div>

        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {pendiente ? "Guardando..." : "Guardar contraseña"}
        </motion.button>
      </form>
    </motion.div>
  );
}
