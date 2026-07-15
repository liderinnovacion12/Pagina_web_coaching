import { createClient } from "@/lib/supabase/server";
import type { ProyectoAliado, ProyectoAliadoInput } from "@/lib/db/proyectos-aliados.types";

type FilaProyectoAliado = {
  id: string;
  nombre: string;
  descripcion: string;
  precio_desde: string | null;
  contacto_nombre: string;
  contacto_telefono: string;
  whatsapp_url: string;
  imagen_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS =
  "id, nombre, descripcion, precio_desde, contacto_nombre, contacto_telefono, whatsapp_url, imagen_url, orden, activo, creado_en";

function mapearProyecto(fila: FilaProyectoAliado): ProyectoAliado {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    precioDesde: fila.precio_desde,
    contactoNombre: fila.contacto_nombre,
    contactoTelefono: fila.contacto_telefono,
    whatsappUrl: fila.whatsapp_url,
    imagenUrl: fila.imagen_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarProyecto(input: ProyectoAliadoInput) {
  return {
    nombre: input.nombre.trim(),
    descripcion: input.descripcion.trim(),
    precio_desde: input.precioDesde?.trim() || null,
    contacto_nombre: input.contactoNombre.trim(),
    contacto_telefono: input.contactoTelefono.trim(),
    whatsapp_url: input.whatsappUrl.trim(),
    imagen_url: input.imagenUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getProyectosAliados(): Promise<ProyectoAliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos_aliados")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearProyecto(fila as unknown as FilaProyectoAliado));
}

export async function getTodosLosProyectos(): Promise<ProyectoAliado[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("proyectos_aliados")
    .select(COLUMNAS)
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los proyectos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearProyecto(fila as unknown as FilaProyectoAliado));
}

export async function crearProyecto(input: ProyectoAliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("proyectos_aliados").insert(serializarProyecto(input));

  if (error) {
    throw new Error(`No se pudo crear el proyecto: ${error.message}`);
  }
}

export async function actualizarProyecto(id: string, input: ProyectoAliadoInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("proyectos_aliados")
    .update(serializarProyecto(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el proyecto: ${error.message}`);
  }
}

export async function eliminarProyecto(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("proyectos_aliados").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el proyecto: ${error.message}`);
  }
}
