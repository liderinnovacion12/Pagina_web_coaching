"use server";

import { revalidatePath } from "next/cache";
import {
  crearGrupo,
  actualizarGrupo,
  eliminarGrupo,
  type GrupoComunidadInput,
  type CategoriaGrupoComunidad,
  type CanalGrupoComunidad,
} from "@/lib/db/grupos-comunidad";

export type GrupoFormState = { error: string | null };

function leerInput(formData: FormData): GrupoComunidadInput {
  return {
    nombre: String(formData.get("nombre") ?? ""),
    categoria: String(formData.get("categoria") ?? "otros") as CategoriaGrupoComunidad,
    detalle: String(formData.get("detalle") ?? "") || null,
    tipoCanal: String(formData.get("tipoCanal") ?? "whatsapp") as CanalGrupoComunidad,
    enlaceUrl: String(formData.get("enlaceUrl") ?? "") || null,
    orden: Number(formData.get("orden") ?? 0),
    activo: formData.get("activo") === "on",
  };
}

export async function crearGrupoAction(
  _prevState: GrupoFormState,
  formData: FormData
): Promise<GrupoFormState> {
  const input = leerInput(formData);

  if (!input.nombre) {
    return { error: "El nombre es obligatorio." };
  }

  try {
    await crearGrupo(input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo crear el grupo." };
  }

  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
  return { error: null };
}

export async function actualizarGrupoAction(
  id: string,
  _prevState: GrupoFormState,
  formData: FormData
): Promise<GrupoFormState> {
  const input = leerInput(formData);

  try {
    await actualizarGrupo(id, input);
  } catch (error) {
    return { error: error instanceof Error ? error.message : "No se pudo actualizar el grupo." };
  }

  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
  return { error: null };
}

export async function eliminarGrupoAction(id: string): Promise<void> {
  await eliminarGrupo(id);
  revalidatePath("/admin/herramientas");
  revalidatePath("/herramientas");
}
