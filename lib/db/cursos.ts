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

export type LeccionConProgreso = {
  id: string;
  titulo: string;
  tipoContenido: string;
  muxAssetId: string | null;
  storageKey: string | null;
  orden: number;
  segundoActual: number;
  completado: boolean;
  precio: number;
  accesoIndividual: boolean;
};

export type CursoDetalle = {
  id: string;
  titulo: string;
  categoria: CategoriaCurso;
  precio: number;
  accesoCurso: boolean;
  lecciones: LeccionConProgreso[];
};

export async function getCursoDetalle(
  cursoId: string,
  usuarioId: string
): Promise<CursoDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, categoria, publicado, precio")
    .eq("id", cursoId)
    .single();

  if (cursoError || !curso || !curso.publicado) {
    return null;
  }

  const { data: lecciones, error: leccionesError } = await supabase
    .from("lecciones")
    .select("id, titulo, tipo_contenido, mux_asset_id, storage_key, orden, precio")
    .eq("curso_id", cursoId)
    .order("orden");

  if (leccionesError) {
    throw new Error(`No se pudieron cargar las lecciones: ${leccionesError.message}`);
  }

  const leccionIds = (lecciones ?? []).map((leccion) => leccion.id);

  const { data: progresos, error: progresoError } = leccionIds.length
    ? await supabase
        .from("progreso")
        .select("leccion_id, segundo_actual, completado")
        .eq("usuario_id", usuarioId)
        .in("leccion_id", leccionIds)
    : { data: [], error: null };

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const accesoCurso = await tieneAccesoCurso(curso.id, usuarioId, curso.precio);

  // Accesos individuales por lección ya comprados
  let accesosPorLeccion = new Set<string>();
  if (!accesoCurso && leccionIds.length > 0) {
    const { data: accesos } = await supabase
      .from("leccion_accesos")
      .select("leccion_id")
      .eq("usuario_id", usuarioId)
      .in("leccion_id", leccionIds);
    accesosPorLeccion = new Set((accesos ?? []).map((a) => a.leccion_id));
  }

  const progresoPorLeccion = new Map(
    (progresos ?? []).map((progreso) => [progreso.leccion_id, progreso])
  );

  return {
    id: curso.id,
    titulo: curso.titulo,
    categoria: curso.categoria as CategoriaCurso,
    precio: Number(curso.precio ?? 0),
    accesoCurso,
    lecciones: (lecciones ?? []).map((leccion) => {
      const progreso = progresoPorLeccion.get(leccion.id);
      return {
        id: leccion.id,
        titulo: leccion.titulo,
        tipoContenido: leccion.tipo_contenido,
        muxAssetId: leccion.mux_asset_id,
        storageKey: leccion.storage_key,
        orden: leccion.orden,
        segundoActual: progreso?.segundo_actual ?? 0,
        completado: progreso?.completado ?? false,
        precio: Number(leccion.precio ?? 0),
        accesoIndividual: accesoCurso || accesosPorLeccion.has(leccion.id),
      };
    }),
  };
}

export async function tieneAccesoCurso(
  cursoId: string,
  usuarioId: string,
  precio: number
): Promise<boolean> {
  if (precio === 0) return true;

  const supabase = await createClient();

  const { data: inscripcion, error: inscripcionError } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("usuario_id", usuarioId)
    .eq("curso_id", cursoId)
    .maybeSingle();

  if (inscripcionError) {
    throw new Error(`No se pudo verificar el acceso al curso: ${inscripcionError.message}`);
  }

  if (inscripcion) return true;

  const { data: membresia, error: membresiaError } = await supabase
    .from("membresia")
    .select("estado, periodo_fin")
    .eq("usuario_id", usuarioId)
    .maybeSingle();

  if (membresiaError) {
    throw new Error(`No se pudo verificar el acceso al curso: ${membresiaError.message}`);
  }

  if (!membresia || membresia.estado !== "activa") return false;

  return membresia.periodo_fin === null || new Date(membresia.periodo_fin) > new Date();
}
