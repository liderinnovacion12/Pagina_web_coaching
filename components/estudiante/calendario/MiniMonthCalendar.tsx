"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getInicioSemana, aFechaISO } from "@/lib/calendario/recurrencia";

const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

function sumarDias(fecha: Date, dias: number): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate() + dias);
}

function getInicioMes(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), 1);
}

function nombreMes(fecha: Date): string {
  return fecha.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

export function MiniMonthCalendar({
  semanaActual,
  onSeleccionarFecha,
}: {
  semanaActual: Date;
  onSeleccionarFecha: (fecha: Date) => void;
}) {
  const [mesVisible, setMesVisible] = useState(() => getInicioMes(semanaActual));

  useEffect(() => {
    setMesVisible(getInicioMes(semanaActual));
  }, [semanaActual]);

  const inicioGrilla = sumarDias(
    mesVisible,
    -(mesVisible.getDay() === 0 ? 6 : mesVisible.getDay() - 1)
  );
  const celdas = Array.from({ length: 42 }, (_, indice) => sumarDias(inicioGrilla, indice));
  const inicioSemanaSeleccionada = getInicioSemana(semanaActual);
  const finSemanaSeleccionada = sumarDias(inicioSemanaSeleccionada, 6);

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-mist-500">
            Calendario
          </p>
          <h2 className="mt-1 text-lg font-semibold text-white">{nombreMes(mesVisible)}</h2>
        </div>
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
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center text-[10px] uppercase tracking-[0.2em] text-mist-500">
        {DIAS.map((dia, indice) => (
          <span key={indice}>{dia}</span>
        ))}
      </div>

      <div className="mt-2 grid grid-cols-7 gap-1">
        {celdas.map((fecha) => {
          const dentroMes = fecha.getMonth() === mesVisible.getMonth();
          const dentroSemana =
            fecha >= inicioSemanaSeleccionada && fecha <= finSemanaSeleccionada;
          const esHoy = aFechaISO(fecha) === aFechaISO(new Date());

          return (
            <button
              key={aFechaISO(fecha)}
              type="button"
              onClick={() => onSeleccionarFecha(fecha)}
              className={`relative aspect-square rounded-xl border text-xs transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
                dentroSemana
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
