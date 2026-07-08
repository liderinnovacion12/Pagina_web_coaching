import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { LoginBranding } from "./LoginBranding";

export const metadata: Metadata = {
  title: "Iniciar sesión | CoachPro",
  description:
    "Accede a tu cuenta de CoachPro para continuar tu formación en coaching ejecutivo.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  const mostrarResetOk = params.reset === "ok";

  return (
    <main className="grid min-h-screen bg-ink-950 lg:grid-cols-[55fr_45fr]">
      <LoginBranding />

      <div className="flex flex-col items-center justify-center bg-grain px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex justify-center rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            COACH<span className="text-gold-400">PRO</span>
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

          <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
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
      </div>
    </main>
  );
}
