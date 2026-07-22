import { notFound } from "next/navigation";
import { getLeccionesDeUnCurso, getCursoAdminById } from "@/lib/db/admin";
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

  return (
    <LeccionesClient
      lecciones={lecciones}
      cursoId={cursoId}
      cursoTitulo={curso.titulo}
    />
  );
}
