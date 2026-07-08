"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

type ErroresCampo = {
  email?: string;
  password?: string;
};

function validar(formData: FormData): ErroresCampo {
  const errores: ErroresCampo = {};
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    errores.email = "Ingresa tu correo electrónico.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errores.email = "Ingresa un correo electrónico válido.";
  }

  if (!password) {
    errores.password = "Ingresa tu contraseña.";
  }

  return errores;
}

const CAMPO_CLASES =
  "h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]";

const CAMPO_CLASES_ERROR = "border-rose-500/60 focus:border-rose-500/60";

export function LoginForm({
  mostrarResetOk = false,
}: {
  mostrarResetOk?: boolean;
}) {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [erroresCampo, setErroresCampo] = useState<ErroresCampo>({});

  function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    const formData = new FormData(evento.currentTarget);
    const errores = validar(formData);
    setErroresCampo(errores);

    if (errores.email || errores.password) {
      evento.preventDefault();
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col gap-8"
    >
      {mostrarResetOk && (
        <p
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          Contraseña actualizada. Inicia sesión con tu nueva contraseña.
        </p>
      )}

      <form
        onSubmit={manejarSubmit}
        action={formAction}
        noValidate
        className="flex flex-col gap-6"
      >
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
              aria-invalid={Boolean(erroresCampo.email)}
              aria-describedby={erroresCampo.email ? "email-error" : undefined}
              className={`${CAMPO_CLASES} ${erroresCampo.email ? CAMPO_CLASES_ERROR : ""}`}
            />
          </div>
          {erroresCampo.email && (
            <p id="email-error" role="alert" className="text-sm text-rose-400">
              {erroresCampo.email}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2">
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
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={Boolean(erroresCampo.password)}
              aria-describedby={
                erroresCampo.password ? "password-error" : undefined
              }
              className={`${CAMPO_CLASES} pr-11 ${
                erroresCampo.password ? CAMPO_CLASES_ERROR : ""
              }`}
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
          {erroresCampo.password && (
            <p id="password-error" role="alert" className="text-sm text-rose-400">
              {erroresCampo.password}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-mist-400">
            <input
              type="checkbox"
              name="recordarme"
              className="h-4 w-4 rounded border-white/20 bg-ink-950 text-gold-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            />
            Recordarme
          </label>
          <Link
            href="/recuperar-password"
            className="text-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200"
          >
            ¿Olvidaste tu contraseña?
          </Link>
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
          {pendiente ? "Iniciando sesión..." : "Iniciar sesión"}
        </motion.button>
      </form>

      <div className="flex items-center gap-3 text-xs text-mist-500">
        <span className="h-px flex-1 bg-white/10" />
        o continúa con
        <span className="h-px flex-1 bg-white/10" />
      </div>

      <form action={loginConGoogle}>
        <SocialButton label="Google" icon={<GoogleIcon />} />
      </form>
    </motion.div>
  );
}

function SocialButton({ label, icon }: { label: string; icon: ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-label={`Continuar con ${label}`}
      className="flex h-[52px] w-full items-center justify-center gap-3 rounded-xl border border-white/10 text-sm font-medium text-mist-300 transition duration-150 hover:border-gold-500/60 hover:bg-gold-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      ) : (
        icon
      )}
      Continuar con {label}
    </button>
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
