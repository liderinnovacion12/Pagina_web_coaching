"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export function Paginacion({
  pagina,
  totalPaginas,
  totalItems,
  porPagina,
  onPaginaChange,
}: {
  pagina: number;
  totalPaginas: number;
  totalItems: number;
  porPagina: number;
  onPaginaChange: (pagina: number) => void;
}) {
  if (totalPaginas <= 1) {
    return null;
  }

  const inicio = (pagina - 1) * porPagina + 1;
  const fin = Math.min(pagina * porPagina, totalItems);

  return (
    <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row">
      <p className="text-sm text-mist-400">
        Mostrando {inicio}–{fin} de {totalItems} grupos
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label="Página anterior"
          disabled={pagina === 1}
          onClick={() => onPaginaChange(pagina - 1)}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        {Array.from({ length: totalPaginas }, (_, indice) => indice + 1).map((numero) => (
          <button
            key={numero}
            type="button"
            aria-current={numero === pagina ? "page" : undefined}
            onClick={() => onPaginaChange(numero)}
            className={`h-9 w-9 rounded-lg text-sm transition ${
              numero === pagina
                ? "border border-gold-500/60 bg-gold-500/10 text-gold-300"
                : "text-mist-400 hover:bg-white/[0.03]"
            }`}
          >
            {numero}
          </button>
        ))}
        <button
          type="button"
          aria-label="Página siguiente"
          disabled={pagina === totalPaginas}
          onClick={() => onPaginaChange(pagina + 1)}
          className="rounded-lg border border-white/10 p-2 text-mist-300 transition hover:border-gold-500/60 hover:bg-gold-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
