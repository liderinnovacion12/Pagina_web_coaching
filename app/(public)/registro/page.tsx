import type { Metadata } from "next";
import Link from "next/link";
import { RegistroForm } from "./RegistroForm";

export const metadata: Metadata = {
  title: "Crear cuenta | Team 100% Real Estate",
  description:
    "Crea tu cuenta de Team 100% Real Estate y comienza tu proceso de coaching ejecutivo.",
};

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-center font-display text-[42px] font-bold leading-tight text-white">
          Crea tu cuenta
        </h1>
        <p className="mt-2 text-center text-lg text-mist-400">
          El liderazgo se construye, no se improvisa.
        </p>

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
          <RegistroForm />
        </div>

        <p className="mt-8 text-center text-sm text-mist-400">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="rounded-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </main>
  );
}
