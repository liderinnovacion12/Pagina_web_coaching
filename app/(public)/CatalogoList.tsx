"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import {
  SCROLL_REVEAL_VIEWPORT,
  revealSlideLeft,
  revealSlideRight,
  staggerContainer,
} from "@/lib/motion";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p className="text-mist-400">Próximamente nuevos cursos.</p>;
  }

  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_REVEAL_VIEWPORT}
      variants={staggerContainer(0.07)}
      className="grid gap-4 overflow-x-hidden sm:grid-cols-2"
    >
      {cursos.map((curso, indice) => (
        <CatalogoCursoCard
          key={curso.id}
          curso={curso}
          variants={indice % 2 === 0 ? revealSlideLeft : revealSlideRight}
        />
      ))}
    </motion.ul>
  );
}
