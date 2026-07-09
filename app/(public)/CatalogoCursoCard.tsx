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
      className="rounded-xl border border-white/10 bg-ink-900 p-5 transition duration-300 hover:border-gold-500/60 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.12),0_20px_48px_-20px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(217,169,78,0.18)]"
    >
      <h3 className="font-display font-semibold text-white">{curso.titulo}</h3>
      <p className="mt-2 font-mono text-gold-400">
        ${curso.precio.toFixed(2)}
      </p>
    </motion.li>
  );
}
