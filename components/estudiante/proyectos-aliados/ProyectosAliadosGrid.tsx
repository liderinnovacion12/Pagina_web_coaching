"use client";

import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Proyectos Inmobiliarios Aliados
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Desarrollos y proyectos con los que trabajamos junto al Team Wilmar & Samuel.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-mist-300">
            Comisión regular: <span className="font-semibold text-white">6%</span>
          </span>
          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm text-gold-200">
            Comisión para el equipo: <span className="font-semibold">7%</span>
          </span>
        </div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        {proyectos.map((proyecto) => (
          <ProyectoCard key={proyecto.id} proyecto={proyecto} />
        ))}
      </div>
    </motion.div>
  );
}
