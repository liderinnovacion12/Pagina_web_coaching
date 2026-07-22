"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export type PlanState = { error: string | null };

export async function crearPlanAction(
  _prev: PlanState,
  formData: FormData
): Promise<PlanState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const duracion_dias = parseInt(String(formData.get("duracion_dias") ?? "30"));
  const destacado = formData.get("destacado") === "on";

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!descripcion) return { error: "La descripción es obligatoria." };
  if (isNaN(precio) || precio <= 0) return { error: "El precio debe ser mayor a 0." };

  const { error } = await supabase.from("planes_membresia").insert({
    nombre,
    descripcion,
    precio,
    duracion_dias: isNaN(duracion_dias) ? 30 : duracion_dias,
    destacado,
    activo: true,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/planes");
  return { error: null };
}

export async function actualizarPlanAction(
  planId: string,
  _prev: PlanState,
  formData: FormData
): Promise<PlanState> {
  await requireRol("admin");
  const supabase = await createClient();

  const nombre = String(formData.get("nombre") ?? "").trim();
  const descripcion = String(formData.get("descripcion") ?? "").trim();
  const precio = parseFloat(String(formData.get("precio") ?? "0"));
  const duracion_dias = parseInt(String(formData.get("duracion_dias") ?? "30"));
  const destacado = formData.get("destacado") === "on";

  if (!nombre) return { error: "El nombre es obligatorio." };
  if (!descripcion) return { error: "La descripción es obligatoria." };
  if (isNaN(precio) || precio <= 0) return { error: "El precio debe ser mayor a 0." };

  const { error } = await supabase
    .from("planes_membresia")
    .update({ nombre, descripcion, precio, duracion_dias, destacado })
    .eq("id", planId);

  if (error) return { error: error.message };
  revalidatePath("/admin/planes");
  return { error: null };
}

export async function togglePlanActivoAction(planId: string, activo: boolean) {
  await requireRol("admin");
  const supabase = await createClient();
  await supabase.from("planes_membresia").update({ activo }).eq("id", planId);
  revalidatePath("/admin/planes");
}

export async function eliminarPlanAction(planId: string) {
  await requireRol("admin");
  const supabase = await createClient();
  await supabase.from("planes_membresia").delete().eq("id", planId);
  revalidatePath("/admin/planes");
}
