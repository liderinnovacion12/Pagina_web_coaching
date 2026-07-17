"use server";

import { revalidatePath } from "next/cache";
import {
  crearContactoSoporte,
  actualizarContactoSoporte,
  eliminarContactoSoporte,
} from "@/lib/db/contactos-soporte";
import type { ContactoSoporteInput } from "@/lib/db/contactos-soporte.types";

export type ContactoSoporteFormState = { error: string | null };

function leerInput(formData: FormData): ContactoSoporteInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    cargo: String(formData.get("cargo") ?? ""),
    descripcionCargo: String(formData.get("descripcionCargo") ?? ""),
    telefono: String(formData.get("telefono") ?? ""),
    correo: String(formData.get("correo") ?? ""),
    fotoUrl: String(formData.get("fotoUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearContactoSoporteAction(
  _prevState: ContactoSoporteFormState,
  formData: FormData
): Promise<ContactoSoporteFormState> {
  const input = leerInput(formData);

  if (!input.nombre) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    await crearContactoSoporte(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el contacto." };
  }

  revalidatePath("/admin/soporte");
  revalidatePath("/soporte");
  return { error: null };
}

export async function actualizarContactoSoporteAction(
  id: string,
  _prevState: ContactoSoporteFormState,
  formData: FormData
): Promise<ContactoSoporteFormState> {
  const input = leerInput(formData);

  try {
    await actualizarContactoSoporte(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el contacto." };
  }

  revalidatePath("/admin/soporte");
  revalidatePath("/soporte");
  return { error: null };
}

export async function eliminarContactoSoporteAction(id: string): Promise<void> {
  await eliminarContactoSoporte(id);
  revalidatePath("/admin/soporte");
  revalidatePath("/soporte");
}
