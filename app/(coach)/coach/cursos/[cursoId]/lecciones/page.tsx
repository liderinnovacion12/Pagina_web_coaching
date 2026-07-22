import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
import { getEstadisticasLecciones } from "@/lib/db/estadisticas";
import { requireRol } from "@/lib/auth/session";
import { LeccionesCoachClient } from "./LeccionesCoachClient";

export default async function CoachLeccionesPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;
  const sesion = await requireRol(["coach", "admin"]);

  const [curso, lecciones, statsMap] = await Promise.all([
    getCursoAdminById(cursoId),
    getLeccionesDeUnCurso(cursoId),
    getEstadisticasLecciones(cursoId),
  ]);

  if (!curso) notFound();

  const estadisticas = Object.fromEntries(statsMap);

  return (
    <LeccionesCoachClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
      coachId={sesion.id}
      estadisticas={estadisticas}
    />
  );
}
