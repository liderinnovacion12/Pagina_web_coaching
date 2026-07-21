import type { Metadata } from "next";
import { getCursosPublicados } from "@/lib/db/cursos";
import { SiteHeader } from "@/components/SiteHeader";
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroScrollLayer } from "./HeroScrollLayer";
import { ParticleField } from "@/components/motion/ParticleField";
import { CatalogoHeading } from "./CatalogoHeading";
import { SeccionFeatures } from "./SeccionFeatures";
import { SeccionTestimonios } from "./SeccionTestimonios";
import { SeccionCTA } from "./SeccionCTA";
import { SeccionPrecios } from "./SeccionPrecios";

export const metadata: Metadata = {
  title: "Team 100% Real Estate | Transforma tu Liderazgo",
  description:
    "Plataforma de coaching ejecutivo para líderes que buscan impacto real.",
};

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="bg-ink-950">
      <SiteHeader />

      {/* Hero */}
      <HeroScrollLayer
        background={<HeroBackground />}
        particles={<ParticleField />}
      >
        <HeroContent />
      </HeroScrollLayer>

      {/* Por qué elegirnos */}
      <SeccionFeatures />

      {/* Catálogo de cursos */}
      <section id="cursos" className="relative isolate mx-auto max-w-6xl px-6 py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.06),transparent_60%)]"
        />
        <CatalogoHeading />
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>

      {/* Testimonios */}
      <SeccionTestimonios />

      {/* Precios */}
      <SeccionPrecios />

      {/* CTA final */}
      <SeccionCTA />
    </main>
  );
}
