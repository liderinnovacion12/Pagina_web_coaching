import { createClient } from "@/lib/supabase/server";
import type { ContactoSoporte, ContactoSoporteInput } from "@/lib/db/contactos-soporte.types";

type FilaContacto = {
  id: string;
  nombre: string;
  cargo: string;
  descripcion_cargo: string;
  telefono: string;
  correo: string;
  foto_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS =
  "id, nombre, cargo, descripcion_cargo, telefono, correo, foto_url, orden, activo, creado_en";

function mapearContacto(fila: FilaContacto): ContactoSoporte {
  return {
    id: fila.id,
    nombre: fila.nombre,
    cargo: fila.cargo,
    descripcionCargo: fila.descripcion_cargo,
    telefono: fila.telefono,
    correo: fila.correo,
    fotoUrl: fila.foto_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarContacto(input: ContactoSoporteInput) {
  return {
    nombre: input.nombre.trim(),
    cargo: input.cargo.trim(),
    descripcion_cargo: input.descripcionCargo.trim(),
    telefono: input.telefono.trim(),
    correo: input.correo.trim(),
    foto_url: input.fotoUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getContactosSoporte(): Promise<ContactoSoporte[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("contactos_soporte")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los contactos de soporte: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearContacto(fila as unknown as FilaContacto));
}

export async function getTodosLosContactosSoporte(): Promise<ContactoSoporte[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from("contactos_soporte").select(COLUMNAS).order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los contactos de soporte: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearContacto(fila as unknown as FilaContacto));
}

export async function crearContactoSoporte(input: ContactoSoporteInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("contactos_soporte").insert(serializarContacto(input));

  if (error) {
    throw new Error(`No se pudo crear el contacto: ${error.message}`);
  }
}

export async function actualizarContactoSoporte(
  id: string,
  input: ContactoSoporteInput
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("contactos_soporte")
    .update(serializarContacto(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el contacto: ${error.message}`);
  }
}

export async function eliminarContactoSoporte(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("contactos_soporte").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el contacto: ${error.message}`);
  }
}
