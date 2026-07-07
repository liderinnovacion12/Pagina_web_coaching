"use client";

import { useState, type FormEvent } from "react";
import { Mail } from "lucide-react";

export function RecuperarPasswordForm() {
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Pendiente: conectar con supabase.auth.resetPasswordForEmail en un siguiente alcance.
  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const formData = new FormData(evento.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Ingresa un correo electrónico válido.");
      return;
    }

    setError(null);
    setEnviado(true);
  }

  if (enviado) {
    return (
      <p role="status" className="text-center text-mist-300">
        Si el correo existe en nuestro sistema, recibirás instrucciones para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form onSubmit={manejarSubmit} noValidate className="flex flex-col gap-6">
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
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "email-error" : undefined}
            className="h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]"
          />
        </div>
        {error && (
          <p id="email-error" role="alert" className="text-sm text-rose-400">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
      >
        Enviar instrucciones
      </button>
    </form>
  );
}
