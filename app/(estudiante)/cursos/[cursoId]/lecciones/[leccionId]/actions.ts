"use server";

import { getSesionUsuario } from "@/lib/auth/session";
import { marcarProgreso } from "@/lib/db/lecciones";

export async function marcarProgresoAction(
  leccionId: string,
  cambios: { segundoActual?: number; completado?: boolean }
): Promise<{ error: string | null }> {
  const sesion = await getSesionUsuario();

  if (!sesion) {
    return { error: "No autenticado." };
  }

  try {
    await marcarProgreso(sesion.id, leccionId, cambios);
    return { error: null };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Error desconocido." };
  }
}
