import { getCursosPublicados } from "@/lib/db/cursos";
import { CatalogoList } from "./CatalogoList";

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Coachpro</h1>
      <p className="mt-2 text-slate-600">
        Cursos para impulsar tu carrera profesional.
      </p>
      <section className="mt-8">
        <CatalogoList cursos={cursos} />
      </section>
    </main>
  );
}
