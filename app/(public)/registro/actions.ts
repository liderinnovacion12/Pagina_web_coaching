"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

  // Crear usuario con email ya confirmado (sin correo de verificación)
  const admin = createAdminClient();
  const { data: adminData, error: adminError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (adminError || !adminData.user) {
    if (adminError?.message?.includes("already registered")) {
      return { error: "Ya existe una cuenta con ese correo." };
    }
    return { error: "No se pudo crear la cuenta. Intenta de nuevo." };
  }

  // Iniciar sesión antes de guardar intereses (RLS requiere sesión activa)
  const supabase = await createClient();
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });

  if (loginError) {
    return { error: "Cuenta creada pero no se pudo iniciar sesión. Inicia sesión manualmente." };
  }

  await guardarIntereses(adminData.user.id, sectores);

  const plan = String(formData.get("plan") ?? "");
  const cursoId = String(formData.get("curso_id") ?? "").trim();

  if (plan === "membresia") redirect("/pago?plan=membresia");
  if (cursoId) redirect(`/pago?tipo=curso&cursoId=${cursoId}`);
  redirect("/clases");
}
