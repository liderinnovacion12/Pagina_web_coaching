import Link from "next/link";
import type { CursoConProgreso } from "@/lib/db/cursos";

export function CursoCard({ curso }: { curso: CursoConProgreso }) {
  return (
    <Link
      href={`/cursos/${curso.id}`}
      className="block rounded-xl border border-white/[0.08] bg-white/[0.03] p-5 transition hover:border-gold-500/40"
    >
      <h3 className="font-display font-semibold text-white">{curso.titulo}</h3>
      <p className="mt-1 text-sm text-mist-500">
        {curso.totalLecciones} {curso.totalLecciones === 1 ? "lección" : "lecciones"}
      </p>

      <div className="mt-4 flex items-center gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gold-500"
            style={{ width: `${curso.progresoPorcentaje}%` }}
          />
        </div>
        <span className="font-mono text-xs text-mist-400">{curso.progresoPorcentaje}%</span>
      </div>

      {curso.progresoPorcentaje === 100 && (
        <p className="mt-2 text-xs font-medium text-emerald-400">Completado</p>
      )}
    </Link>
  );
}
