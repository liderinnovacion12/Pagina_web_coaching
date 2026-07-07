"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

const CAMPO_CLASES =
  "w-full rounded-lg border border-white/10 bg-ink-950 px-4 py-2.5 text-white placeholder:text-mist-400 outline-none transition hover:border-white/20 focus:border-gold-500/60 focus-visible:ring-2 focus-visible:ring-gold-500/30";

export function LoginForm() {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <form action={formAction} className="flex flex-col gap-5">
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-mist-400">
            Correo
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            className={CAMPO_CLASES}
          />
        </label>
        <label className="flex flex-col gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-mist-400">
            Contraseña
          </span>
          <div className="relative">
            <input
              name="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              className={`${CAMPO_CLASES} pr-11`}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              className="absolute inset-y-0 right-0 flex items-center rounded-r-lg px-3 text-mist-400 transition hover:text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            >
              {mostrarPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </label>
        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-gold-500 px-4 py-2.5 font-semibold text-ink-950 transition hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-60"
        >
          {pendiente ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <div className="flex items-center gap-3 text-xs text-mist-400">
        <span className="h-px flex-1 bg-white/10" />
        O
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form action={loginConGoogle}>
        <GoogleButton />
      </form>
    </div>
  );
}

function GoogleButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-gold-500/40 px-4 py-2.5 font-medium text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:opacity-60"
    >
      <GoogleIcon />
      {pending ? "Redirigiendo..." : "Continuar con Google"}
    </button>
  );
}

function EyeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 5.1A10.9 10.9 0 0 1 12 5c7 0 10.5 7 10.5 7a13.6 13.6 0 0 1-3.1 3.9M6.6 6.6C3.9 8.3 1.5 12 1.5 12s3.5 7 10.5 7a10.3 10.3 0 0 0 4.4-.95" />
      <path d="M9.5 10a3 3 0 0 0 4.24 4.24" />
    </svg>
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
