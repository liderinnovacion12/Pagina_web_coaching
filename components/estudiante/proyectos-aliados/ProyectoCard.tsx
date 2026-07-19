"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { useReducedMotionSafe } from "@/lib/motion";

export const ProyectoCard = forwardRef<
  HTMLDivElement,
  { proyecto: ProyectoAliado; enFoco: boolean }
>(function ProyectoCard({ proyecto, enFoco }, ref) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      ref={ref}
      animate={
        reducedMotion
          ? { scale: 1, opacity: 1 }
          : { scale: enFoco ? 1.04 : 0.94, opacity: enFoco ? 1 : 0.75 }
      }
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-[440px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
    >
      <div className="relative h-56 shrink-0 overflow-hidden">
        {proyecto.imagenUrl ? (
          <Image
            src={proyecto.imagenUrl}
            alt={proyecto.nombre}
            fill
            sizes="(min-width: 640px) 380px, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
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
