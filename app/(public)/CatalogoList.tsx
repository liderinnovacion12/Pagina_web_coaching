"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import { SCROLL_REVEAL_VIEWPORT, revealSlideLeft, revealSlideRight, staggerContainer } from "@/lib/motion";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return (
      <div className="rounded-2xl border border-white/8 bg-ink-900/40 p-12 text-center">
        <p className="font-display text-lg text-mist-400">Próximamente nuevos cursos.</p>
        <p className="mt-2 font-mono text-sm text-mist-500">Estamos preparando contenido de élite para ti.</p>
      </div>
    );
  }

  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_REVEAL_VIEWPORT}
      variants={staggerContainer(0.07)}
      className="grid gap-5 overflow-x-hidden sm:grid-cols-2 lg:grid-cols-3"
    >
      {cursos.map((curso, indice) => (
        <CatalogoCursoCard
          key={curso.id}
          curso={curso}
          index={indice}
          variants={indice % 2 === 0 ? revealSlideLeft : revealSlideRight}
        />
      ))}
    </motion.ul>
  );
}
