"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type PagoResult = { ok: false; error: string } | { ok: true };

export async function procesarPagoCurso(
  _prev: PagoResult | null,
  formData: FormData
): Promise<PagoResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Por favor inicia sesión." };

  const cursoId = String(formData.get("curso_id") ?? "");
  const banco = String(formData.get("banco") ?? "");
  const tipoPersona = String(formData.get("tipo_persona") ?? "");
  const tipoDoc = String(formData.get("tipo_doc") ?? "");
  const numDoc = String(formData.get("num_doc") ?? "");
  const emailPago = String(formData.get("email_pago") ?? "");

  if (!cursoId || !banco || !tipoPersona || !tipoDoc || !numDoc || !emailPago) {
    return { ok: false, error: "Completa todos los campos del formulario." };
  }

  // Verificar que el curso existe y obtener precio
  const { data: curso, error: cursoError } = await supabase
    .from("cursos")
    .select("id, titulo, precio")
    .eq("id", cursoId)
    .single();

  if (cursoError || !curso) {
    return { ok: false, error: "Curso no encontrado." };
  }

  // Verificar que no tenga ya inscripción
  const { data: yaInscrito } = await supabase
    .from("inscripciones")
    .select("id")
    .eq("usuario_id", user.id)
    .eq("curso_id", cursoId)
    .maybeSingle();

  if (yaInscrito) {
    redirect(`/cursos/${cursoId}`);
  }

  // Registrar inscripción (simulación PSE aprobado)
  const { error: inscErr } = await supabase.from("inscripciones").insert({
    usuario_id: user.id,
    curso_id: cursoId,
    origen: "compra_individual",
  });

  if (inscErr) {
    return { ok: false, error: "No se pudo procesar el pago. Intenta de nuevo." };
  }

  return { ok: true };
}

export async function procesarPagoMembresia(
  _prev: PagoResult | null,
  formData: FormData
): Promise<PagoResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Sesión expirada. Por favor inicia sesión." };

  const banco = String(formData.get("banco") ?? "");
  const tipoPersona = String(formData.get("tipo_persona") ?? "");
  const tipoDoc = String(formData.get("tipo_doc") ?? "");
  const numDoc = String(formData.get("num_doc") ?? "");
  const emailPago = String(formData.get("email_pago") ?? "");

  if (!banco || !tipoPersona || !tipoDoc || !numDoc || !emailPago) {
    return { ok: false, error: "Completa todos los campos del formulario." };
  }

  // Calcular periodo_fin: 30 días desde ahora
  const periodoFin = new Date();
  periodoFin.setDate(periodoFin.getDate() + 30);

  // Upsert membresía activa
  const { error: membErr } = await supabase
    .from("membresia")
    .upsert(
      {
        usuario_id: user.id,
        estado: "activa",
        periodo_fin: periodoFin.toISOString(),
      },
      { onConflict: "usuario_id" }
    );

  if (membErr) {
    return { ok: false, error: "No se pudo procesar el pago. Intenta de nuevo." };
  }

  return { ok: true };
}
