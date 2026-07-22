import { createClient } from "@/lib/supabase/server";

export type EstadisticaLeccion = {
  leccionId: string;
  totalVistas: number;
  totalCompletados: number;
  tasaCompletado: number; // 0-100
  promedioSegundos: number;
  promedioEstrellas: number | null;
  totalReseñas: number;
  comentarios: { usuarioEmail: string; estrellas: number; comentario: string | null; fecha: string }[];
};

export async function getEstadisticasLecciones(
  cursoId: string
): Promise<Map<string, EstadisticaLeccion>> {
  const supabase = await createClient();

  // IDs de lecciones del curso
  const { data: lecciones } = await supabase
    .from("lecciones")
    .select("id")
    .eq("curso_id", cursoId);

  const ids = (lecciones ?? []).map((l) => l.id);
  if (ids.length === 0) return new Map();

  // Progreso por lección
  const { data: progresos } = await supabase
    .from("progreso")
    .select("leccion_id, completado, segundo_actual")
    .in("leccion_id", ids);

  // Reseñas con email del usuario
  const { data: reseñas } = await supabase
    .from("reseñas_lecciones")
    .select("leccion_id, estrellas, comentario, creado_en, usuario_id, usuarios(email)")
    .in("leccion_id", ids)
    .order("creado_en", { ascending: false });

  const resultado = new Map<string, EstadisticaLeccion>();

  for (const id of ids) {
    const prog = (progresos ?? []).filter((p) => p.leccion_id === id);
    const rev = (reseñas ?? []).filter((r) => r.leccion_id === id);

    const totalVistas = prog.length;
    const totalCompletados = prog.filter((p) => p.completado).length;
    const tasaCompletado = totalVistas > 0 ? Math.round((totalCompletados / totalVistas) * 100) : 0;
    const promedioSegundos = totalVistas > 0
      ? Math.round(prog.reduce((s, p) => s + (p.segundo_actual ?? 0), 0) / totalVistas)
      : 0;

    const promedioEstrellas = rev.length > 0
      ? Math.round((rev.reduce((s, r) => s + r.estrellas, 0) / rev.length) * 10) / 10
      : null;

    resultado.set(id, {
      leccionId: id,
      totalVistas,
      totalCompletados,
      tasaCompletado,
      promedioSegundos,
      promedioEstrellas,
      totalReseñas: rev.length,
      comentarios: rev.map((r) => ({
        usuarioEmail: (r.usuarios as unknown as { email: string } | null)?.email ?? "—",
        estrellas: r.estrellas,
        comentario: r.comentario ?? null,
        fecha: r.creado_en,
      })),
    });
  }

  return resultado;
}

export async function getReseñaDelUsuario(
  leccionId: string,
  usuarioId: string
): Promise<{ estrellas: number; comentario: string | null } | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reseñas_lecciones")
    .select("estrellas, comentario")
    .eq("leccion_id", leccionId)
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  return data ?? null;
}
