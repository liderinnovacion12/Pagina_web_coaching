import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getSesionUsuario } from "@/lib/auth/session";
import { getLeccionDetalle } from "@/lib/db/lecciones";
import { getReseñaDelUsuario } from "@/lib/db/estadisticas";
import { LeccionPlayer } from "./LeccionPlayer";

export default async function LeccionPage({
  params,
}: {
  params: Promise<{ cursoId: string; leccionId: string }>;
}) {
  const { cursoId, leccionId } = await params;
  const sesion = await getSesionUsuario();
  const [leccion, reseña] = await Promise.all([
    getLeccionDetalle(cursoId, leccionId, sesion!.id),
    getReseñaDelUsuario(leccionId, sesion!.id),
  ]);

  if (!leccion) notFound();
  if (!leccion.accesoCurso) redirect(`/cursos/${cursoId}?bloqueado=1`);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href={`/cursos/${cursoId}`} className="text-sm text-gold-300 hover:text-gold-200">
          {leccion.cursoTitulo}
        </Link>
        <h1 className="mt-2 font-display text-3xl font-bold text-white">{leccion.titulo}</h1>
      </div>

      <LeccionPlayer
        leccionId={leccion.id}
        cursoId={cursoId}
        muxAssetId={leccion.muxAssetId}
        completado={leccion.completado}
        reseñaInicial={reseña}
      />

      <div className="flex items-center justify-between">
        {leccion.leccionAnteriorId ? (
          <Link
            href={`/cursos/${cursoId}/lecciones/${leccion.leccionAnteriorId}`}
            className="flex items-center gap-1 text-sm text-mist-300 hover:text-white"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Lección anterior
          </Link>
        ) : (
          <span />
        )}

        {leccion.leccionSiguienteId && (
          <Link
            href={`/cursos/${cursoId}/lecciones/${leccion.leccionSiguienteId}`}
            className="flex items-center gap-1 text-sm text-mist-300 hover:text-white"
          >
            Siguiente lección
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </div>
  );
}
