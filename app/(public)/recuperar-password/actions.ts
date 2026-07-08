"use server";

import { createClient } from "@/lib/supabase/server";

export type RecuperarPasswordState = { enviado: boolean; error: string | null };

export async function solicitarRecuperacion(
  _prevState: RecuperarPasswordState,
  formData: FormData
): Promise<RecuperarPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { enviado: false, error: "Ingresa un correo electrónico válido." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/actualizar-password`,
  });

  // Siempre se responde con éxito genérico, exista o no la cuenta,
  // para no revelar qué correos están registrados.
  return { enviado: true, error: null };
}
