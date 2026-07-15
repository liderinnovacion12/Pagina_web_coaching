import { createClient } from "@/lib/supabase/server";
import type { Aliado, AliadoInput } from "@/lib/db/aliados.types";

type FilaAliado = {
  id: string;
  servicio: string;
  descripcion: string;
  contacto_nombre: string;
  contacto_telefono: string;
  contacto_correo: string;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS =
  "id, servicio, descripcion, contacto_nombre, contacto_telefono, contacto_correo, imagen_url, orden, activo, creado_en";

function mapearAliado(fila: FilaAliado): Aliado {
  return {
    id: fila.id,
    servicio: fila.servicio,
    descripcion: fila.descripcion,
    contactoNombre: fila.contacto_nombre,
    contactoTelefono: fila.contacto_telefono,
    contactoCorreo: fila.contacto_correo,
    imagenUrl: fila.imagen_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarAliado(input: AliadoInput) {
  return {
    servicio: input.servicio.trim(),
    descripcion: input.descripcion.trim(),
    contacto_nombre: input.contactoNombre.trim(),
    contacto_telefono: input.contactoTelefono.trim(),
    contacto_correo: input.contactoCorreo.trim(),
    imagen_url: input.imagenUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getAliados(): Promise<Aliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("aliados")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los aliados: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearAliado(fila as unknown as FilaAliado));
}

export async function getTodosLosAliados(): Promise<Aliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("aliados")
    .select(COLUMNAS)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los aliados: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearAliado(fila as unknown as FilaAliado));
}

export async function crearAliado(input: AliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("aliados").insert(serializarAliado(input));

  if (error) {
    throw new Error(`No se pudo crear el aliado: ${error.message}`);
  }
}

export async function actualizarAliado(id: string, input: AliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("aliados")
    .update(serializarAliado(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el aliado: ${error.message}`);
  }
}

export async function eliminarAliado(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("aliados").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el aliado: ${error.message}`);
  }
}
