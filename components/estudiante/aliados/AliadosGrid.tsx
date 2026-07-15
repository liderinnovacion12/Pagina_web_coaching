"use client";

import { motion } from "framer-motion";
import type { Aliado } from "@/lib/db/aliados.types";
import { staggerContainer, blurFadeUp } from "@/lib/motion";
import { AliadoCard } from "./AliadoCard";

export function AliadosGrid({ aliados }: { aliados: Aliado[] }) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Aliados Estratégicos del Equipo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Contactos y aliados que trabajan con el Team Wilmar & Samuel.
        </p>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        {aliados.map((aliado) => (
          <AliadoCard key={aliado.id} aliado={aliado} />
        ))}
      </div>
    </motion.div>
  );
}
