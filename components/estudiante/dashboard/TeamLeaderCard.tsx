"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MiembroEquipo } from "@/lib/db/equipo";
import { useReducedMotionSafe } from "@/lib/motion";

export function TeamLeaderCard({
  miembro,
  variants,
}: {
  miembro: MiembroEquipo;
  variants: Variants;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const parallaxYRaw = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const parallaxY = reducedMotion ? 0 : parallaxYRaw;

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
    >
      {miembro.fotoUrl ? (
        <motion.div
          style={{ y: parallaxY }}
          className="absolute -inset-y-6 inset-x-0"
        >
          <Image
            src={miembro.fotoUrl}
            alt={miembro.nombre}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
      )}
      {/* Degradado premium para que no se pierda el texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent transition-opacity duration-300 group-hover:via-ink-950/50" />

      <div className="absolute inset-x-0 bottom-0 p-8">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold-400">
          {miembro.cargo}
        </span>
        <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
          {miembro.nombre}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-mist-300">
          {miembro.descripcionCargo}
        </p>
        <a
          href={`tel:${miembro.telefono}`}
          className="mt-4.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition duration-200 hover:text-gold-200"
        >
          <span className="underline decoration-gold-500/40 hover:decoration-gold-400">
            {miembro.telefono}
          </span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </motion.div>
  );
}
