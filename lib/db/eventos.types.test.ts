import { describe, it, expect } from "vitest";
import { calcularEstadoFecha, extraerIdVideoYoutube, formatearRangoFecha, hoyIso } from "./eventos.types";

describe("calcularEstadoFecha", () => {
  it("retorna 'proximo' cuando hoy es antes de la fecha de inicio", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-02", "2026-07-31")).toBe("proximo");
  });

  it("retorna 'en_ejecucion' cuando hoy es exactamente la fecha de inicio", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-02", "2026-08-01")).toBe("en_ejecucion");
  });

  it("retorna 'en_ejecucion' cuando hoy está entre inicio y fin", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-05", "2026-08-03")).toBe("en_ejecucion");
  });

  it("retorna 'en_ejecucion' cuando hoy es exactamente la fecha de fin", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-02", "2026-08-02")).toBe("en_ejecucion");
  });

  it("retorna 'realizado' cuando hoy es después de la fecha de fin", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-02", "2026-08-03")).toBe("realizado");
  });

  it("retorna 'en_ejecucion' para un evento de un solo día, en ese día", () => {
    expect(calcularEstadoFecha("2026-08-01", "2026-08-01", "2026-08-01")).toBe("en_ejecucion");
  });
});

describe("extraerIdVideoYoutube", () => {
  it("extrae el id de una URL normal de YouTube", () => {
    expect(extraerIdVideoYoutube("https://www.youtube.com/watch?v=jV468IGkYtg")).toBe("jV468IGkYtg");
  });

  it("extrae el id cuando el parámetro v no es el primero", () => {
    expect(extraerIdVideoYoutube("https://www.youtube.com/watch?list=abc&v=gSeIYfPnJ40")).toBe(
      "gSeIYfPnJ40"
    );
  });

  it("retorna null si la URL no tiene parámetro v", () => {
    expect(extraerIdVideoYoutube("https://www.youtube.com/watch")).toBeNull();
  });

  it("extrae el id de un link corto youtu.be", () => {
    expect(extraerIdVideoYoutube("https://youtu.be/jV468IGkYtg")).toBe("jV468IGkYtg");
  });

  it("extrae el id de una URL de embed", () => {
    expect(extraerIdVideoYoutube("https://www.youtube.com/embed/jV468IGkYtg")).toBe("jV468IGkYtg");
  });
});

describe("hoyIso", () => {
  it("retorna la fecha actual en formato YYYY-MM-DD", () => {
    expect(hoyIso()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

describe("formatearRangoFecha", () => {
  it("formatea un evento de un solo día", () => {
    expect(formatearRangoFecha("2026-04-06", "2026-04-06")).toBe("6 de abril de 2026");
  });

  it("formatea un rango dentro del mismo mes", () => {
    expect(formatearRangoFecha("2026-01-30", "2026-01-31")).toBe("30 al 31 de enero de 2026");
  });

  it("formatea un rango de una semana dentro del mismo mes", () => {
    expect(formatearRangoFecha("2027-01-21", "2027-01-27")).toBe("21 al 27 de enero de 2027");
  });

  it("formatea un rango que cruza de mes dentro del mismo año", () => {
    expect(formatearRangoFecha("2026-11-28", "2026-12-02")).toBe(
      "28 de noviembre al 2 de diciembre de 2026"
    );
  });

  it("formatea un rango que cruza de año", () => {
    expect(formatearRangoFecha("2026-12-30", "2027-01-02")).toBe(
      "30 de diciembre de 2026 al 2 de enero de 2027"
    );
  });
});
