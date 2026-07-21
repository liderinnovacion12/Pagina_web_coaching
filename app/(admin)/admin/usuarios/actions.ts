"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireRol } from "@/lib/auth/session";

export async function cambiarRolAction(usuarioId: string, nuevoRol: string) {
  const sesion = await requireRol("admin");
  if (sesion.id === usuarioId) throw new Error("No puedes cambiar tu propio rol.");

  const supabase = await createClient();
  const { error } = await supabase
    .from("usuarios")
    .update({ rol: nuevoRol })
    .eq("id", usuarioId);

  if (error) throw new Error(error.message);
  revalidatePath("/admin/usuarios");
}
