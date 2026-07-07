import type { CursoPublicado } from "@/lib/db/cursos";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p className="text-mist-400">Próximamente nuevos cursos.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <li
          key={curso.id}
          className="rounded-xl border border-white/10 bg-ink-900 p-5 transition hover:border-gold-500/40"
        >
          <h3 className="font-display font-semibold text-white">
            {curso.titulo}
          </h3>
          <p className="mt-2 font-mono text-gold-400">
            ${curso.precio.toFixed(2)}
          </p>
        </li>
      ))}
    </ul>
  );
}
