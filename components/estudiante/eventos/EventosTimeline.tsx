"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { CategoriaEvento, Evento, ParadaLineaDeTiempo } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO, construirLineaDeTiempo, hoyIso } from "@/lib/db/eventos.types";
import { useReducedMotionSafe } from "@/lib/motion";
import { ParadaEvento } from "./ParadaEvento";

const URL_WHATSAPP = "https://wa.link/o926ih";

type FiltroCategoria = CategoriaEvento | "todos";

const OPCIONES_FILTRO: { valor: FiltroCategoria; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "internacional", etiqueta: CATEGORIA_EVENTO_INFO.internacional.titulo },
  { valor: "nacional_eeuu", etiqueta: CATEGORIA_EVENTO_INFO.nacional_eeuu.titulo },
];

type ItemLineaDeTiempo =
  | { tipo: "marcador"; clave: string }
  | { tipo: "parada"; clave: string; parada: ParadaLineaDeTiempo };

export function EventosTimeline({ eventos }: { eventos: Evento[] }) {
  const [filtro, setFiltro] = useState<FiltroCategoria>("todos");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const marcadorHoyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const hoy = hoyIso();
  const paradas = useMemo(() => construirLineaDeTiempo(eventos, hoy), [eventos, hoy]);
  const paradasFiltradas = useMemo(
    () =>
      filtro === "todos" ? paradas : paradas.filter((parada) => parada.evento.categoria === filtro),
    [paradas, filtro]
  );

  // Se posiciona por "estado" (no por fechaInicio >= hoy) para que el
  // marcador quede consistente con el atenuado de ParadaEvento: un
  // evento de varios días que ya empezó pero sigue en curso hoy
  // (en_ejecucion) debe quedar del lado de "lo activo", no del lado de
  // "lo pasado", aunque su fechaInicio ya haya quedado atrás.
  const indicePrimeraNoRealizada = paradasFiltradas.findIndex(
    (parada) => parada.estado !== "realizado"
  );
  const posicionMarcador =
    indicePrimeraNoRealizada === -1 ? paradasFiltradas.length : indicePrimeraNoRealizada;

  const itemsLinea: ItemLineaDeTiempo[] = [];
  paradasFiltradas.forEach((parada, indice) => {
    if (indice === posicionMarcador) {
      itemsLinea.push({ tipo: "marcador", clave: "marcador-hoy" });
    }
    itemsLinea.push({ tipo: "parada", clave: parada.claveParada, parada });
  });
  if (posicionMarcador === paradasFiltradas.length) {
    itemsLinea.push({ tipo: "marcador", clave: "marcador-hoy" });
  }

  // Solo al montar (y si reducedMotion aun no se habia resuelto la
  // primera vez) -- NO en cada cambio de filtro. El diseno confirmado
  // es "scroll automatico al cargar la pagina", no reubicar al usuario
  // cada vez que hace clic en un chip de categoria mientras ya esta
  // navegando la linea de tiempo.
  useEffect(() => {
    marcadorHoyRef.current?.scrollIntoView?.({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [reducedMotion]);

  const { scrollYProgress } = useScroll({
    target: contenedorRef,
    offset: ["start center", "end center"],
  });
  const alturaLineaRaw = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const alturaLinea = reducedMotion ? "100%" : alturaLineaRaw;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Eventos</h1>
        <p className="mt-2 text-lg text-mist-400">
          Mantente informado sobre próximos eventos del equipo
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPCIONES_FILTRO.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setFiltro(opcion.valor)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filtro === opcion.valor
                ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
                : "border-white/10 text-mist-400 hover:border-white/20"
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {/*
        El contenedor con contenedorRef se mantiene siempre montado (aun con
        la lista vacia) porque useScroll({ target: contenedorRef }) no
        acepta un target que aparezca/desaparezca condicionalmente: si el
        div nunca llega a montarse (p. ej. al filtrar a una categoria sin
        eventos), framer-motion lanza "Target ref is defined but not
        hydrated" de forma asincrona en su loop de rAF, lo que revienta la
        corrida de vitest (exit code 1) aunque los asserts pasen, y en
        produccion ensuciaria la consola cada vez que una categoria quede
        vacia.
      */}
      <div ref={contenedorRef} className="relative pl-8">
        {paradasFiltradas.length === 0 ? (
          <p className="text-mist-400">No hay eventos en esta categoría.</p>
        ) : (
          <>
            <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />
            <motion.div
              className="absolute left-3 top-0 w-px bg-gold-500"
              style={{ height: alturaLinea }}
              aria-hidden="true"
            />

            {itemsLinea.map((item) =>
              item.tipo === "marcador" ? (
                <div
                  key={item.clave}
                  ref={marcadorHoyRef}
                  className="relative -ml-8 mb-6 flex items-center gap-3"
                >
                  <span className="h-3 w-3 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                  <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold-400">
                    Hoy
                  </span>
                  <span className="h-px flex-1 bg-gold-500/40" aria-hidden="true" />
                </div>
              ) : (
                <ParadaEvento key={item.clave} parada={item.parada} />
              )
            )}
          </>
        )}
      </div>

      <a
        href={URL_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-[54px] w-fit items-center justify-center gap-2.5 self-center rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
      >
        Solicitar más Información
      </a>
    </div>
  );
}
