"use client";

import { LayoutGrid, List, Search } from "lucide-react";

export type OrdenGrupos = "nombre" | "recientes";
export type VistaGrupos = "grid" | "lista";

export function HerramientasToolbar({
  busqueda,
  onBusquedaChange,
  orden,
  onOrdenChange,
  vista,
  onVistaChange,
}: {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  orden: OrdenGrupos;
  onOrdenChange: (valor: OrdenGrupos) => void;
  vista: VistaGrupos;
  onVistaChange: (valor: VistaGrupos) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative sm:w-72">
        <Search
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
          aria-hidden="true"
        />
        <label htmlFor="busqueda-herramientas" className="sr-only">
          Buscar grupo
        </label>
        <input
          id="busqueda-herramientas"
          type="text"
          value={busqueda}
          onChange={(evento) => onBusquedaChange(evento.target.value)}
          placeholder="Buscar grupo..."
          aria-label="Buscar grupo"
          className="h-11 w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-sm text-white placeholder:text-mist-500 outline-none focus:border-gold-500/60"
        />
      </div>

      <div className="flex items-center gap-3">
        <label className="sr-only" htmlFor="orden-herramientas">
          Ordenar
        </label>
        <select
          id="orden-herramientas"
          value={orden}
          onChange={(evento) => onOrdenChange(evento.target.value as OrdenGrupos)}
          className="h-11 rounded-xl border border-white/10 bg-ink-950 px-3 text-sm text-white outline-none focus:border-gold-500/60"
        >
          <option value="nombre">Nombre A-Z</option>
          <option value="recientes">Más recientes</option>
        </select>

        <div className="flex items-center gap-1 rounded-lg border border-white/10 p-1">
          <button
            type="button"
            aria-pressed={vista === "grid"}
            aria-label="Vista de cuadrícula"
            onClick={() => onVistaChange("grid")}
            className={`rounded-md p-2 transition ${
              vista === "grid" ? "bg-gold-500/10 text-gold-300" : "text-mist-400 hover:text-mist-200"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-pressed={vista === "lista"}
            aria-label="Vista de lista"
            onClick={() => onVistaChange("lista")}
            className={`rounded-md p-2 transition ${
              vista === "lista" ? "bg-gold-500/10 text-gold-300" : "text-mist-400 hover:text-mist-200"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
