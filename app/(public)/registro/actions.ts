"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { guardarIntereses } from "@/lib/db/intereses";

export type RegistroState = { error: string | null };

const SECTORES_VALIDOS = ["liderazgo", "ventas", "finanzas", "marketing", "tecnologia"];

export async function registrar(
  _prevState: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sectores = formData
    .getAll("intereses")
    .map(String)
    .filter((sector) => SECTORES_VALIDOS.includes(sector));

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { error: "No se pudo completar el registro. Intenta de nuevo." };
  }

  await guardarIntereses(data.user.id, sectores);

  redirect("/pago");
}
