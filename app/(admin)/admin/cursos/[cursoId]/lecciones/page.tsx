import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
import { getEstadisticasLecciones } from "@/lib/db/estadisticas";
import { LeccionesClient } from "./LeccionesClient";

export default async function AdminLeccionesPage({
  params,
}: {
  params: Promise<{ cursoId: string }>;
}) {
  const { cursoId } = await params;

  const [curso, lecciones, statsMap] = await Promise.all([
    getCursoAdminById(cursoId),
    getLeccionesDeUnCurso(cursoId),
    getEstadisticasLecciones(cursoId),
  ]);

  if (!curso) notFound();

  const estadisticas = Object.fromEntries(statsMap);

  return (
    <LeccionesClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
      estadisticas={estadisticas}
    />
  );
}
