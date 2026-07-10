// Tipos y constantes puras del calendario, sin dependencias de
// next/headers ni de Supabase. Los componentes cliente deben importar
// ETIQUETA_MODALIDAD desde aquí (no desde lib/db/calendario.ts, que
// arrastra next/headers y rompería el build de componentes "use client").

export type ModalidadClase = "online" | "presencial" | "hibrida";

export const ETIQUETA_MODALIDAD: Record<ModalidadClase, string> = {
  online: "Online",
  presencial: "Presencial",
  hibrida: "Híbrida",
};
