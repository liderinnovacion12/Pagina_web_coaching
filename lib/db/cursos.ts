import { createClient } from "@/lib/supabase/server";

export type CursoPublicado = {
  id: string;
  titulo: string;
  precio: number;
};

export async function getCursosPublicados(): Promise<CursoPublicado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cursos")
    .select("id, titulo, precio")
    .eq("publicado", true)
    .order("titulo");

  if (error) {
    throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  }

  return data ?? [];
}

export type CategoriaCurso = "sistema_100" | "clases";

export type CursoConProgreso = {
  id: string;
  titulo: string;
  categoria: CategoriaCurso;
  totalLecciones: number;
  leccionesCompletadas: number;
  progresoPorcentaje: number;
};

export async function getCursosPorCategoria(
  usuarioId: string,
  categoria?: CategoriaCurso
): Promise<CursoConProgreso[]> {
  const supabase = await createClient();

  let query = supabase
    .from("cursos")
    .select("id, titulo, categoria")
    .eq("publicado", true);

  if (categoria) {
    query = query.eq("categoria", categoria);
  }

  const { data: cursos, error: cursosError } = await query.order("titulo");

  if (cursosError) {
    throw new Error(`No se pudo cargar el catálogo: ${cursosError.message}`);
  }

  if (!cursos || cursos.length === 0) return [];

  const cursoIds = cursos.map((curso) => curso.id);

  const { data: lecciones, error: leccionesError } = await supabase
    .from("lecciones")
    .select("id, curso_id")
    .in("curso_id", cursoIds);

  if (leccionesError) {
    throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
  }

  const leccionIds = (lecciones ?? []).map((leccion) => leccion.id);

  const { data: progresos, error: progresoError } = leccionIds.length
    ? await supabase
        .from("progreso")
        .select("leccion_id, completado")
        .eq("usuario_id", usuarioId)
        .in("leccion_id", leccionIds)
    : { data: [], error: null };

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const completadas = new Set(
    (progresos ?? []).filter((p) => p.completado).map((p) => p.leccion_id)
  );

  return cursos.map((curso) => {
    const leccionesDelCurso = (lecciones ?? []).filter(
      (leccion) => leccion.curso_id === curso.id
    );
    const total = leccionesDelCurso.length;
    const completadasCount = leccionesDelCurso.filter((leccion) =>
      completadas.has(leccion.id)
    ).length;

    return {
      id: curso.id,
      titulo: curso.titulo,
      categoria: curso.categoria as CategoriaCurso,
      totalLecciones: total,
      leccionesCompletadas: completadasCount,
      progresoPorcentaje: total === 0 ? 0 : Math.round((completadasCount / total) * 100),
    };
  });
}
