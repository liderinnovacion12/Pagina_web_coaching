"use client";

import { motion, useMotionTemplate, useMotionValue, type Variants } from "framer-motion";
import { Star, Clock, Users } from "lucide-react";
import Link from "next/link";
import type { CursoPublicado } from "@/lib/db/cursos";

const COURSE_COLORS = [
  "from-gold-600/30 to-gold-900/20",
  "from-blue-600/30 to-blue-900/20",
  "from-purple-600/30 to-purple-900/20",
  "from-green-600/30 to-green-900/20",
];

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];
const DURATIONS = ["8h 30m", "12h 15m", "6h 45m", "15h 20m", "10h 00m"];
const STUDENTS = ["1.2k", "890", "2.4k", "654", "1.8k"];

export function CatalogoCursoCard({
  curso,
  variants,
  index = 0,
}: {
  curso: CursoPublicado;
  variants: Variants;
  index?: number;
}) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const colorClass = COURSE_COLORS[index % COURSE_COLORS.length];
  const level = LEVELS[index % LEVELS.length];
  const duration = DURATIONS[index % DURATIONS.length];
  const students = STUDENTS[index % STUDENTS.length];
  const rating = (4.7 + (index % 3) * 0.1).toFixed(1);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.li
      variants={variants}
      whileHover={{ y: -6 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-2xl border border-white/8 bg-ink-900/60 overflow-hidden backdrop-blur-md transition-[border-color,box-shadow] duration-300 hover:border-gold-500/25 hover:shadow-[0_20px_60px_rgba(0,0,0,0.4)]"
    >
      <Link href={`/registro?plan=curso&cursoId=${curso.id}`} className="absolute inset-0 z-20" aria-label={`Ver curso ${curso.titulo}`} />
      {/* Spotlight de fondo */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(300px circle at ${mouseX}px ${mouseY}px, rgba(217, 169, 78, 0.06), transparent 80%)`,
        }}
      />
      {/* Spotlight de borde */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gold-500/40"
        style={{
          maskImage: useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(180px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
        }}
      />

      {/* Thumbnail */}
      <div className={`relative h-44 w-full bg-gradient-to-br ${colorClass} border-b border-white/5`}>
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        />
        <div className="absolute inset-0 flex items-end p-4">
          <span className={`rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${
            level === "Principiante" ? "border-green-500/40 bg-green-500/10 text-green-400" :
            level === "Intermedio" ? "border-blue-500/40 bg-blue-500/10 text-blue-400" :
            "border-gold-500/40 bg-gold-500/10 text-gold-400"
          }`}>
            {level}
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="relative z-10 p-5">
        <h3 className="font-display text-base font-semibold text-white group-hover:text-gold-200 transition-colors duration-300 leading-snug mb-3">
          {curso.titulo}
        </h3>

        {/* Meta: rating · duración · estudiantes */}
        <div className="flex items-center gap-3 mb-4 font-mono text-xs text-mist-400">
          <span className="flex items-center gap-1">
            <Star className="h-3 w-3 fill-gold-400 text-gold-400" />
            <span className="text-gold-400 font-semibold">{rating}</span>
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {students}
          </span>
        </div>

        {/* Footer: precio + CTA */}
        <div className="flex items-center justify-between pt-4 border-t border-white/8">
          <div>
            <p className="font-display text-xl font-bold text-gold-400">
              ${curso.precio.toFixed(0)}
              <span className="font-mono text-xs text-mist-500 ml-1">USD</span>
            </p>
          </div>
          <span className="inline-flex items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/25 px-3 py-1.5 font-mono text-xs text-gold-400 transition-all duration-200 group-hover:bg-gold-500/20 group-hover:border-gold-500/40 group-hover:text-gold-300">
            Ver curso →
          </span>
        </div>
      </div>
    </motion.li>
  );
}
