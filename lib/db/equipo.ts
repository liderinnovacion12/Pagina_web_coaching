import { createClient } from "@/lib/supabase/server";

export type MiembroEquipo = {
  id: string;
  nombre: string;
  cargo: string;
  descripcionCargo: string;
  telefono: string;
  correo: string;
  fotoUrl: string | null;
};

export async function getMiembrosEquipo(): Promise<MiembroEquipo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("miembros_equipo")
    .select("id, nombre, cargo, descripcion_cargo, telefono, correo, foto_url")
    .order("orden");

  if (error) {
    throw new Error(`No se pudo cargar el equipo: ${error.message}`);
  }

  return (data ?? []).map((fila) => ({
    id: fila.id,
    nombre: fila.nombre,
    cargo: fila.cargo,
    descripcionCargo: fila.descripcion_cargo,
    telefono: fila.telefono,
    correo: fila.correo,
    fotoUrl: fila.foto_url,
  }));
}
