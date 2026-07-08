import { describe, it, expect, vi, beforeEach } from "vitest";

type CursosResult = {
  data: { id: string; titulo: string; precio: number }[] | null;
  error: { message: string } | null;
};

const orderMock = vi.fn(
  (): CursosResult => ({
    data: [{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }],
    error: null,
  })
);
const eqMock = vi.fn(() => ({ order: orderMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getCursosPublicados", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    orderMock.mockClear();
  });

  it("consulta solo cursos publicados, ordenados por título", async () => {
    const { getCursosPublicados } = await import("./cursos");
    const cursos = await getCursosPublicados();

    expect(fromMock).toHaveBeenCalledWith("cursos");
    expect(selectMock).toHaveBeenCalledWith("id, titulo, precio");
    expect(eqMock).toHaveBeenCalledWith("publicado", true);
    expect(orderMock).toHaveBeenCalledWith("titulo");
    expect(cursos).toEqual([{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockReturnValueOnce({ data: null, error: { message: "timeout" } });

    const { getCursosPublicados } = await import("./cursos");

    await expect(getCursosPublicados()).rejects.toThrow(
      "No se pudo cargar el catálogo: timeout"
    );
  });
});

describe("getCursosPorCategoria", () => {
  const cursosOrderMock = vi.fn();
  const cursosEqMock = vi.fn(() => ({ eq: cursosEqMock, order: cursosOrderMock }));
  const cursosSelectMock = vi.fn(() => ({ eq: cursosEqMock, order: cursosOrderMock }));

  const leccionesInMock = vi.fn();
  const leccionesSelectMock = vi.fn(() => ({ in: leccionesInMock }));

  const progresoInMock = vi.fn();
  const progresoEqMock = vi.fn(() => ({ in: progresoInMock }));
  const progresoSelectMock = vi.fn(() => ({ eq: progresoEqMock }));

  const fromMock = vi.fn((tabla: string) => {
    if (tabla === "cursos") return { select: cursosSelectMock };
    if (tabla === "lecciones") return { select: leccionesSelectMock };
    if (tabla === "progreso") return { select: progresoSelectMock };
    throw new Error(`tabla inesperada: ${tabla}`);
  });

  beforeEach(() => {
    fromMock.mockClear();
    cursosSelectMock.mockClear();
    cursosEqMock.mockClear();
    cursosOrderMock.mockClear();
    leccionesSelectMock.mockClear();
    leccionesInMock.mockClear();
    progresoSelectMock.mockClear();
    progresoEqMock.mockClear();
    progresoInMock.mockClear();

    vi.resetModules();
    vi.doMock("@/lib/supabase/server", () => ({
      createClient: vi.fn(async () => ({ from: fromMock })),
    }));
  });

  it("calcula el progreso agregado por curso filtrando por categoría", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", curso_id: "c1" },
        { id: "l2", curso_id: "c1" },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({
      data: [{ leccion_id: "l1", completado: true }],
      error: null,
    });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "sistema_100");

    expect(cursosEqMock).toHaveBeenCalledWith("categoria", "sistema_100");
    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Mentalidad de Líder 100+",
        categoria: "sistema_100",
        totalLecciones: 2,
        leccionesCompletadas: 1,
        progresoPorcentaje: 50,
      },
    ]);
  });

  it("retorna arreglo vacío sin consultar lecciones/progreso si no hay cursos", async () => {
    cursosOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "clases");

    expect(resultado).toEqual([]);
    expect(leccionesSelectMock).not.toHaveBeenCalled();
  });

  it("lanza un error legible si falla la consulta de cursos", async () => {
    cursosOrderMock.mockResolvedValue({ data: null, error: { message: "timeout" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudo cargar el catálogo: timeout"
    );
  });

  it("sin categoría, no filtra por categoria (solo filtra por publicado)", async () => {
    cursosOrderMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    await getCursosPorCategoria("u1");

    expect(cursosEqMock).toHaveBeenCalledWith("publicado", true);
    expect(cursosEqMock).not.toHaveBeenCalledWith("categoria", expect.anything());
    expect(cursosEqMock).toHaveBeenCalledTimes(1);
  });

  it("particiona el progreso por curso cuando hay varios cursos con lecciones propias", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [
        { id: "c1", titulo: "Curso A", categoria: "sistema_100" },
        { id: "c2", titulo: "Curso B", categoria: "clases" },
      ],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [
        { id: "l1", curso_id: "c1" },
        { id: "l2", curso_id: "c1" },
        { id: "l3", curso_id: "c2" },
        { id: "l4", curso_id: "c2" },
        { id: "l5", curso_id: "c2" },
      ],
      error: null,
    });
    progresoInMock.mockResolvedValue({
      data: [
        { leccion_id: "l1", completado: true },
        { leccion_id: "l2", completado: false },
        { leccion_id: "l3", completado: true },
        { leccion_id: "l4", completado: true },
      ],
      error: null,
    });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1");

    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Curso A",
        categoria: "sistema_100",
        totalLecciones: 2,
        leccionesCompletadas: 1,
        progresoPorcentaje: 50,
      },
      {
        id: "c2",
        titulo: "Curso B",
        categoria: "clases",
        totalLecciones: 3,
        leccionesCompletadas: 2,
        progresoPorcentaje: 67,
      },
    ]);
  });

  it("retorna progreso 0 sin NaN cuando el curso no tiene lecciones", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso Vacío", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({ data: [], error: null });

    const { getCursosPorCategoria } = await import("./cursos");
    const resultado = await getCursosPorCategoria("u1", "clases");

    expect(resultado).toEqual([
      {
        id: "c1",
        titulo: "Curso Vacío",
        categoria: "clases",
        totalLecciones: 0,
        leccionesCompletadas: 0,
        progresoPorcentaje: 0,
      },
    ]);
  });

  it("lanza un error legible si falla la consulta de lecciones", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso A", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({ data: null, error: { message: "fallo lecciones" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudieron cargar las lecciones: fallo lecciones"
    );
  });

  it("lanza un error legible si falla la consulta de progreso", async () => {
    cursosOrderMock.mockResolvedValue({
      data: [{ id: "c1", titulo: "Curso A", categoria: "clases" }],
      error: null,
    });
    leccionesInMock.mockResolvedValue({
      data: [{ id: "l1", curso_id: "c1" }],
      error: null,
    });
    progresoInMock.mockResolvedValue({ data: null, error: { message: "fallo progreso" } });

    const { getCursosPorCategoria } = await import("./cursos");

    await expect(getCursosPorCategoria("u1", "clases")).rejects.toThrow(
      "No se pudo cargar el progreso: fallo progreso"
    );
  });
});
