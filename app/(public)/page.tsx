import type { Metadata } from "next";
import { getCursosPublicados } from "@/lib/db/cursos";
import { SiteHeader } from "@/components/SiteHeader";
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";

export const metadata: Metadata = {
  title: "Team 100% Real Estate | Transforma tu Liderazgo",
  description:
    "Plataforma de coaching ejecutivo para líderes que buscan impacto real.",
};

const ESTADISTICAS = [
  { valor: "2,000+", etiqueta: "Líderes" },
  { valor: "40+", etiqueta: "Países" },
  { valor: "95%", etiqueta: "Satisfacción" },
];

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="bg-ink-950">
      <SiteHeader />

      <div className="relative overflow-hidden bg-grain">
        <HeroBackground />
        <HeroContent estadisticas={ESTADISTICAS} />
      </div>

      <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-white">
          Catálogo de cursos
        </h2>
        <p className="mt-2 text-mist-400">
          Programas diseñados por coaches ejecutivos con experiencia real.
        </p>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
    </main>
  );
}
