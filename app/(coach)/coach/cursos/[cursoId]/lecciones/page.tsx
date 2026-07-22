import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
import { requireRol } from "@/lib/auth/session";
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

  return (
    <LeccionesCoachClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
      coachId={sesion.id}
    />
  );
}
