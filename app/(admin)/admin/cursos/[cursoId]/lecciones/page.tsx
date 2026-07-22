import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
import { getComentariosDeLeccion } from "@/lib/comentarios/actions";
import type { ComentarioLeccion } from "@/lib/comentarios/actions";
import { LeccionesClient } from "./LeccionesClient";

export default async function AdminLeccionesPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;
  const [curso, lecciones] = await Promise.all([
    getCursoAdminById(cursoId),
    getLeccionesDeUnCurso(cursoId),
  ]);

  if (!curso) notFound();

  const comentariosPorLeccion: Record<string, ComentarioLeccion[]> = {};
  await Promise.all(
    lecciones.map(async (l) => {
      comentariosPorLeccion[l.id] = await getComentariosDeLeccion(l.id);
    })
  );

  return (
    <LeccionesClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
      comentariosPorLeccion={comentariosPorLeccion}
    />
  );
}
