"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getInicioSemana, aFechaISO } from "@/lib/calendario/recurrencia";
import type { VistaCalendario } from "./CalendarToolbar";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

function getInicioMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function nombreMes(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { month: "long" });
}

export function MiniMonthCalendar({
  fechaActual,
  vista,
  onSeleccionarFecha,
}: {
  fechaActual: Date;
  vista: VistaCalendario;
  onSeleccionarFecha: (fecha: Date) => void;
}) {
  const [mesVisible, setMesVisible] = useState(() => getInicioMes(fechaActual));

  useEffect(() => {
    setMesVisible(getInicioMes(fechaActual));
  }, [fechaActual]);

  const inicioGrilla = sumarDias(
    mesVisible,
    -(mesVisible.getDay() === 0 ? 6 : mesVisible.getDay() - 1)
  );
  const celdas = Array.from({ length: 42 }, (_, indice) => sumarDias(inicioGrilla, indice));
  const inicioSemanaSeleccionada = getInicioSemana(fechaActual);
  const finSemanaSeleccionada = sumarDias(inicioSemanaSeleccionada, 6);

  const añoActual = new Date().getFullYear();
  const años = Array.from({ length: 11 }, (_, indice) => añoActual - 5 + indice);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-mist-500">
        Calendario
      </p>

      <div className="mt-2 flex items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() =>
              setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() - 1, 1))
            }
            className="rounded-lg p-1.5 text-mist-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h2 className="min-w-[60px] text-center text-sm font-semibold capitalize text-white">
            {nombreMes(mesVisible)}
          </h2>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() =>
              setMesVisible(new Date(mesVisible.getFullYear(), mesVisible.getMonth() + 1, 1))
            }
            className="rounded-lg p-1.5 text-mist-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <select
          aria-label="Seleccionar año"
          value={mesVisible.getFullYear()}
          onChange={(evento) =>
            setMesVisible(new Date(Number(evento.target.value), mesVisible.getMonth(), 1))
          }
          className="rounded-lg border border-white/10 bg-ink-950 px-2 py-1 text-xs text-mist-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          {años.map((año) => (
            <option key={año} value={año}>
              {año}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.2em] text-mist-500">
        {DIAS.map((dia, indice) => (
          <span key={indice}>{dia}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {celdas.map((fecha) => {
          const dentroMes = fecha.getMonth() === mesVisible.getMonth();
          const resaltada =
            vista === "dia"
              ? aFechaISO(fecha) === aFechaISO(fechaActual)
              : fecha >= inicioSemanaSeleccionada && fecha <= finSemanaSeleccionada;
          const esHoy = aFechaISO(fecha) === aFechaISO(new Date());

          return (
            <button
              key={aFechaISO(fecha)}
              type="button"
              onClick={() => onSeleccionarFecha(fecha)}
              className={`relative aspect-square rounded-xl border text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                resaltada
                  ? "border-gold-500/50 bg-gold-500/10 text-white"
                  : "border-white/5 text-mist-400 hover:border-white/20"
              } ${dentroMes ? "bg-white/[0.03]" : "bg-white/[0.015] opacity-70"}`}
            >
              <span className="relative z-10 flex h-full items-center justify-center">
                {fecha.getDate()}
              </span>
              {esHoy && (
                <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-gold-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
