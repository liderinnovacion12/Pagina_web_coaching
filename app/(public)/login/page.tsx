import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { Login3DPanel } from "./Login3DPanel";
import { LogoNCS } from "@/components/ui/LogoNCS";

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
    <main className="flex min-h-screen bg-ink-950">

      {/* Panel izquierdo: efecto 3D + logo (solo desktop) */}
      <div className="hidden lg:block lg:w-[46%] xl:w-[48%] sticky top-0 h-screen">
        <Login3DPanel />
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 sm:px-12 overflow-y-auto">

        {/* Logo visible solo en móvil */}
        <Link
          href="/"
          aria-label="NCS Realty Hub – Inicio"
          className="lg:hidden mb-10 rounded-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
        >
          <LogoNCS height={80} />
        </Link>

        <div className="w-full max-w-[380px]">
          <div className="mb-10">
            <h1 className="font-display text-4xl font-bold leading-tight text-white">
              Bienvenido de nuevo
            </h1>
            <p className="mt-3 text-base text-mist-400 leading-relaxed">
              Inicia sesión para continuar tu proceso de aprendizaje.
            </p>
          </div>

          {errorOauth && (
            <p
              role="alert"
              className="mb-6 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300 text-center"
            >
              No se pudo iniciar sesión con Google. Verifica que el proveedor esté habilitado e intenta de nuevo.
            </p>
          )}

          <div className="rounded-2xl border border-white/[0.08] bg-ink-900/40 p-10 shadow-[0_0_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:border-gold-500/30 hover:shadow-[0_0_0_1px_rgb(var(--gold-500)/0.14),0_0_32px_-4px_rgb(var(--gold-500)/0.2)]">
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
