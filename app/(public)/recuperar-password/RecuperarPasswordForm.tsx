"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { solicitarRecuperacion, type RecuperarPasswordState } from "./actions";

const estadoInicial: RecuperarPasswordState = { enviado: false, error: null };

export function RecuperarPasswordForm() {
  const [estado, formAction, pendiente] = useActionState(
    solicitarRecuperacion,
    estadoInicial
  );

  if (estado.enviado) {
    return (
      <p role="status" className="text-center text-mist-300">
        Si el correo existe en nuestro sistema, recibirás instrucciones para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form action={formAction} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-mist-300">
          Correo electrónico
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
            aria-invalid={Boolean(estado.error)}
            aria-describedby={estado.error ? "email-error" : undefined}
            className="h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]"
          />
        </div>
        {estado.error && (
          <p id="email-error" role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}
      </div>

      <motion.button
        type="submit"
        disabled={pendiente}
        whileHover={pendiente ? undefined : { y: -2 }}
        whileTap={pendiente ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Enviando..." : "Enviar instrucciones"}
      </motion.button>
    </form>
  );
}
