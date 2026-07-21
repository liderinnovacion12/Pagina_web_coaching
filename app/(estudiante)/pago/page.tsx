import { createClient } from "@/lib/supabase/server";
import { getCursosPublicados } from "@/lib/db/cursos";
import { PagoContent } from "./PagoContent";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Pago | Team 100% Real Estate",
};

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { plan } = await searchParams;
  const planValido = plan === "curso" || plan === "membresia" ? plan : undefined;

  const cursos = await getCursosPublicados();

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-block font-display text-lg font-bold text-white"
          >
            TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
          </Link>
        </div>

        <div className="rounded-2xl border border-white/[0.08] bg-ink-900/40 p-8 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.4)]">
          <PagoContent plan={planValido} cursos={cursos} />
        </div>

        <p className="mt-4 text-center font-mono text-[10px] text-mist-600">
          ¿Preguntas? Usa el botón de soporte en la esquina inferior derecha.
        </p>
      </div>
    </main>
  );
}
