"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export async function crearCursoAction(_prev: { error: string | null }, formData: FormData) {
  const sesion = await requireRol("admin");
  const supabase = await createClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const categoria = String(formData.get("categoria") ?? "clases");

  if (!titulo) return { error: "El título es obligatorio." };

  const { error } = await supabase.from("cursos").insert({
    titulo,
    precio: isNaN(precio) ? 0 : precio,
    categoria,
    publicado: false,
    coach_id: sesion.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  return { error: null };
}

export async function togglePublicadoAction(id: string, publicado: boolean) {
  await requireRol("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("cursos").update({ publicado }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cursos");
  revalidatePath("/");
}

export async function eliminarCursoAction(id: string) {
  await requireRol("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("cursos").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/cursos");
  revalidatePath("/");
}

export async function actualizarCursoAction(
  id: string,
  _prev: { error: string | null },
  formData: FormData
) {
  await requireRol("admin");
  const supabase = await createClient();

  const titulo = String(formData.get("titulo") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const categoria = String(formData.get("categoria") ?? "clases");

  if (!titulo) return { error: "El título es obligatorio." };

  const { error } = await supabase
    .from("cursos")
    .update({ titulo, precio: isNaN(precio) ? 0 : precio, categoria })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/cursos");
  revalidatePath("/");
  return { error: null };
}
