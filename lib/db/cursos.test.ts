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
});
