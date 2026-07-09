import { createClient } from "@/lib/supabase/server";

export type FotoGaleria = {
  id: string;
  url: string;
};

export async function getGaleriaEquipo(): Promise<FotoGaleria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("galeria_equipo")
    .select("id, url")
    .order("orden");

  if (error) {
    throw new Error(`No se pudo cargar la galería: ${error.message}`);
  }

  return data ?? [];
}
