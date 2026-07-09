import { describe, it, expect, vi, beforeEach } from "vitest";

type GaleriaResult = {
  data: { id: string; url: string }[] | null;
  error: { message: string } | null;
};

const orderMock = vi.fn(
  (): GaleriaResult => ({
    data: [{ id: "g1", url: "https://tu-proyecto.supabase.co/storage/v1/object/public/equipo/galeria-01.jpg" }],
    error: null,
  })
);
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getGaleriaEquipo", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    orderMock.mockClear();
  });

  it("consulta galeria_equipo ordenada por orden", async () => {
    const { getGaleriaEquipo } = await import("./galeria");
    const fotos = await getGaleriaEquipo();

    expect(fromMock).toHaveBeenCalledWith("galeria_equipo");
    expect(selectMock).toHaveBeenCalledWith("id, url");
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(fotos).toEqual([
      { id: "g1", url: "https://tu-proyecto.supabase.co/storage/v1/object/public/equipo/galeria-01.jpg" },
    ]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockReturnValueOnce({ data: null, error: { message: "timeout" } });

    const { getGaleriaEquipo } = await import("./galeria");

    await expect(getGaleriaEquipo()).rejects.toThrow("No se pudo cargar la galería: timeout");
  });
});
