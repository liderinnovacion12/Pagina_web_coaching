import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { ParticleField } from "@/components/motion/ParticleField";

export const metadata: Metadata = {
  title: "Iniciar sesión | NCS Realty Hub",
  description:
    "Accede a tu cuenta de NCS Realty Hub para continuar tu formación en coaching ejecutivo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string; error?: string }>;
}) {
  const params = await searchParams;
  const mostrarResetOk = params.reset === "ok";
  const errorOauth = params.error === "oauth";

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-ink-950 overflow-hidden px-6 py-16 sm:px-10">
      {/* Fondo de Partículas WebGL Nebulosa */}
      <ParticleField />

      {/* Tarjeta de Login Centrada en la Pantalla */}
      <div className="relative z-10 w-full max-w-sm">
        <Link
          href="/"
          className="flex justify-center rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          NCS REALTY<span className="text-gold-400"> HUB</span>
          <span className="text-gold-400"> •</span>
        </Link>

        <div className="mt-10 text-center">
          <h1 className="font-display text-[42px] font-bold leading-tight text-white">
            Bienvenido de nuevo
          </h1>
          <p className="mt-2 text-lg text-mist-400">
            Inicia sesión para continuar tu proceso de aprendizaje.
          </p>
        </div>

        {errorOauth && (
          <p role="alert" className="mt-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-center">
            No se pudo iniciar sesión con Google. Verifica que el proveedor esté habilitado e intenta de nuevo.
          </p>
        )}

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-ink-900/40 p-12 shadow-[0_0_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(0,201,87,0.14),0_0_32px_-4px_rgba(0,201,87,0.22)]">
          <LoginForm mostrarResetOk={mostrarResetOk} />
        </div>

        <p className="mt-8 text-center text-sm text-mist-400">
          ¿No tienes una cuenta?{" "}
          <Link
            href="/registro"
            className="rounded-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            Crear cuenta
          </Link>
        </p>
      </div>
    </main>
  );
}
