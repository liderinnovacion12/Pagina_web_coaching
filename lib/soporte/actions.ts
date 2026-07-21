"use server";

import { createClient } from "@/lib/supabase/server";

export type TicketInput = {
  nombre: string;
  email: string;
  telefono?: string;
  categoria: string;
  asunto: string;
  descripcion: string;
};

export async function crearTicketAction(data: TicketInput) {
  const supabase = await createClient();

  // Intentar obtener sesión (puede ser null si es visitante)
  const { data: { user } } = await supabase.auth.getUser();

  const { error } = await supabase.from("tickets_soporte").insert({
    nombre: data.nombre.trim(),
    email: data.email.trim().toLowerCase(),
    telefono: data.telefono?.trim() || null,
    categoria: data.categoria,
    asunto: data.asunto.trim(),
    descripcion: data.descripcion.trim(),
    usuario_id: user?.id ?? null,
  });

  if (error) {
    console.error("[ticket]", error.message);
    return { ok: false, error: "No se pudo enviar el ticket. Inténtalo de nuevo." };
  }

  return { ok: true };
}
