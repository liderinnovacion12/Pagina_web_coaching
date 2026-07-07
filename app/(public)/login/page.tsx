import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Iniciar sesión | CoachPro",
  description: "Accede a tu cuenta de CoachPro para continuar tu formación en coaching ejecutivo.",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        COACH<span className="text-gold-400">PRO</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="animate-fade-up mt-10 w-full max-w-sm rounded-2xl border border-white/10 bg-ink-900 p-8">
        <h1 className="font-display text-2xl font-bold text-white">
          Bienvenido de vuelta
        </h1>
        <p className="mt-1 text-sm text-mist-400">Ingresa a tu cuenta</p>

        <div className="mt-8">
          <LoginForm />
        </div>

        <p className="mt-6 text-center text-sm text-mist-400">
          ¿No tienes cuenta?{" "}
          <Link
            href="/registro"
            className="rounded-sm font-medium text-gold-300 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900"
          >
            Regístrate
          </Link>
        </p>
      </div>

      <Link
        href="/"
        className="mt-8 rounded-sm text-sm text-mist-400 transition hover:text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        ← Volver al inicio
      </Link>
    </main>
  );
}
