import { createClient } from "@/lib/supabase/server";

export type ResumenEstudiante = {
  xpTotal: number;
  insigniasCount: number;
  cursosEnProgreso: number;
  membresiaEstado: "activa" | "cancelada" | "vencida" | "sin_membresia";
  continuarViendo: {
    cursoId: string;
    leccionId: string;
    leccionTitulo: string;
    cursoTitulo: string;
  } | null;
};

export async function getResumenEstudiante(usuarioId: string): Promise<ResumenEstudiante> {
  const supabase = await createClient();

  const [xpResult, insigniasResult, progresoResult, membresiaResult] = await Promise.all([
    supabase.from("xp_eventos").select("puntos").eq("usuario_id", usuarioId),
    supabase.from("insignias_usuario").select("insignia_id").eq("usuario_id", usuarioId),
    supabase
      .from("progreso")
      .select("leccion_id, completado, actualizado_en")
      .eq("usuario_id", usuarioId),
    supabase.from("membresia").select("estado").eq("usuario_id", usuarioId).maybeSingle(),
  ]);

  if (xpResult.error) {
    throw new Error(`No se pudo cargar el XP: ${xpResult.error.message}`);
  }
  if (insigniasResult.error) {
    throw new Error(`No se pudieron cargar las insignias: ${insigniasResult.error.message}`);
  }
  if (progresoResult.error) {
    throw new Error(`No se pudo cargar el progreso: ${progresoResult.error.message}`);
  }
  if (membresiaResult.error) {
    throw new Error(`No se pudo cargar la membresía: ${membresiaResult.error.message}`);
  }

  const xpTotal = (xpResult.data ?? []).reduce((suma, evento) => suma + evento.puntos, 0);
  const insigniasCount = (insigniasResult.data ?? []).length;

  const progresoIncompleto = (progresoResult.data ?? [])
    .filter((p) => !p.completado)
    .sort((a, b) => (a.actualizado_en < b.actualizado_en ? 1 : -1));

  const leccionIdsOrdenados = [...new Set(progresoIncompleto.map((p) => p.leccion_id))];

  let cursosEnProgreso = 0;
  let continuarViendo: ResumenEstudiante["continuarViendo"] = null;

  if (leccionIdsOrdenados.length > 0) {
    const { data: lecciones, error: leccionesError } = await supabase
      .from("lecciones")
      .select("id, titulo, curso_id, orden")
      .in("id", leccionIdsOrdenados);

    if (leccionesError) {
      throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
    }

    const leccionesPorId = new Map((lecciones ?? []).map((l) => [l.id, l]));
    cursosEnProgreso = new Set((lecciones ?? []).map((l) => l.curso_id)).size;

    const leccionMasReciente = leccionesPorId.get(leccionIdsOrdenados[0]);

    if (leccionMasReciente) {
      const { data: curso, error: cursoError } = await supabase
        .from("cursos")
        .select("id, titulo")
        .eq("id", leccionMasReciente.curso_id)
        .single();

      if (cursoError) {
        throw new Error(`No se pudo cargar el curso: ${cursoError.message}`);
      }

      if (curso) {
        continuarViendo = {
          cursoId: curso.id,
          leccionId: leccionMasReciente.id,
          leccionTitulo: leccionMasReciente.titulo,
          cursoTitulo: curso.titulo,
        };
      }
    }
  }

  return {
    xpTotal,
    insigniasCount,
    cursosEnProgreso,
    membresiaEstado: membresiaResult.data?.estado ?? "sin_membresia",
    continuarViendo,
  };
}
