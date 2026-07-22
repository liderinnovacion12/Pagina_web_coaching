import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
import { requireRol } from "@/lib/auth/session";
import { getComentariosDeLeccion } from "@/lib/comentarios/actions";
import type { ComentarioLeccion } from "@/lib/comentarios/actions";
import { LeccionesCoachClient } from "./LeccionesCoachClient";

export default async function CoachLeccionesPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;
  const sesion = await requireRol(["coach", "admin"]);
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
    <LeccionesCoachClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
      coachId={sesion.id}
      comentariosPorLeccion={comentariosPorLeccion}
    />
  );
}
