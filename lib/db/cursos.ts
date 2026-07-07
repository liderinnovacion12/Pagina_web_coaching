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
