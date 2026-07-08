import { describe, it, expect, vi, beforeEach } from "vitest";

describe("getResumenEstudiante", () => {
  const xpEqMock = vi.fn();
  const xpSelectMock = vi.fn(() => ({ eq: xpEqMock }));

  const insigniasEqMock = vi.fn();
  const insigniasSelectMock = vi.fn(() => ({ eq: insigniasEqMock }));

  const progresoEqMock = vi.fn();
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqMock }));

  const membresiaMaybeSingleMock = vi.fn();
  const membresiaEqMock = vi.fn(() => ({ maybeSingle: membresiaMaybeSingleMock }));
  const membresiaSelectMock = vi.fn(() => ({ eq: membresiaEqMock }));

  const leccionesInMock = vi.fn();
  const leccionesSelectMock = vi.fn(() => ({ in: leccionesInMock }));

  const cursoSingleMock = vi.fn();
  const cursoEqMock = vi.fn(() => ({ single: cursoSingleMock }));
  const cursoSelectMock = vi.fn(() => ({ eq: cursoEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "xp_eventos") return { select: xpSelectMock };
    if (tabla === "insignias_usuario") return { select: insigniasSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    if (tabla === "membresia") return { select: membresiaSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "cursos") return { select: cursoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    xpSelectMock.mockClear();
    xpEqMock.mockClear();
    insigniasSelectMock.mockClear();
    insigniasEqMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqMock.mockClear();
    membresiaSelectMock.mockClear();
    membresiaEqMock.mockClear();
    membresiaMaybeSingleMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesInMock.mockClear();
    cursoSelectMock.mockClear();
    cursoEqMock.mockClear();
    cursoSingleMock.mockClear();

    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("agrega XP, insignias, cursos en progreso, membresía y continuar viendo", async () => {
    xpEqMock.mockResolvedValue({ data: [{ puntos: 50 }, { puntos: 30 }], error: null });
    insigniasEqMock.mockResolvedValue({ data: [{ insignia_id: "i1" }], error: null });
    progresoEqMock.mockResolvedValue({
      data: [
        { leccion_id: "l1", completado: false, actualizado_en: "2026-07-06T10:00:00Z" },
        { leccion_id: "l2", completado: false, actualizado_en: "2026-07-07T10:00:00Z" },
        { leccion_id: "l3", completado: true, actualizado_en: "2026-07-05T10:00:00Z" },
      ],
      error: null,
    });
    membresiaMaybeSingleMock.mockResolvedValue({ data: { estado: "activa" } });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", titulo: "Psicología de la negociación", curso_id: "c1", orden: 1 },
        { id: "l2", titulo: "Fuentes de leads en 2026", curso_id: "c2", orden: 1 },
      ],
      error: null,
    });
    cursoSingleMock.mockResolvedValue({ data: { id: "c2", titulo: "Prospección y Generación de Leads" } });

    const { getResumenEstudiante } = await import("./dashboard");
    const resumen = await getResumenEstudiante("u1");

    expect(resumen).toEqual({
      xpTotal: 80,
      insigniasCount: 1,
      cursosEnProgreso: 2,
      membresiaEstado: "activa",
      continuarViendo: {
        cursoId: "c2",
        leccionId: "l2",
        leccionTitulo: "Fuentes de leads en 2026",
        cursoTitulo: "Prospección y Generación de Leads",
      },
    });
  });

  it("retorna estado vacío para un estudiante nuevo sin actividad", async () => {
    xpEqMock.mockResolvedValue({ data: [], error: null });
    insigniasEqMock.mockResolvedValue({ data: [], error: null });
    progresoEqMock.mockResolvedValue({ data: [], error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null });

    const { getResumenEstudiante } = await import("./dashboard");
    const resumen = await getResumenEstudiante("u-nuevo");

    expect(resumen).toEqual({
      xpTotal: 0,
      insigniasCount: 0,
      cursosEnProgreso: 0,
      membresiaEstado: "sin_membresia",
      continuarViendo: null,
    });
    expect(leccionesSelectMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla la consulta del curso para continuar viendo", async () => {
    xpEqMock.mockResolvedValue({ data: [], error: null });
    insigniasEqMock.mockResolvedValue({ data: [], error: null });
    progresoEqMock.mockResolvedValue({
      data: [{ leccion_id: "l1", completado: false, actualizado_en: "2026-07-06T10:00:00Z" }],
      error: null,
    });
    membresiaMaybeSingleMock.mockResolvedValue({ data: { estado: "activa" } });
    leccionesInMock.mockResolvedValue({
      data: [{ id: "l1", titulo: "Psicología de la negociación", curso_id: "c1", orden: 1 }],
      error: null,
    });
    cursoSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getResumenEstudiante } = await import("./dashboard");

    await expect(getResumenEstudiante("u1")).rejects.toThrow(
      "No se pudo cargar el curso: timeout"
    );
  });

  it("lanza un error legible si falla la consulta de membresía", async () => {
    xpEqMock.mockResolvedValue({ data: [], error: null });
    insigniasEqMock.mockResolvedValue({ data: [], error: null });
    progresoEqMock.mockResolvedValue({ data: [], error: null });
    membresiaMaybeSingleMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getResumenEstudiante } = await import("./dashboard");

    await expect(getResumenEstudiante("u1")).rejects.toThrow(
      "No se pudo cargar la membresía: timeout"
    );
  });
});
