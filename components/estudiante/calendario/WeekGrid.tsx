"use client";

import { useMemo } from "react";
import { aFechaISO, formatHora, getRangoHorasSemana } from "@/lib/calendario/recurrencia";
import type { ClaseCalendario } from "@/lib/db/calendario";
import { EventCard } from "./EventCard";

export type OcurrenciaClase = {
  clase: ClaseCalendario;
  fecha: Date;
  inicioUtc: Date;
  finUtc: Date;
};

const ALTURA_HORA = 88;

export function WeekGrid({
  dias,
  ocurrencias,
  onSeleccionarOcurrencia,
}: {
  dias: Date[];
  ocurrencias: OcurrenciaClase[];
  onSeleccionarOcurrencia: (ocurrencia: OcurrenciaClase) => void;
}) {
  const esVistaDia = dias.length === 1;
  const columnas = esVistaDia ? "grid-cols-[64px_1fr]" : "grid-cols-[64px_repeat(7,1fr)]";
  const anchoMinimo = esVistaDia ? "min-w-[320px]" : "min-w-[720px]";

  const rango = useMemo(() => getRangoHorasSemana(ocurrencias), [ocurrencias]);
  const horas = useMemo(
    () => Array.from({ length: rango.horaFin - rango.horaInicio }, (_, i) => rango.horaInicio + i),
    [rango]
  );

  const ocurrenciasPorDia = useMemo(() => {
    return dias.map((dia) => {
      const iso = aFechaISO(dia);
      return ocurrencias.filter((ocurrencia) => aFechaISO(ocurrencia.fecha) === iso);
    });
  }, [dias, ocurrencias]);

  return (
    <section className="overflow-x-auto rounded-3xl border border-white/10 bg-white/[0.03] shadow-[0_20px_50px_rgba(0,0,0,0.28)]">
      <div className={anchoMinimo}>
        <div className={`grid ${columnas} border-b border-white/10 bg-white/[0.02]`}>
          <div />
          {dias.map((dia) => (
            <div key={aFechaISO(dia)} className="border-l border-white/10 px-3 py-3 text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-mist-500">
                {dia.toLocaleDateString("es-CO", { weekday: esVistaDia ? "long" : "short" })}
              </p>
              <p className="mt-1 text-lg font-semibold text-white">{dia.getDate()}</p>
            </div>
          ))}
        </div>

        <div className={`grid ${columnas}`}>
          <div className="relative">
            {horas.map((hora) => (
              <div
                key={hora}
                style={{ height: ALTURA_HORA }}
                className="flex items-start justify-end border-b border-white/5 pr-2 pt-1"
              >
                <span className="text-[11px] text-mist-500">{formatHora(hora, 0)}</span>
              </div>
            ))}
          </div>

          {dias.map((dia, indiceDia) => (
            <div
              key={aFechaISO(dia)}
              className="relative border-l border-white/10"
              style={{ height: ALTURA_HORA * horas.length }}
            >
              {horas.map((hora) => (
                <div
                  key={hora}
                  style={{ height: ALTURA_HORA }}
                  className="border-b border-white/5"
                />
              ))}

              {ocurrenciasPorDia[indiceDia].map((ocurrencia) => {
                const inicioDecimal =
                  ocurrencia.inicioUtc.getHours() + ocurrencia.inicioUtc.getMinutes() / 60;
                const finDecimal =
                  ocurrencia.finUtc.getHours() + ocurrencia.finUtc.getMinutes() / 60;

                return (
                  <div
                    key={`${ocurrencia.clase.id}-${aFechaISO(ocurrencia.fecha)}`}
                    className="absolute inset-x-1"
                    style={{
                      top: (inicioDecimal - rango.horaInicio) * ALTURA_HORA,
                      height: Math.max((finDecimal - inicioDecimal) * ALTURA_HORA, ALTURA_HORA / 2),
                    }}
                  >
                    <EventCard ocurrencia={ocurrencia} onClick={onSeleccionarOcurrencia} />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
