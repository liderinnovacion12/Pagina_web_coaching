import type { Metadata } from "next";
import { getCursosPublicados } from "@/lib/db/cursos";
import { getMiembrosEquipo } from "@/lib/db/equipo";
import { getGaleriaEquipo } from "@/lib/db/galeria";
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
import { SeccionCulturaEquipo } from "./SeccionCulturaEquipo";

export const metadata: Metadata = {
  title: "NCS Realty Hub | Transforma tu Liderazgo",
  description:
    "Plataforma de coaching ejecutivo para líderes que buscan impacto real.",
};

export default async function LandingPage() {
  const [cursos, miembrosEquipo, galeriaEquipo] = await Promise.all([
    getCursosPublicados(),
    getMiembrosEquipo().catch(() => []),
    getGaleriaEquipo().catch(() => []),
  ]);

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

      {/* Cultura, Misión, Visión, Valores, Filosofía, Team Leaders, Galería */}
      <SeccionCulturaEquipo
        miembrosEquipo={miembrosEquipo}
        galeriaEquipo={galeriaEquipo}
      />

      {/* Catálogo de cursos */}
      <section id="cursos" className="relative isolate mx-auto max-w-6xl px-6 py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_30%_20%,rgba(0,201,87,0.06),transparent_60%)]"
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
