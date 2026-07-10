"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import type { ClaseCalendario } from "@/lib/db/calendario";
import {
  getInicioSemana,
  getOcurrenciaEnSemana,
  zonedTimeToUtc,
  aFechaISO,
  formatRangoSemana,
  formatFechaCompleta,
} from "@/lib/calendario/recurrencia";
import { staggerContainer, blurFadeUp, EASE_OUT, useReducedMotionSafe } from "@/lib/motion";
import { MiniMonthCalendar } from "./MiniMonthCalendar";
import { CalendarToolbar, type VistaCalendario } from "./CalendarToolbar";
import { WeekGrid, type OcurrenciaClase } from "./WeekGrid";
import { EventDetailPanel } from "./EventDetailPanel";

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

function obtenerDiasSemana(inicioSemana: Date): Date[] {
  return Array.from({ length: 7 }, (_, indice) => sumarDias(inicioSemana, indice));
}

const vistaVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 24 }),
  center: { opacity: 1, x: 0 },
  exit: (direction: number) => ({ opacity: 0, x: direction * -24 }),
};

export function CalendarioSemanal({ clases }: { clases: ClaseCalendario[] }) {
  const [fechaActual, setFechaActual] = useState(() => new Date());
  const [vista, setVista] = useState<VistaCalendario>("semana");
  const [direccion, setDireccion] = useState(0);
  const [ocurrenciaSeleccionada, setOcurrenciaSeleccionada] = useState<OcurrenciaClase | null>(
    null
  );
  const motionReducido = useReducedMotionSafe();

  function irAFecha(nuevaFecha: Date, direccionNav: number) {
    setDireccion(direccionNav);
    setFechaActual(nuevaFecha);
  }

  const semanaActual = useMemo(() => getInicioSemana(fechaActual), [fechaActual]);
  const diasVisibles = useMemo(
    () => (vista === "dia" ? [fechaActual] : obtenerDiasSemana(semanaActual)),
    [vista, fechaActual, semanaActual]
  );

  const ocurrencias = useMemo<OcurrenciaClase[]>(() => {
    return clases.flatMap((clase) => {
      const fecha = getOcurrenciaEnSemana(clase.fechaAncla, clase.recurrencia, semanaActual);
      if (!fecha) {
        return [];
      }

      const fechaISO = aFechaISO(fecha);
      return [
        {
          clase,
          fecha,
          inicioUtc: zonedTimeToUtc(fechaISO, clase.horaInicio),
          finUtc: zonedTimeToUtc(fechaISO, clase.horaFin),
        },
      ];
    });
  }, [clases, semanaActual]);

  function cambiarVista(nuevaVista: VistaCalendario) {
    setDireccion(0);
    setVista(nuevaVista);
  }

  const claveVista =
    vista === "dia" ? `dia-${aFechaISO(fechaActual)}` : `semana-${aFechaISO(semanaActual)}`;

  return (
    <motion.div
      variants={staggerContainer(0.08)}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-8 lg:flex-row lg:items-start"
    >
      <motion.aside
        variants={blurFadeUp}
        className="w-full shrink-0 lg:sticky lg:top-24 lg:w-[272px]"
      >
        <MiniMonthCalendar
          fechaActual={fechaActual}
          vista={vista}
          onSeleccionarFecha={(fecha) => irAFecha(fecha, 0)}
        />
      </motion.aside>

      <motion.div variants={blurFadeUp} className="min-w-0 flex-1">
        <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-5 shadow-[0_20px_50px_rgba(0,0,0,0.18)]">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-gold-300">
            Calendario {vista === "dia" ? "diario" : "semanal"}
          </p>
          <h1 className="mt-2 font-display text-[32px] font-bold leading-tight text-white">
            {vista === "dia" ? "Día del equipo" : "Semana del equipo"}
          </h1>
          <p className="mt-1 text-mist-400">
            {vista === "dia" ? formatFechaCompleta(fechaActual) : formatRangoSemana(semanaActual)}
          </p>

          <CalendarToolbar
            vista={vista}
            onCambiarVista={cambiarVista}
            onHoy={() => irAFecha(new Date(), 0)}
            onAnterior={() => irAFecha(sumarDias(fechaActual, vista === "dia" ? -1 : -7), -1)}
            onSiguiente={() => irAFecha(sumarDias(fechaActual, vista === "dia" ? 1 : 7), 1)}
          />
        </div>

        <div className="mt-6 overflow-hidden">
          <AnimatePresence mode="wait" custom={direccion} initial={false}>
            <motion.div
              key={claveVista}
              custom={direccion}
              variants={motionReducido ? undefined : vistaVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, ease: EASE_OUT }}
            >
              <WeekGrid
                dias={diasVisibles}
                ocurrencias={ocurrencias}
                onSeleccionarOcurrencia={setOcurrenciaSeleccionada}
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>

      <EventDetailPanel
        ocurrencia={ocurrenciaSeleccionada}
        onClose={() => setOcurrenciaSeleccionada(null)}
      />
    </motion.div>
  );
}
