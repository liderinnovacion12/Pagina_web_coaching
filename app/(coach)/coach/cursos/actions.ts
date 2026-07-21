"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export async function crearCursoCoachAction(_prev: { error: string | null }, formData: FormData) {
  const sesion = await requireRol(["coach", "admin"]);
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

  revalidatePath("/coach/cursos");
  revalidatePath("/");
  return { error: null };
}

export async function togglePublicadoCoachAction(id: string, publicado: boolean, coachId: string) {
  await requireRol(["coach", "admin"]);
  const supabase = await createClient();
  await supabase.from("cursos").update({ publicado }).eq("id", id).eq("coach_id", coachId);
  revalidatePath("/coach/cursos");
  revalidatePath("/");
}

export async function eliminarCursoCoachAction(id: string, coachId: string) {
  await requireRol(["coach", "admin"]);
  const supabase = await createClient();
  await supabase.from("cursos").delete().eq("id", id).eq("coach_id", coachId);
  revalidatePath("/coach/cursos");
  revalidatePath("/");
}
