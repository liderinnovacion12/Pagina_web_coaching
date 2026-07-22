"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export async function crearLeccionAction(
  cursoId: string,
  _prev: { error: string | null },
  formData: FormData
) {
  await requireRol("admin");
  const supabase = await createClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const tipo_contenido = String(formData.get("tipo_contenido") ?? "video");
  const mux_asset_id = String(formData.get("mux_asset_id") ?? "").trim() || null;
  const orden = parseInt(String(formData.get("orden") ?? "0"));

  if (!titulo) return { error: "El título es obligatorio." };
  if (!descripcion) return { error: "La descripción es obligatoria." };

  const { error } = await supabase.from("lecciones").insert({
    curso_id: cursoId,
    titulo,
    descripcion,
    tipo_contenido,
    mux_asset_id,
    orden: isNaN(orden) ? 0 : orden,
  });

  if (error) return { error: error.message };

  revalidatePath(`/admin/cursos/${cursoId}/lecciones`);
  return { error: null };
}

export async function eliminarLeccionAction(cursoId: string, leccionId: string) {
  await requireRol("admin");
  const supabase = await createClient();
  await supabase.from("lecciones").delete().eq("id", leccionId);
  revalidatePath(`/admin/cursos/${cursoId}/lecciones`);
}

export async function actualizarOrdenLeccionAction(leccionId: string, orden: number, cursoId: string) {
  await requireRol("admin");
  const supabase = await createClient();
  await supabase.from("lecciones").update({ orden }).eq("id", leccionId);
  revalidatePath(`/admin/cursos/${cursoId}/lecciones`);
}

export async function actualizarPrecioLeccionAction(
  cursoId: string,
  leccionId: string,
  _prev: { error: string | null },
  formData: FormData
): Promise<{ error: string | null }> {
  await requireRol("admin");
  const raw = String(formData.get("precio") ?? "").trim();
  const precio = parseFloat(raw);
  if (isNaN(precio) || precio < 0) return { error: "Precio inválido." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("lecciones")
    .update({ precio })
    .eq("id", leccionId);

  if (error) return { error: error.message };
  revalidatePath(`/admin/cursos/${cursoId}/lecciones`);
  return { error: null };
}
