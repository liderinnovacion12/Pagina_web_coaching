import { createClient } from "@/lib/supabase/server";
import { getCursosPublicados } from "@/lib/db/cursos";
import { getBancosPSE } from "@/lib/wompi/client";
import { PagoContent } from "./PagoContent";
import Link from "next/link";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Pago | NCS Realty Hub",
};

export default async function PagoPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; tipo?: string; cursoId?: string; leccionId?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { plan, tipo, cursoId, leccionId } = await searchParams;
  const planValido =
    plan === "curso" || plan === "membresia" ? plan : undefined;

  // Si viene de una lección con precio, precargamos los datos de la lección
  let leccionInfo: { titulo: string; precio: number } | undefined;
  if (tipo === "leccion" && leccionId) {
    const { data } = await supabase
      .from("lecciones")
      .select("titulo, precio")
      .eq("id", leccionId)
      .single();
    if (data) leccionInfo = { titulo: data.titulo, precio: Number(data.precio) };
  }

  const [cursos, bancos, planMembresia] = await Promise.all([
    getCursosPublicados(),
    getBancosPSE(),
    supabase
      .from("planes_membresia")
      .select("id, nombre, descripcion, precio, duracion_dias")
      .eq("activo", true)
      .order("orden")
      .limit(1)
      .single()
      .then((r) => r.data),
  ]);

  return (
    <main className="min-h-screen bg-ink-950 px-4 py-12">
      <div className="mx-auto max-w-3xl">

        {/* Logo */}
        <div className="mb-10 text-center">
          <Link href="/" className="inline-block font-display text-lg font-bold text-white">
            NCS REALTY<span className="text-gold-400"> HUB</span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-ink-900/40 p-6 sm:p-8 shadow-[0_0_80px_rgba(0,0,0,0.5)]">
          <PagoContent
            plan={planValido}
            cursos={cursos}
            bancos={bancos}
            tipoParam={tipo}
            cursoIdParam={cursoId}
            leccionIdParam={leccionId}
            leccionInfo={leccionInfo}
            planMembresia={planMembresia ?? undefined}
          />
        </div>

        <p className="mt-5 text-center font-mono text-[10px] text-mist-500">
          ¿Preguntas? Escríbenos al soporte en la esquina inferior derecha.
        </p>
      </div>
    </main>
  );
}
