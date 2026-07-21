"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export async function crearLeccionCoachAction(
  cursoId: string,
  _prev: { error: string | null },
  formData: FormData
) {
  await requireRol(["coach", "admin"]);
  const supabase = await createClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const tipo_contenido = String(formData.get("tipo_contenido") ?? "video");
  const mux_asset_id = String(formData.get("mux_asset_id") ?? "").trim() || null;
  const orden = parseInt(String(formData.get("orden") ?? "0"));

  if (!titulo) return { error: "El título es obligatorio." };

  const { error } = await supabase.from("lecciones").insert({
    curso_id: cursoId,
    titulo,
    tipo_contenido,
    mux_asset_id,
    orden: isNaN(orden) ? 0 : orden,
  });

  if (error) return { error: error.message };

  revalidatePath(`/coach/cursos/${cursoId}/lecciones`);
  return { error: null };
}

export async function eliminarLeccionCoachAction(cursoId: string, leccionId: string) {
  await requireRol(["coach", "admin"]);
  const supabase = await createClient();
  await supabase.from("lecciones").delete().eq("id", leccionId);
  revalidatePath(`/coach/cursos/${cursoId}/lecciones`);
}
