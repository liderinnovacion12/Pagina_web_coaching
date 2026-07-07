import { createClient } from "@/lib/supabase/server";

export async function guardarIntereses(usuarioId: string, sectores: string[]) {
  if (sectores.length === 0) return;

  const supabase = await createClient();
  const filas = sectores.map((sector) => ({ usuario_id: usuarioId, sector }));

  const { error } = await supabase.from("usuario_intereses").insert(filas);

  if (error) {
    throw new Error(`No se pudieron guardar los intereses: ${error.message}`);
  }
}
