"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function guardarReseñaAction(
  leccionId: string,
  cursoId: string,
  estrellas: number,
  comentario: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "No autenticado" };

  const { error } = await supabase
    .from("reseñas_lecciones")
    .upsert(
      {
        usuario_id: user.id,
        leccion_id: leccionId,
        estrellas,
        comentario: comentario.trim() || null,
        actualizado_en: new Date().toISOString(),
      },
      { onConflict: "usuario_id,leccion_id" }
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/cursos/${cursoId}/lecciones/${leccionId}`);
  return { ok: true };
}
