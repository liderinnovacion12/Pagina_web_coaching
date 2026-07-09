"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { fadeUp } from "@/lib/motion";

export function CatalogoCursoCard({ curso }: { curso: CursoPublicado }) {
  return (
    <motion.li
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/10 bg-ink-900 p-5 transition-colors duration-200 hover:border-gold-500/40"
    >
      <h3 className="font-display font-semibold text-white">{curso.titulo}</h3>
      <p className="mt-2 font-mono text-gold-400">
        ${curso.precio.toFixed(2)}
      </p>
    </motion.li>
  );
}
