"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

const VISTAS = [
  { label: "Día", disponible: false },
  { label: "Semana", disponible: true },
  { label: "Mes", disponible: false },
  { label: "Agenda", disponible: false },
];

export function CalendarToolbar({
  onHoy,
  onAnterior,
  onSiguiente,
}: {
  onHoy: () => void;
  onAnterior: () => void;
  onSiguiente: () => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Semana anterior"
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
          aria-label="Semana siguiente"
          onClick={onSiguiente}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
        {VISTAS.map((vista) => (
          <span
            key={vista.label}
            title={vista.disponible ? undefined : "Próximamente"}
            className={`rounded-md px-3 py-1.5 text-xs font-medium ${
              vista.disponible
                ? "bg-gold-500/10 text-gold-300"
                : "cursor-not-allowed text-mist-500 opacity-50"
            }`}
          >
            {vista.label}
          </span>
        ))}
      </div>
    </div>
  );
}
