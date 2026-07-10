"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export type VistaCalendario = "dia" | "semana";

const VISTAS: { valor: VistaCalendario; label: string }[] = [
  { valor: "dia", label: "Día" },
  { valor: "semana", label: "Semana" },
];

export function CalendarToolbar({
  vista,
  onCambiarVista,
  onHoy,
  onAnterior,
  onSiguiente,
}: {
  vista: VistaCalendario;
  onCambiarVista: (vista: VistaCalendario) => void;
  onHoy: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={vista === "dia" ? "Día anterior" : "Semana anterior"}
          onClick={onAnterior}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={onHoy}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          Hoy
        </button>
        <button
          type="button"
          aria-label={vista === "dia" ? "Día siguiente" : "Semana siguiente"}
          onClick={onSiguiente}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
        {VISTAS.map((v) => (
          <button
            key={v.valor}
            type="button"
            onClick={() => onCambiarVista(v.valor)}
            aria-pressed={vista === v.valor}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 ${
              vista === v.valor
                ? "bg-gold-500/10 text-gold-300"
                : "text-mist-400 hover:text-mist-200"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}
