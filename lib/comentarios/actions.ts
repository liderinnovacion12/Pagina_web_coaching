"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function guardarComentarioAction(
  leccionId: string,
  cursoId: string,
  comentario: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado." };

  const texto = comentario.trim();
  if (!texto) return { ok: false, error: "El comentario no puede estar vacío." };

  const { error } = await supabase.from("comentarios_lecciones").upsert(
    { usuario_id: user.id, leccion_id: leccionId, comentario: texto, actualizado_en: new Date().toISOString() },
    { onConflict: "usuario_id,leccion_id" }
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/cursos/${cursoId}/lecciones/${leccionId}`);
  return { ok: true };
}

export async function getComentarioDelUsuario(
  leccionId: string,
  usuarioId: string
): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("comentarios_lecciones")
    .select("comentario")
    .eq("leccion_id", leccionId)
    .eq("usuario_id", usuarioId)
    .maybeSingle();
  return data?.comentario ?? null;
}
