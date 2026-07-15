"use server";

import { revalidatePath } from "next/cache";
import { crearProyecto, actualizarProyecto, eliminarProyecto } from "@/lib/db/proyectos-aliados";
import type { ProyectoAliadoInput } from "@/lib/db/proyectos-aliados.types";

export type ProyectoFormState = { error: string | null };

function leerInput(formData: FormData): ProyectoAliadoInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    descripcion: String(formData.get("descripcion") ?? ""),
    precioDesde: String(formData.get("precioDesde") ?? "") || null,
    contactoNombre: String(formData.get("contactoNombre") ?? ""),
    contactoTelefono: String(formData.get("contactoTelefono") ?? ""),
    whatsappUrl: String(formData.get("whatsappUrl") ?? ""),
    imagenUrl: String(formData.get("imagenUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearProyectoAction(
  _prevState: ProyectoFormState,
  formData: FormData
): Promise<ProyectoFormState> {
  const input = leerInput(formData);

  if (!input.nombre) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    await crearProyecto(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el proyecto." };
  }

  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
  return { error: null };
}

export async function actualizarProyectoAction(
  id: string,
  _prevState: ProyectoFormState,
  formData: FormData
): Promise<ProyectoFormState> {
  const input = leerInput(formData);

  try {
    await actualizarProyecto(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el proyecto." };
  }

  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
  return { error: null };
}

export async function eliminarProyectoAction(id: string): Promise<void> {
  await eliminarProyecto(id);
  revalidatePath("/admin/proyectos-inmobiliarios-aliados");
  revalidatePath("/proyectos-inmobiliarios-aliados");
}
