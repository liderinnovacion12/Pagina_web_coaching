import { createClient } from "@/lib/supabase/server";

export type EstadisticasAdmin = {
  totalUsuarios: number;
  totalCursos: number;
  cursosPublicados: number;
  totalInscripciones: number;
};

export async function getEstadisticasAdmin(): Promise<EstadisticasAdmin> {
  const supabase = await createClient();

  const [usuarios, cursos, inscripciones] = await Promise.all([
    supabase.from("usuarios").select("id", { count: "exact", head: true }),
    supabase.from("cursos").select("id, publicado", { count: "exact" }),
    supabase.from("inscripciones").select("id", { count: "exact", head: true }),
  ]);

  const cursosData = cursos.data ?? [];
  return {
    totalUsuarios: usuarios.count ?? 0,
    totalCursos: cursos.count ?? 0,
    cursosPublicados: cursosData.filter((c) => c.publicado).length,
    totalInscripciones: inscripciones.count ?? 0,
  };
}

export type CursoAdmin = {
  id: string;
  titulo: string;
  precio: number;
  publicado: boolean;
  categoria: string;
  creado_en: string;
  totalLecciones: number;
};

export async function getCursosAdmin(): Promise<CursoAdmin[]> {
  const supabase = await createClient();
  const { data: cursos, error } = await supabase
    .from("cursos")
    .select("id, titulo, precio, publicado, categoria, creado_en")
    .order("creado_en", { ascending: false });

  if (error) throw new Error(error.message);

  const cursoIds = (cursos ?? []).map((c) => c.id);
  if (cursoIds.length === 0) return [];

  const { data: lecciones } = await supabase
    .from("lecciones")
    .select("id, curso_id")
    .in("curso_id", cursoIds);

  const conteo = new Map<string, number>();
  for (const l of lecciones ?? []) {
    conteo.set(l.curso_id, (conteo.get(l.curso_id) ?? 0) + 1);
  }

  return (cursos ?? []).map((c) => ({
    ...c,
    totalLecciones: conteo.get(c.id) ?? 0,
  }));
}

export type LeccionAdmin = {
  id: string;
  titulo: string;
  tipo_contenido: string;
  mux_asset_id: string | null;
  orden: number;
  precio: number;
};

export async function getLeccionesDeUnCurso(cursoId: string): Promise<LeccionAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lecciones")
    .select("id, titulo, tipo_contenido, mux_asset_id, orden, precio")
    .eq("curso_id", cursoId)
    .order("orden");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export type UsuarioAdmin = {
  id: string;
  email: string;
  rol: string;
  registrado_en: string;
};

export async function getUsuariosAdmin(): Promise<UsuarioAdmin[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("usuarios")
    .select("id, email, rol, registrado_en")
    .order("registrado_en", { ascending: false });
  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getCursoAdminById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cursos")
    .select("id, titulo, precio, publicado, categoria")
    .eq("id", id)
    .single();
  if (error) throw new Error(error.message);
  return data;
}
