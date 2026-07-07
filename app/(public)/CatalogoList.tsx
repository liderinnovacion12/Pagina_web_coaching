import type { CursoPublicado } from "@/lib/db/cursos";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p>Próximamente nuevos cursos.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <li key={curso.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{curso.titulo}</h3>
          <p>${curso.precio.toFixed(2)}</p>
        </li>
      ))}
    </ul>
  );
}
