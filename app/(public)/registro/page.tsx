import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegistroForm } from "./RegistroForm";
import { ParticleField } from "@/components/motion/ParticleField";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Crear cuenta | Team 100% Real Estate",
  description:
    "Crea tu cuenta de Team 100% Real Estate y comienza tu proceso de coaching ejecutivo.",
};

export default async function RegistroPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; cursoId?: string }>;
}) {
  const { plan, cursoId } = await searchParams;

  // Si ya tiene sesión activa, mandarlo directo al destino
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    if (plan === "membresia") redirect("/pago?plan=membresia");
    if (cursoId) redirect(`/pago?tipo=curso&cursoId=${cursoId}`);
    redirect("/clases");
  }

  return (
    <main className="relative flex h-screen flex-col items-center justify-center overflow-y-auto overflow-x-hidden bg-ink-950 px-6 py-4">
      <ParticleField />

      <Link
        href="/"
        className="relative z-10 rounded-sm font-display text-xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="relative z-10 mt-4 w-full max-w-sm">
        <h1 className="text-center font-display text-2xl font-bold leading-tight text-white">
          Crea tu cuenta
        </h1>
        <p className="mt-1 text-center text-sm text-mist-400">
          El liderazgo se construye, no se improvisa.
        </p>

        <div className="mt-4 rounded-[20px] border border-white/[0.08] bg-ink-900/40 p-6 shadow-[0_0_50px_rgba(0,0,0,0.35)] backdrop-blur-xl transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
          <RegistroForm plan={plan} cursoId={cursoId} />
        </div>

        <p className="mt-3 text-center text-sm text-mist-400">
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
