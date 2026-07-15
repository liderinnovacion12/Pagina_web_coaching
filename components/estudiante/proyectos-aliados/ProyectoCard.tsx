"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { blurFadeUp } from "@/lib/motion";

export function ProyectoCard({ proyecto }: { proyecto: ProyectoAliado }) {
  return (
    <motion.div
      variants={blurFadeUp}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
    >
      {proyecto.imagenUrl ? (
        <Image
          src={proyecto.imagenUrl}
          alt={proyecto.nombre}
          fill
          sizes="(min-width: 640px) 50vw, 100vw"
          className="object-cover opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
        />
      ) : (
        <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/70 to-transparent transition-opacity duration-300 group-hover:via-ink-950/60" />

      {proyecto.precioDesde && (
        <span className="absolute right-6 top-6 rounded-full border border-gold-500/20 bg-gold-500/10 px-3 py-1 text-xs font-semibold text-gold-300">
          {proyecto.precioDesde}
        </span>
      )}

      <div className="absolute inset-x-0 bottom-0 p-8">
        <h3 className="font-display text-xl font-bold text-white">{proyecto.nombre}</h3>
        <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-mist-300">
          {proyecto.descripcion}
        </p>
        <p className="mt-3 text-xs text-mist-400">
          {proyecto.contactoNombre} · {proyecto.contactoTelefono}
        </p>
        <a
          href={proyecto.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200"
        >
          Unirse al grupo de WhatsApp ↗
        </a>
      </div>
    </motion.div>
  );
}
