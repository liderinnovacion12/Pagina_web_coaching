"use client";

import { useMemo, useState } from "react";
import { CursoCard } from "@/components/estudiante/CursoCard";
import type { CategoriaCurso, CursoConProgreso } from "@/lib/db/cursos";

const FILTROS: { etiqueta: string; valor: CategoriaCurso | "todas" }[] = [
  { etiqueta: "Todas", valor: "todas" },
  { etiqueta: "Sistema 100+", valor: "sistema_100" },
  { etiqueta: "Clases", valor: "clases" },
];

export function ClasesCatalogo({ cursos }: { cursos: CursoConProgreso[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<CategoriaCurso | "todas">("todas");

  const cursosFiltrados = useMemo(() => {
    return cursos.filter((curso) => {
      const coincideTexto = curso.titulo.toLowerCase().includes(busqueda.trim().toLowerCase());
      const coincideCategoria = filtro === "todas" || curso.categoria === filtro;
      return coincideTexto && coincideCategoria;
    });
  }, [cursos, busqueda, filtro]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <label htmlFor="busqueda-clases" className="sr-only">
            Buscar clases
          </label>
          <input
            id="busqueda-clases"
            type="text"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar clases..."
            aria-label="Buscar clases"
            className="h-11 w-full rounded-xl border border-white/10 bg-ink-950 px-4 text-sm text-white placeholder:text-mist-500 outline-none focus:border-gold-500/60 sm:w-72"
          />
        </div>

        <div className="flex gap-2">
          {FILTROS.map((opcion) => (
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
      </div>

      {cursosFiltrados.length === 0 ? (
        <p className="text-mist-400">No encontramos clases con ese nombre.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados.map((curso) => (
            <CursoCard key={curso.id} curso={curso} />
          ))}
        </div>
      )}
    </div>
  );
}
