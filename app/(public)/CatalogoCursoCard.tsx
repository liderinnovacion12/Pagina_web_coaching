"use client";

import { motion, useMotionTemplate, useMotionValue, type Variants } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";

export function CatalogoCursoCard({
  curso,
  variants,
}: {
  curso: CursoPublicado;
  variants: Variants;
}) {
  // Valores de movimiento para la posición del cursor local
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.li
      variants={variants}
      whileHover={{ y: -4 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-xl border border-white/8 bg-ink-900/60 p-8 transition-[border-color,box-shadow] duration-300 hover:border-gold-500/20 overflow-hidden backdrop-blur-md"
    >
      {/* Spotlight de fondo que sigue al cursor en hover */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(217, 169, 78, 0.07), transparent 80%)`,
        }}
      />

      {/* Spotlight de borde magnético que sigue al cursor en hover */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gold-500/40"
        style={{
          maskImage: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
        }}
      />

      {/* Contenido de la Tarjeta */}
      <div className="relative z-10">
        <h3 className="font-display text-xl font-semibold text-white group-hover:text-gold-200 transition-colors duration-300">
          {curso.titulo}
        </h3>
        <p className="mt-2 font-mono text-gold-400 group-hover:text-gold-300 transition-colors duration-300">
          ${curso.precio.toFixed(2)}
        </p>
      </div>
    </motion.li>
  );
}
