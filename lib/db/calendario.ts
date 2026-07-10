import { createClient } from "@/lib/supabase/server";
import type { Recurrencia } from "@/lib/calendario/recurrencia";

export type ModalidadClase = "online" | "presencial" | "hibrida";
export type RecurrenciaClase = Recurrencia;

export type ClaseCalendario = {
  id: string;
  nombre: string;
  fechaAncla: string;
  horaInicio: string;
  horaFin: string;
  dirigidoPor: string | null;
  modalidad: ModalidadClase;
  enlaceSesion: string | null;
  enlacePreguntas: string | null;
  imagenUrl: string | null;
  recurrencia: RecurrenciaClase;
  activo: boolean;
  creadoEn?: string;
};

export type ClaseCalendarioInput = {
  nombre: string;
  fechaAncla: string;
  horaInicio: string;
  horaFin: string;
  dirigidoPor: string | null;
  modalidad: ModalidadClase;
  enlaceSesion: string | null;
  enlacePreguntas: string | null;
  imagenUrl: string | null;
  recurrencia: RecurrenciaClase;
  activo: boolean;
};

type FilaClaseCalendario = {
  id: string;
  nombre: string;
  fecha_ancla: string;
  hora_inicio: string;
  hora_fin: string;
  dirigido_por: string | null;
  modalidad: ModalidadClase;
  enlace_sesion: string | null;
  enlace_preguntas: string | null;
  imagen_url: string | null;
  recurrencia: RecurrenciaClase;
  activo: boolean;
  creado_en: string;
};

function mapearClase(fila: FilaClaseCalendario): ClaseCalendario {
  return {
    id: fila.id,
    nombre: fila.nombre,
    fechaAncla: fila.fecha_ancla,
    horaInicio: fila.hora_inicio,
    horaFin: fila.hora_fin,
    dirigidoPor: fila.dirigido_por,
    modalidad: fila.modalidad,
    enlaceSesion: fila.enlace_sesion,
    enlacePreguntas: fila.enlace_preguntas,
    imagenUrl: fila.imagen_url,
    recurrencia: fila.recurrencia,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarClase(input: ClaseCalendarioInput) {
  return {
    nombre: input.nombre.trim(),
    fecha_ancla: input.fechaAncla,
    hora_inicio: input.horaInicio,
    hora_fin: input.horaFin,
    dirigido_por: input.dirigidoPor?.trim() || null,
    modalidad: input.modalidad,
    enlace_sesion: input.enlaceSesion?.trim() || null,
    enlace_preguntas: input.enlacePreguntas?.trim() || null,
    imagen_url: input.imagenUrl?.trim() || null,
    recurrencia: input.recurrencia,
    activo: input.activo,
  };
}

export async function getClasesCalendario(): Promise<ClaseCalendario[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clases_calendario")
    .select(
      "id, nombre, fecha_ancla, hora_inicio, hora_fin, dirigido_por, modalidad, enlace_sesion, enlace_preguntas, imagen_url, recurrencia, activo, creado_en"
    )
    .eq("activo", true)
    .order("fecha_ancla");

  if (error) {
    throw new Error(`No se pudieron cargar las clases: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearClase(fila as FilaClaseCalendario));
}

export async function getTodasLasClases(): Promise<ClaseCalendario[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("clases_calendario")
    .select(
      "id, nombre, fecha_ancla, hora_inicio, hora_fin, dirigido_por, modalidad, enlace_sesion, enlace_preguntas, imagen_url, recurrencia, activo, creado_en"
    )
    .order("fecha_ancla");

  if (error) {
    throw new Error(`No se pudieron cargar las clases: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearClase(fila as FilaClaseCalendario));
}

export async function crearClase(input: ClaseCalendarioInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clases_calendario").insert(serializarClase(input));

  if (error) {
    throw new Error(`No se pudo crear la clase: ${error.message}`);
  }
}

export async function actualizarClase(id: string, input: ClaseCalendarioInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("clases_calendario")
    .update(serializarClase(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar la clase: ${error.message}`);
  }
}

export async function eliminarClase(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("clases_calendario").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar la clase: ${error.message}`);
  }
}
