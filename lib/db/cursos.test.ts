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
