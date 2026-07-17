import type { FechaEventoInput } from "@/lib/db/eventos.types";

export function leerFechas(formData: FormData): FechaEventoInput[] {
  const inicios = formData.getAll("fechaInicio").map(String);
  const fines = formData.getAll("fechaFin").map(String);
  const ubicaciones = formData.getAll("ubicacion").map(String);

  return inicios
    .map((fechaInicio, indice) => ({
      fechaInicio,
      fechaFin: fines[indice] ?? "",
      ubicacion: ubicaciones[indice] ?? "",
    }))
    .filter((fecha) => fecha.fechaInicio !== "" && fecha.fechaFin !== "" && fecha.ubicacion !== "");
}
