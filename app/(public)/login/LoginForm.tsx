"use client";

import { useActionState } from "react";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

export function LoginForm() {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-mist-500">
            Correo
          </span>
          <input
            name="email"
            type="email"
            placeholder="correo@ejemplo.com"
            className="rounded-lg border border-white/10 bg-ink-950 px-4 py-2.5 text-white placeholder:text-mist-500/60 outline-none transition focus:border-gold-500/60"
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-mist-500">
            Contraseña
          </span>
          <input
            name="password"
            type="password"
            placeholder="••••••••"
            className="rounded-lg border border-white/10 bg-ink-950 px-4 py-2.5 text-white placeholder:text-mist-500/60 outline-none transition focus:border-gold-500/60"
          />
        </label>
        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-gold-500 px-4 py-2.5 font-semibold text-ink-950 transition hover:bg-gold-400 disabled:opacity-60"
        >
          {pendiente ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-mist-500">
        <span className="h-px flex-1 bg-white/10" />
        O
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <button
        type="button"
        onClick={() => loginConGoogle()}
        className="flex items-center justify-center gap-2 rounded-lg border border-gold-500/40 px-4 py-2.5 font-medium text-mist-300 transition hover:bg-gold-500/10"
      >
        <GoogleIcon />
        Continuar con Google
      </button>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.2-2.27H12v4.51h6.47c-.28 1.48-1.13 2.73-2.4 3.58v2.98h3.88c2.27-2.09 3.54-5.17 3.54-8.8z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.88-2.98c-1.08.72-2.45 1.15-4.05 1.15-3.11 0-5.75-2.1-6.69-4.92H1.3v3.08C3.26 21.3 7.29 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.31 14.34c-.24-.72-.38-1.49-.38-2.34s.14-1.62.38-2.34V6.58H1.3A11.98 11.98 0 000 12c0 1.93.46 3.76 1.3 5.42l4.01-3.08z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.76 0 3.34.6 4.58 1.79l3.44-3.44C17.94 1.19 15.24 0 12 0 7.29 0 3.26 2.7 1.3 6.58l4.01 3.08c.94-2.82 3.58-4.91 6.69-4.91z"
      />
    </svg>
  );
}
