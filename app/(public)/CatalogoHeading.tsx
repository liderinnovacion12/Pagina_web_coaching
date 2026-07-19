"use client";

import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealUp } from "@/lib/motion";

export function CatalogoHeading() {
  return (
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
  );
}
