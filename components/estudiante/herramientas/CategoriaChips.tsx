"use client";

import type { CategoriaGrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad.types";

export type FiltroCategoria = CategoriaGrupoComunidad | "todos";

const OPCIONES: { valor: FiltroCategoria; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "miami", etiqueta: ETIQUETA_CATEGORIA.miami },
  { valor: "orlando_centro_florida", etiqueta: ETIQUETA_CATEGORIA.orlando_centro_florida },
  { valor: "venta_renta", etiqueta: ETIQUETA_CATEGORIA.venta_renta },
  { valor: "otros", etiqueta: ETIQUETA_CATEGORIA.otros },
];

export function CategoriaChips({
  conteos,
  filtro,
  onFiltroChange,
}: {
  conteos: Record<FiltroCategoria, number>;
  filtro: FiltroCategoria;
  onFiltroChange: (valor: FiltroCategoria) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPCIONES.map((opcion) => (
        <button
          key={opcion.valor}
          type="button"
          onClick={() => onFiltroChange(opcion.valor)}
          className={`rounded-full border px-4 py-1.5 text-sm transition ${
            filtro === opcion.valor
              ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
              : "border-white/10 text-mist-400 hover:border-white/20"
          }`}
        >
          {opcion.etiqueta} ({conteos[opcion.valor] ?? 0})
        </button>
      ))}
    </div>
  );
}
