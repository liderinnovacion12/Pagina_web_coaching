"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const FALLOFF_FACTOR = 1.5;

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [intensidad, setIntensidad] = useState<Map<string, number>>(
    () => new Map(proyectos.length > 0 ? [[proyectos[0].id, 1]] : [])
  );
  const reducedMotion = useReducedMotionSafe();

  const actualizarIntensidad = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const entradas = proyectos
      .map((p) => cardRefs.current.get(p.id))
      .filter((el): el is HTMLDivElement => !!el);
    if (entradas.length === 0) return;

    const centros = entradas.map((el) => el.offsetLeft + el.offsetWidth / 2);
    const espaciado =
      centros.length > 1 ? centros[1] - centros[0] : container.clientWidth;
    const distanciaCaida = espaciado * FALLOFF_FACTOR;

    const centroContenedor = container.scrollLeft + container.clientWidth / 2;
    const nuevaIntensidad = new Map<string, number>();

    proyectos.forEach((proyecto, i) => {
      const centroTarjeta = centros[i];
      if (centroTarjeta === undefined) return;
      const distancia = Math.abs(centroTarjeta - centroContenedor);
      const normalizada =
        distanciaCaida > 0 ? Math.min(distancia / distanciaCaida, 1) : 0;
      nuevaIntensidad.set(proyecto.id, 1 - normalizada);
    });

    setIntensidad(nuevaIntensidad);
  }, [proyectos]);

  useEffect(() => {
    actualizarIntensidad();

    window.addEventListener("resize", actualizarIntensidad);
    return () => window.removeEventListener("resize", actualizarIntensidad);
  }, [actualizarIntensidad, proyectos]);

  function indiceCentrado(): number {
    let mejorIndice = 0;
    let mejorIntensidad = -Infinity;
    proyectos.forEach((proyecto, i) => {
      const valor = intensidad.get(proyecto.id) ?? 0;
      if (valor > mejorIntensidad) {
        mejorIntensidad = valor;
        mejorIndice = i;
      }
    });
    return mejorIndice;
  }

  function desplazar(direccion: 1 | -1) {
    const container = scrollRef.current;
    if (!container || proyectos.length === 0) return;

    const actual = indiceCentrado();
    const siguiente = (actual + direccion + proyectos.length) % proyectos.length;
    const card = cardRefs.current.get(proyectos[siguiente].id);
    if (!card) return;

    const centroTarjeta = card.offsetLeft + card.offsetWidth / 2;
    const scrollObjetivo = centroTarjeta - container.clientWidth / 2;

    container.scrollTo({
      left: scrollObjetivo,
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
          onScroll={actualizarIntensidad}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {proyectos.map((proyecto) => (
            <ProyectoCard
              key={proyecto.id}
              proyecto={proyecto}
              intensidad={intensidad.get(proyecto.id) ?? 0}
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
