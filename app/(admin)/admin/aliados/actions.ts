"use server";

import { revalidatePath } from "next/cache";
import { crearAliado, actualizarAliado, eliminarAliado } from "@/lib/db/aliados";
import type { AliadoInput } from "@/lib/db/aliados.types";

export type AliadoFormState = { error: string | null };

function contarLineas(texto: string): number {
  return texto.trim().split("\n").length;
}

function contactosDesalineados(input: AliadoInput): boolean {
  const totalNombres = contarLineas(input.contactoNombre);
  return (
    contarLineas(input.contactoTelefono) !== totalNombres ||
    contarLineas(input.contactoCorreo) !== totalNombres
  );
}

function leerInput(formData: FormData): AliadoInput {
  return {
    servicio: String(formData.get("servicio") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    contactoNombre: String(formData.get("contactoNombre") ?? ""),
    contactoTelefono: String(formData.get("contactoTelefono") ?? ""),
    contactoCorreo: String(formData.get("contactoCorreo") ?? ""),
    imagenUrl: String(formData.get("imagenUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearAliadoAction(
  _prevState: AliadoFormState,
  formData: FormData
): Promise<AliadoFormState> {
  const input = leerInput(formData);

  if (!input.servicio) {
    return { error: "El servicio es obligatorio." };
  }

  if (contactosDesalineados(input)) {
    return {
      error: "El número de líneas debe coincidir entre nombre, teléfono y correo de contacto.",
    };
  }

  try {
    await crearAliado(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el aliado." };
  }

  revalidatePath("/admin/aliados");
  revalidatePath("/aliados");
  return { error: null };
}

export async function actualizarAliadoAction(
  id: string,
  _prevState: AliadoFormState,
  formData: FormData
): Promise<AliadoFormState> {
  const input = leerInput(formData);

  if (contactosDesalineados(input)) {
    return {
      error: "El número de líneas debe coincidir entre nombre, teléfono y correo de contacto.",
    };
  }

  try {
    await actualizarAliado(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el aliado." };
  }

  revalidatePath("/admin/aliados");
  revalidatePath("/aliados");
  return { error: null };
}

export async function eliminarAliadoAction(id: string): Promise<void> {
  await eliminarAliado(id);
  revalidatePath("/admin/aliados");
  revalidatePath("/aliados");
}
