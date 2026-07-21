import { createClient } from "@/lib/supabase/server";

export type EstadisticasCoach = {
  totalCursos: number;
  cursosPublicados: number;
  totalLecciones: number;
  totalEstudiantes: number;
};

export async function getEstadisticasCoach(coachId: string): Promise<EstadisticasCoach> {
  const supabase = await createClient();

  const { data: cursos } = await supabase
    .from("cursos")
    .select("id, publicado")
    .eq("coach_id", coachId);

  const cursoIds = (cursos ?? []).map((c) => c.id);

  const [lecciones, inscripciones] = await Promise.all([
    cursoIds.length
      ? supabase.from("lecciones").select("id", { count: "exact", head: true }).in("curso_id", cursoIds)
      : { count: 0 },
    cursoIds.length
      ? supabase.from("inscripciones").select("usuario_id", { count: "exact", head: true }).in("curso_id", cursoIds)
      : { count: 0 },
  ]);

  return {
    totalCursos: cursos?.length ?? 0,
    cursosPublicados: (cursos ?? []).filter((c) => c.publicado).length,
    totalLecciones: lecciones.count ?? 0,
    totalEstudiantes: inscripciones.count ?? 0,
  };
}

export type CursoCoach = {
  id: string;
  titulo: string;
  precio: number;
  publicado: boolean;
  categoria: string;
  creado_en: string;
  totalLecciones: number;
  totalEstudiantes: number;
};

export async function getCursosDelCoach(coachId: string): Promise<CursoCoach[]> {
  const supabase = await createClient();

  const { data: cursos, error } = await supabase
    .from("cursos")
    .select("id, titulo, precio, publicado, categoria, creado_en")
    .eq("coach_id", coachId)
    .order("creado_en", { ascending: false });

  if (error) throw new Error(error.message);
  if (!cursos || cursos.length === 0) return [];

  const cursoIds = cursos.map((c) => c.id);

  const [lecciones, inscripciones] = await Promise.all([
    supabase.from("lecciones").select("id, curso_id").in("curso_id", cursoIds),
    supabase.from("inscripciones").select("curso_id, usuario_id").in("curso_id", cursoIds),
  ]);

  const lecConteo = new Map<string, number>();
  for (const l of lecciones.data ?? []) {
    lecConteo.set(l.curso_id, (lecConteo.get(l.curso_id) ?? 0) + 1);
  }
  const estConteo = new Map<string, number>();
  for (const i of inscripciones.data ?? []) {
    estConteo.set(i.curso_id, (estConteo.get(i.curso_id) ?? 0) + 1);
  }

  return cursos.map((c) => ({
    ...c,
    totalLecciones: lecConteo.get(c.id) ?? 0,
    totalEstudiantes: estConteo.get(c.id) ?? 0,
  }));
}

export type EstudianteCoach = {
  usuario_id: string;
  email: string;
  cursoTitulo: string;
  cursoId: string;
  inscrito_en: string;
};

export async function getEstudiantesDelCoach(coachId: string): Promise<EstudianteCoach[]> {
  const supabase = await createClient();

  const { data: cursos } = await supabase
    .from("cursos")
    .select("id, titulo")
    .eq("coach_id", coachId);

  if (!cursos || cursos.length === 0) return [];

  const cursoIds = cursos.map((c) => c.id);
  const cursoMap = new Map(cursos.map((c) => [c.id, c.titulo]));

  const { data: inscripciones } = await supabase
    .from("inscripciones")
    .select("usuario_id, curso_id, creado_en")
    .in("curso_id", cursoIds)
    .order("creado_en", { ascending: false });

  if (!inscripciones || inscripciones.length === 0) return [];

  const usuarioIds = [...new Set(inscripciones.map((i) => i.usuario_id))];
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("id, email")
    .in("id", usuarioIds);

  const emailMap = new Map((usuarios ?? []).map((u) => [u.id, u.email]));

  return inscripciones.map((i) => ({
    usuario_id: i.usuario_id,
    email: emailMap.get(i.usuario_id) ?? "—",
    cursoTitulo: cursoMap.get(i.curso_id) ?? "—",
    cursoId: i.curso_id,
    inscrito_en: i.creado_en,
  }));
}
