import { createClient } from "@/lib/supabase/server";
import { tieneAccesoCurso } from "./cursos";

export type LeccionDetalle = {
  id: string;
  titulo: string;
  cursoId: string;
  cursoTitulo: string;
  tipoContenido: string;
  muxAssetId: string | null;
  storageKey: string | null;
  segundoActual: number;
  completado: boolean;
  leccionAnteriorId: string | null;
  leccionSiguienteId: string | null;
  accesoCurso: boolean;
  precio: number;
  accesoLeccion: boolean;
};

export async function getLeccionDetalle(
  cursoId: string,
  leccionId: string,
  usuarioId: string
): Promise<LeccionDetalle | null> {
  const supabase = await createClient();

  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, publicado, precio")
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

  const listaLecciones = lecciones ?? [];
  const indice = listaLecciones.findIndex((leccion) => leccion.id === leccionId);

  if (indice === -1) {
    return null;
  }

  const leccion = listaLecciones[indice];

  const { data: progreso, error: progresoError } = await supabase
    .from("progreso")
    .select("segundo_actual, completado")
    .eq("usuario_id", usuarioId)
    .eq("leccion_id", leccionId)
    .maybeSingle();

  if (progresoError) {
    throw new Error(`No se pudo cargar el progreso: ${progresoError.message}`);
  }

  const accesoCurso = await tieneAccesoCurso(curso.id, usuarioId, curso.precio);

  const precioPorLeccion = Number(leccion.precio ?? 0);
  let accesoLeccion = accesoCurso;

  if (!accesoLeccion && precioPorLeccion > 0) {
    const { data: accesoRow } = await supabase
      .from("leccion_accesos")
      .select("id")
      .eq("usuario_id", usuarioId)
      .eq("leccion_id", leccionId)
      .maybeSingle();
    accesoLeccion = !!accesoRow;
  } else if (!accesoLeccion && precioPorLeccion === 0) {
    accesoLeccion = false;
  }

  return {
    id: leccion.id,
    titulo: leccion.titulo,
    cursoId: curso.id,
    cursoTitulo: curso.titulo,
    tipoContenido: leccion.tipo_contenido,
    muxAssetId: leccion.mux_asset_id,
    storageKey: leccion.storage_key,
    segundoActual: progreso?.segundo_actual ?? 0,
    completado: progreso?.completado ?? false,
    leccionAnteriorId: indice > 0 ? listaLecciones[indice - 1].id : null,
    leccionSiguienteId:
      indice < listaLecciones.length - 1 ? listaLecciones[indice + 1].id : null,
    accesoCurso,
    precio: precioPorLeccion,
    accesoLeccion,
  };
}

export async function marcarProgreso(
  usuarioId: string,
  leccionId: string,
  cambios: { segundoActual?: number; completado?: boolean }
): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("progreso").upsert(
    {
      usuario_id: usuarioId,
      leccion_id: leccionId,
      ...(cambios.segundoActual !== undefined && { segundo_actual: cambios.segundoActual }),
      ...(cambios.completado !== undefined && { completado: cambios.completado }),
      actualizado_en: new Date().toISOString(),
    },
    { onConflict: "usuario_id,leccion_id" }
  );

  if (error) {
    throw new Error(`No se pudo guardar el progreso: ${error.message}`);
  }
}
