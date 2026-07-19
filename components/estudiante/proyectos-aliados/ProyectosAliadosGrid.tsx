"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const FALLOFF_FACTOR = 1.5;

type Segmento = "antes" | "real" | "despues";
const SEGMENTOS: Segmento[] = ["antes", "real", "despues"];

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const posicionInicialAplicada = useRef(false);
  const [intensidad, setIntensidad] = useState<Map<string, number>>(
    () => new Map(proyectos.length > 0 ? [[`real:${proyectos[0].id}`, 1]] : [])
  );
  const reducedMotion = useReducedMotionSafe();

  const tarjetas = useMemo(
    () =>
      SEGMENTOS.flatMap((segmento) =>
        proyectos.map((proyecto) => ({
          clave: `${segmento}:${proyecto.id}`,
          segmento,
          proyecto,
        }))
      ),
    [proyectos]
  );

  const actualizarIntensidad = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const medidas = tarjetas
      .map((t) => {
        const el = cardRefs.current.get(t.clave);
        return el ? { ...t, centro: el.offsetLeft + el.offsetWidth / 2 } : null;
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
    if (medidas.length < 2) return;

    const espaciado = medidas[1].centro - medidas[0].centro;
    const distanciaCaida = espaciado * FALLOFF_FACTOR;
    if (distanciaCaida <= 0) return;

    function calcularIntensidades(centroContenedor: number) {
      let masCercana = medidas[0];
      let menorDistancia = Infinity;
      const mapa = new Map<string, number>();
      for (const m of medidas) {
        const distancia = Math.abs(m.centro - centroContenedor);
        const normalizada = Math.min(distancia / distanciaCaida, 1);
        mapa.set(m.clave, 1 - normalizada);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          masCercana = m;
        }
      }
      return { mapa, masCercana };
    }

    const centroContenedor = container.scrollLeft + container.clientWidth / 2;
    const { mapa, masCercana } = calcularIntensidades(centroContenedor);

    if (masCercana.segmento === "real") {
      setIntensidad(mapa);
      return;
    }

    const centroReal = cardRefs.current.get(`real:${masCercana.proyecto.id}`)?.offsetLeft;
    const centroClon = cardRefs.current.get(
      `${masCercana.segmento}:${masCercana.proyecto.id}`
    )?.offsetLeft;
    if (centroReal === undefined || centroClon === undefined) {
      setIntensidad(mapa);
      return;
    }

    const ajuste = centroReal - centroClon;
    container.scrollLeft = container.scrollLeft + ajuste;

    const { mapa: mapaCorregido } = calcularIntensidades(
      container.scrollLeft + container.clientWidth / 2
    );
    setIntensidad(mapaCorregido);
  }, [tarjetas]);

  useEffect(() => {
    actualizarIntensidad();

    window.addEventListener("resize", actualizarIntensidad);
    return () => window.removeEventListener("resize", actualizarIntensidad);
  }, [actualizarIntensidad]);

  useLayoutEffect(() => {
    if (posicionInicialAplicada.current || proyectos.length === 0) return;
    const container = scrollRef.current;
    const primeraReal = cardRefs.current.get(`real:${proyectos[0].id}`);
    if (!container || !primeraReal) return;

    container.scrollLeft = primeraReal.offsetLeft;
    posicionInicialAplicada.current = true;
  }, []);

  function indiceCentrado(): number {
    let mejorIndice = 0;
    let mejorIntensidad = -Infinity;
    proyectos.forEach((proyecto, i) => {
      const valor = intensidad.get(`real:${proyecto.id}`) ?? 0;
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
    const card = cardRefs.current.get(`real:${proyectos[siguiente].id}`);
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
          className="scrollbar-hide flex snap-x snap-mandatory gap-6 overflow-x-auto overflow-y-hidden"
        >
          {tarjetas.map(({ clave, segmento, proyecto }) => (
            <ProyectoCard
              key={clave}
              proyecto={proyecto}
              intensidad={intensidad.get(clave) ?? 0}
              inert={segmento !== "real"}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(clave, el);
                } else {
                  cardRefs.current.delete(clave);
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
