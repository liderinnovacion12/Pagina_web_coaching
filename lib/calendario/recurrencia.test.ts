import { describe, it, expect } from "vitest";
import {
  getInicioSemana,
  getOcurrenciaEnSemana,
  zonedTimeToUtc,
  getRangoHorasSemana,
  formatRangoSemana,
  formatFechaCompleta,
  formatHora,
  aFechaISO,
} from "./recurrencia";

describe("getInicioSemana", () => {
  it("retorna el mismo lunes si la fecha ya es lunes", () => {
    expect(getInicioSemana(new Date(2026, 0, 5))).toEqual(new Date(2026, 0, 5));
  });

  it("retrocede hasta el lunes cuando la fecha es miércoles", () => {
    expect(getInicioSemana(new Date(2026, 0, 7))).toEqual(new Date(2026, 0, 5));
  });

  it("retrocede hasta el lunes cuando la fecha es domingo", () => {
    expect(getInicioSemana(new Date(2026, 0, 11))).toEqual(new Date(2026, 0, 5));
  });
});

describe("getOcurrenciaEnSemana", () => {
  it("recurrencia semanal: aparece cada 7 días desde la fecha ancla", () => {
    const inicioSemana = getInicioSemana(new Date(2026, 0, 20));
    expect(getOcurrenciaEnSemana("2026-01-06", "semanal", inicioSemana)).toEqual(
      new Date(2026, 0, 20)
    );
  });

  it("recurrencia semanal: null antes de la fecha ancla", () => {
    const inicioSemana = getInicioSemana(new Date(2025, 11, 29));
    expect(getOcurrenciaEnSemana("2026-01-06", "semanal", inicioSemana)).toBeNull();
  });

  it("recurrencia quincenal: solo aparece cada 14 días", () => {
    const semanaIntermedia = getInicioSemana(new Date(2026, 0, 12));
    const semanaQueToca = getInicioSemana(new Date(2026, 0, 19));

    expect(getOcurrenciaEnSemana("2026-01-05", "quincenal", semanaIntermedia)).toBeNull();
    expect(getOcurrenciaEnSemana("2026-01-05", "quincenal", semanaQueToca)).toEqual(
      new Date(2026, 0, 19)
    );
  });

  it("recurrencia única: solo aparece en la semana de la fecha ancla", () => {
    const semanaAncla = getInicioSemana(new Date(2026, 0, 7));
    const otraSemana = getInicioSemana(new Date(2026, 0, 14));

    expect(getOcurrenciaEnSemana("2026-01-07", "unica", semanaAncla)).toEqual(
      new Date(2026, 0, 7)
    );
    expect(getOcurrenciaEnSemana("2026-01-07", "unica", otraSemana)).toBeNull();
  });
});

describe("zonedTimeToUtc", () => {
  it("convierte hora de invierno (EST, UTC-5) a UTC", () => {
    expect(zonedTimeToUtc("2026-01-05", "09:00").toISOString()).toBe(
      "2026-01-05T14:00:00.000Z"
    );
  });

  it("convierte hora de verano (EDT, UTC-4) a UTC", () => {
    expect(zonedTimeToUtc("2026-07-06", "09:00").toISOString()).toBe(
      "2026-07-06T13:00:00.000Z"
    );
  });
});

describe("getRangoHorasSemana", () => {
  it("retorna el rango por defecto si no hay ocurrencias", () => {
    expect(getRangoHorasSemana([])).toEqual({ horaInicio: 8, horaFin: 18 });
  });

  it("calcula el rango con un margen de una hora respecto a los eventos", () => {
    const ocurrencias = [
      { inicioUtc: new Date("2026-01-05T09:00:00Z"), finUtc: new Date("2026-01-05T10:00:00Z") },
      { inicioUtc: new Date("2026-01-06T18:00:00Z"), finUtc: new Date("2026-01-06T19:00:00Z") },
    ];

    expect(getRangoHorasSemana(ocurrencias)).toEqual({ horaInicio: 8, horaFin: 20 });
  });
});

describe("formatRangoSemana", () => {
  it("formatea un rango dentro del mismo mes", () => {
    expect(formatRangoSemana(new Date(2026, 0, 5))).toBe("5–11 enero 2026");
  });

  it("formatea un rango que cruza de mes", () => {
    expect(formatRangoSemana(new Date(2026, 0, 26))).toBe("26 enero – 1 febrero 2026");
  });
});

describe("formatFechaCompleta", () => {
  it("formatea una fecha con día de la semana, día, mes y año", () => {
    expect(formatFechaCompleta(new Date(2026, 0, 5))).toBe("lunes, 5 de enero de 2026");
  });
});

describe("formatHora", () => {
  it("formatea horas AM y PM sin ceros a la izquierda en la hora", () => {
    expect(formatHora(9, 0)).toBe("9:00 AM");
    expect(formatHora(18, 5)).toBe("6:05 PM");
    expect(formatHora(0, 0)).toBe("12:00 AM");
    expect(formatHora(12, 30)).toBe("12:30 PM");
  });
});

describe("aFechaISO", () => {
  it("formatea una fecha local como YYYY-MM-DD", () => {
    expect(aFechaISO(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});
