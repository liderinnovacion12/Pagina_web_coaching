"use server";

import { revalidatePath } from "next/cache";
import {
  crearClase,
  actualizarClase,
  eliminarClase,
  type ClaseCalendarioInput,
  type ModalidadClase,
  type RecurrenciaClase,
} from "@/lib/db/calendario";

export type ClaseFormState = { error: string | null };

function leerInput(formData: FormData): ClaseCalendarioInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    fechaAncla: String(formData.get("fechaAncla") ?? ""),
    horaInicio: String(formData.get("horaInicio") ?? ""),
    horaFin: String(formData.get("horaFin") ?? ""),
    dirigidoPor: String(formData.get("dirigidoPor") ?? "") || null,
    modalidad: String(formData.get("modalidad") ?? "online") as ModalidadClase,
    enlaceSesion: String(formData.get("enlaceSesion") ?? "") || null,
    enlacePreguntas: String(formData.get("enlacePreguntas") ?? "") || null,
    imagenUrl: String(formData.get("imagenUrl") ?? "") || null,
    recurrencia: String(formData.get("recurrencia") ?? "semanal") as RecurrenciaClase,
    activo: formData.get("activo") === "on",
  };
}

export async function crearClaseAction(
  _prevState: ClaseFormState,
  formData: FormData
): Promise<ClaseFormState> {
  const input = leerInput(formData);

  if (!input.nombre || !input.fechaAncla || !input.horaInicio || !input.horaFin) {
    return { error: "Completa nombre, fecha ancla, hora de inicio y hora de fin." };
  }

  try {
    await crearClase(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear la clase." };
  }

  revalidatePath("/admin/calendario");
  return { error: null };
}

export async function actualizarClaseAction(
  id: string,
  _prevState: ClaseFormState,
  formData: FormData
): Promise<ClaseFormState> {
  const input = leerInput(formData);

  try {
    await actualizarClase(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar la clase." };
  }

  revalidatePath("/admin/calendario");
  return { error: null };
}

export async function eliminarClaseAction(id: string): Promise<void> {
  await eliminarClase(id);
  revalidatePath("/admin/calendario");
}
