import { describe, it, expect } from "vitest";
import { leerFechas } from "./actions";

describe("leerFechas", () => {
  it("zippea los arrays paralelos de fechaInicio/fechaFin/ubicacion por índice", () => {
    const formData = new FormData();
    formData.append("fechaInicio", "2026-01-30");
    formData.append("fechaFin", "2026-01-31");
    formData.append("ubicacion", "Bogotá, Colombia");
    formData.append("fechaInicio", "2026-03-13");
    formData.append("fechaFin", "2026-03-14");
    formData.append("ubicacion", "Bogotá, Colombia");

    expect(leerFechas(formData)).toEqual([
      { fechaInicio: "2026-01-30", fechaFin: "2026-01-31", ubicacion: "Bogotá, Colombia" },
      { fechaInicio: "2026-03-13", fechaFin: "2026-03-14", ubicacion: "Bogotá, Colombia" },
    ]);
  });

  it("descarta filas incompletas (ej. una fila vacía que quedó sin llenar)", () => {
    const formData = new FormData();
    formData.append("fechaInicio", "2026-01-30");
    formData.append("fechaFin", "2026-01-31");
    formData.append("ubicacion", "Bogotá, Colombia");
    formData.append("fechaInicio", "");
    formData.append("fechaFin", "");
    formData.append("ubicacion", "");

    expect(leerFechas(formData)).toEqual([
      { fechaInicio: "2026-01-30", fechaFin: "2026-01-31", ubicacion: "Bogotá, Colombia" },
    ]);
  });

  it("retorna un array vacío si no hay ninguna fecha", () => {
    const formData = new FormData();
    expect(leerFechas(formData)).toEqual([]);
  });
});
