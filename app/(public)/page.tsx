import type { Metadata } from "next";
import { getCursosPublicados } from "@/lib/db/cursos";
import { SiteHeader } from "@/components/SiteHeader";
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroScrollLayer } from "./HeroScrollLayer";
import { ParticleField } from "@/components/motion/ParticleField";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealUp } from "@/lib/motion";

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

      <HeroScrollLayer
        background={<HeroBackground />}
        particles={<ParticleField />}
      >
        <HeroContent estadisticas={ESTADISTICAS} />
      </HeroScrollLayer>

      <section id="cursos" className="relative mx-auto max-w-6xl px-6 py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.08),transparent_60%)]"
        />
        <ScrollReveal
          variants={revealUp}
          once={false}
          className="border-t border-white/10 pt-10"
        >
          <h2 className="font-display text-4xl font-bold text-gradient-gold sm:text-5xl">
            Catálogo de cursos
          </h2>
          <p className="mt-4 max-w-xl text-mist-400">
            Programas diseñados por coaches ejecutivos con experiencia real.
          </p>
        </ScrollReveal>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
    </main>
  );
}
