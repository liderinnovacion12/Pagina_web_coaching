import { createClient } from "@/lib/supabase/server";

export type CategoriaGrupoComunidad =
  | "grupo_principal"
  | "miami"
  | "orlando_centro_florida"
  | "venta_renta"
  | "otros";

export type CanalGrupoComunidad = "whatsapp" | "dropbox";

export const ETIQUETA_CATEGORIA: Record<CategoriaGrupoComunidad, string> = {
  grupo_principal: "Grupo Principal",
  miami: "Miami",
  orlando_centro_florida: "Orlando y Centro de Florida",
  venta_renta: "Venta y Renta",
  otros: "Otros",
};

export type GrupoComunidad = {
  id: string;
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
  creadoEn?: string;
};

export type GrupoComunidadInput = {
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipoCanal: CanalGrupoComunidad;
  enlaceUrl: string | null;
  orden: number;
  activo: boolean;
};

type FilaGrupoComunidad = {
  id: string;
  nombre: string;
  categoria: CategoriaGrupoComunidad;
  detalle: string | null;
  tipo_canal: CanalGrupoComunidad;
  enlace_url: string | null;
  orden: number;
  activo: boolean;
  creado_en: string;
};

const COLUMNAS = "id, nombre, categoria, detalle, tipo_canal, enlace_url, orden, activo, creado_en";

function mapearGrupo(fila: FilaGrupoComunidad): GrupoComunidad {
  return {
    id: fila.id,
    nombre: fila.nombre,
    categoria: fila.categoria,
    detalle: fila.detalle,
    tipoCanal: fila.tipo_canal,
    enlaceUrl: fila.enlace_url,
    orden: fila.orden,
    activo: fila.activo,
    creadoEn: fila.creado_en,
  };
}

function serializarGrupo(input: GrupoComunidadInput) {
  return {
    nombre: input.nombre.trim(),
    categoria: input.categoria,
    detalle: input.detalle?.trim() || null,
    tipo_canal: input.tipoCanal,
    enlace_url: input.enlaceUrl?.trim() || null,
    orden: input.orden,
    activo: input.activo,
  };
}

export async function getGruposComunidad(): Promise<GrupoComunidad[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grupos_comunidad")
    .select(COLUMNAS)
    .eq("activo", true)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los grupos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearGrupo(fila as unknown as FilaGrupoComunidad));
}

export async function getTodosLosGrupos(): Promise<GrupoComunidad[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("grupos_comunidad")
    .select(COLUMNAS)
    .order("categoria")
    .order("orden");

  if (error) {
    throw new Error(`No se pudieron cargar los grupos: ${error.message}`);
  }

  return (data ?? []).map((fila) => mapearGrupo(fila as unknown as FilaGrupoComunidad));
}

export async function crearGrupo(input: GrupoComunidadInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("grupos_comunidad").insert(serializarGrupo(input));

  if (error) {
    throw new Error(`No se pudo crear el grupo: ${error.message}`);
  }
}

export async function actualizarGrupo(id: string, input: GrupoComunidadInput): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("grupos_comunidad")
    .update(serializarGrupo(input))
    .eq("id", id);

  if (error) {
    throw new Error(`No se pudo actualizar el grupo: ${error.message}`);
  }
}

export async function eliminarGrupo(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("grupos_comunidad").delete().eq("id", id);

  if (error) {
    throw new Error(`No se pudo eliminar el grupo: ${error.message}`);
  }
}
