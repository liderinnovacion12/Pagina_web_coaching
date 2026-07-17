"use server";

import { revalidatePath } from "next/cache";
import { crearEvento, actualizarEvento, eliminarEvento } from "@/lib/db/eventos";
import type { CategoriaEvento, EventoInput } from "@/lib/db/eventos.types";
import { leerFechas } from "./parsear-fechas";

export type EventoFormState = { error: string | null };

function leerInput(formData: FormData): EventoInput {
  return {
    categoria: String(formData.get("categoria")) as CategoriaEvento,
    titulo: String(formData.get("titulo") ?? ""),
    subtitulo: String(formData.get("subtitulo") ?? ""),
    youtubeUrl: String(formData.get("youtubeUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
    fechas: leerFechas(formData),
  };
}

export async function crearEventoAction(
  _prevState: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  const input = leerInput(formData);

  if (!input.titulo) {
    return { error: "El título es obligatorio." };
  }

  if (input.fechas.length === 0) {
    return { error: "Agrega al menos una fecha." };
  }

  try {
    await crearEvento(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el evento." };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { error: null };
}

export async function actualizarEventoAction(
  id: string,
  _prevState: EventoFormState,
  formData: FormData
): Promise<EventoFormState> {
  const input = leerInput(formData);

  if (input.fechas.length === 0) {
    return { error: "Agrega al menos una fecha." };
  }

  try {
    await actualizarEvento(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el evento." };
  }

  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
  return { error: null };
}

export async function eliminarEventoAction(id: string): Promise<void> {
  await eliminarEvento(id);
  revalidatePath("/admin/eventos");
  revalidatePath("/eventos");
}
