"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const SCROLL_AMOUNT_PX = 400;

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [enFocoId, setEnFocoId] = useState<string | null>(proyectos[0]?.id ?? null);
  const reducedMotion = useReducedMotionSafe();

  const actualizarEnFoco = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const centroContenedor = container.scrollLeft + container.clientWidth / 2;
    let masCercanoId: string | null = null;
    let menorDistancia = Infinity;

    for (const [id, card] of cardRefs.current) {
      const centroTarjeta = card.offsetLeft + card.offsetWidth / 2;
      const distancia = Math.abs(centroTarjeta - centroContenedor);
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        masCercanoId = id;
      }
    }

    setEnFocoId(masCercanoId);
  }, []);

  useEffect(() => {
    actualizarEnFoco();
  }, [actualizarEnFoco, proyectos]);

  function desplazar(direccion: 1 | -1) {
    scrollRef.current?.scrollBy({
      left: SCROLL_AMOUNT_PX * direccion,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

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

      <motion.div variants={blurFadeUp} className="relative">
        <div
          ref={scrollRef}
          onScroll={actualizarEnFoco}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {proyectos.map((proyecto) => (
            <ProyectoCard
              key={proyecto.id}
              proyecto={proyecto}
              enFoco={proyecto.id === enFocoId}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(proyecto.id, el);
                } else {
                  cardRefs.current.delete(proyecto.id);
                }
              }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Proyecto anterior"
          onClick={() => desplazar(-1)}
          className="absolute -left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Proyecto siguiente"
          onClick={() => desplazar(1)}
          className="absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </motion.div>
    </motion.div>
  );
}
