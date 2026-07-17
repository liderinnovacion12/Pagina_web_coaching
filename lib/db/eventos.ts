import { createClient } from "@/lib/supabase/server";
import type { Evento, EventoInput, FechaEvento } from "@/lib/db/eventos.types";

type FilaEvento = {
  id: string;
  categoria: Evento["categoria"];
  titulo: string;
  subtitulo: string;
  youtube_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

type FilaFecha = {
  id: string;
  evento_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  ubicacion: string;
};

const COLUMNAS_EVENTO = "id, categoria, titulo, subtitulo, youtube_url, orden, activo, creado_en";
const COLUMNAS_FECHA = "id, evento_id, fecha_inicio, fecha_fin, ubicacion";

function mapearFecha(fila: FilaFecha): FechaEvento {
  return {
    id: fila.id,
    fechaInicio: fila.fecha_inicio,
    fechaFin: fila.fecha_fin,
    ubicacion: fila.ubicacion,
  };
}

function mapearEvento(fila: FilaEvento, todasLasFechas: FilaFecha[]): Evento {
  const fechas = todasLasFechas
    .filter((fecha) => fecha.evento_id === fila.id)
    .sort((a, b) => a.fecha_inicio.localeCompare(b.fecha_inicio))
    .map(mapearFecha);

  return {
    id: fila.id,
    categoria: fila.categoria,
    titulo: fila.titulo,
    subtitulo: fila.subtitulo,
    youtubeUrl: fila.youtube_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
    fechas,
  };
}

async function getEventosFechas(supabase: Awaited<ReturnType<typeof createClient>>, eventos: FilaEvento[]): Promise<Evento[]> {
  const idsEventos = eventos.map((evento) => evento.id);

  if (idsEventos.length === 0) {
    return [];
  }

  const { data, error } = await supabase.from("eventos_fechas").select(COLUMNAS_FECHA).in("evento_id", idsEventos);

  if (error) {
    throw new Error(`No se pudieron cargar las fechas de los eventos: ${error.message}`);
  }

  const filasFechas = (data ?? []) as unknown as FilaFecha[];
  return eventos.map((fila) => mapearEvento(fila, filasFechas));
}

export async function getEventos(): Promise<Evento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos")
    .select(COLUMNAS_EVENTO)
    .eq("activo", true)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los eventos: ${error.message}`);
  }

  return getEventosFechas(supabase, (data ?? []) as unknown as FilaEvento[]);
}

export async function getTodosLosEventos(): Promise<Evento[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos")
    .select(COLUMNAS_EVENTO)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los eventos: ${error.message}`);
  }

  return getEventosFechas(supabase, (data ?? []) as unknown as FilaEvento[]);
}

function serializarEvento(input: EventoInput) {
  return {
    categoria: input.categoria,
    titulo: input.titulo.trim(),
    subtitulo: input.subtitulo.trim(),
    youtube_url: input.youtubeUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

function serializarFechas(eventoId: string, fechas: EventoInput["fechas"]) {
  return fechas.map((fecha) => ({
    evento_id: eventoId,
    fecha_inicio: fecha.fechaInicio,
    fecha_fin: fecha.fechaFin,
    ubicacion: fecha.ubicacion.trim(),
  }));
}

export async function crearEvento(input: EventoInput): Promise<void> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("eventos")
    .insert(serializarEvento(input))
    .select("id")
    .single();

  if (error) {
    throw new Error(`No se pudo crear el evento: ${error.message}`);
  }

  const eventoId = (data as unknown as { id: string }).id;

  if (input.fechas.length > 0) {
    const { error: errorFechas } = await supabase
      .from("eventos_fechas")
      .insert(serializarFechas(eventoId, input.fechas));

    if (errorFechas) {
      throw new Error(`No se pudieron guardar las fechas del evento: ${errorFechas.message}`);
    }
  }
}

export async function actualizarEvento(id: string, input: EventoInput): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.from("eventos").update(serializarEvento(input)).eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el evento: ${error.message}`);
  }

  const { error: errorBorrar } = await supabase.from("eventos_fechas").delete().eq("evento_id", id);

  if (errorBorrar) {
    throw new Error(`No se pudieron actualizar las fechas del evento: ${errorBorrar.message}`);
  }

  if (input.fechas.length > 0) {
    const { error: errorFechas } = await supabase
      .from("eventos_fechas")
      .insert(serializarFechas(id, input.fechas));

    if (errorFechas) {
      throw new Error(`No se pudieron guardar las fechas del evento: ${errorFechas.message}`);
    }
  }
}

export async function eliminarEvento(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("eventos").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el evento: ${error.message}`);
  }
}
