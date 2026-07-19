"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { useReducedMotionSafe } from "@/lib/motion";

const SCALE_LEJANA = 0.82;
const SCALE_CENTRO = 1.12;
const OPACITY_LEJANA = 0.45;
const OPACITY_CENTRO = 1;

function interpolar(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export function calcularEstiloFoco(intensidad: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return { scale: 1, opacity: 1 };
  }
  return {
    scale: interpolar(SCALE_LEJANA, SCALE_CENTRO, intensidad),
    opacity: interpolar(OPACITY_LEJANA, OPACITY_CENTRO, intensidad),
  };
}

export const ProyectoCard = forwardRef<
  HTMLDivElement,
  { proyecto: ProyectoAliado; intensidad: number; inert?: boolean }
>(function ProyectoCard({ proyecto, intensidad, inert = false }, ref) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      ref={ref}
      inert={inert}
      animate={calcularEstiloFoco(intensidad, reducedMotion)}
      transition={{ duration: 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-[568px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
    >
      <div className="relative h-[352px] shrink-0 overflow-hidden">
        {proyecto.imagenUrl ? (
          <Image
            src={proyecto.imagenUrl}
            alt={proyecto.nombre}
            fill
            sizes="(min-width: 640px) 380px, 320px"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-display text-lg font-bold text-white">
            {proyecto.nombre}
          </h3>
          {proyecto.precioDesde && (
            <span className="shrink-0 font-mono text-sm font-semibold text-gold-300">
              {proyecto.precioDesde}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-mist-300">
          {proyecto.descripcion}
        </p>
        <p className="truncate text-xs text-mist-400">
          {proyecto.contactoNombre} · {proyecto.contactoTelefono}
        </p>
        <a
          href={proyecto.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200"
        >
          Unirse al grupo de WhatsApp ↗
        </a>
      </div>
    </motion.div>
  );
});
