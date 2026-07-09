import { describe, it, expect, vi, beforeEach } from "vitest";

type EquipoResult = {
  data:
    | {
        id: string;
        nombre: string;
        cargo: string;
        descripcion_cargo: string;
        telefono: string;
        correo: string;
        foto_url: string | null;
      }[]
    | null;
  error: { message: string } | null;
};

const orderMock = vi.fn(
  (): EquipoResult => ({
    data: [
      {
        id: "m1",
        nombre: "Wilmar Sosa",
        cargo: "Ventas y Liderazgo",
        descripcion_cargo: "Agente inmobiliario, top producer y coach en liderazgo y ventas.",
        telefono: "+10000000000",
        correo: "wilmar@example.com",
        foto_url: "/images/cultura/wilmar-sosa.jpg",
      },
    ],
    error: null,
  })
);
const selectMock = vi.fn(() => ({ order: orderMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getMiembrosEquipo", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    orderMock.mockClear();
  });

  it("consulta miembros_equipo ordenados por orden y mapea a camelCase", async () => {
    const { getMiembrosEquipo } = await import("./equipo");
    const miembros = await getMiembrosEquipo();

    expect(fromMock).toHaveBeenCalledWith("miembros_equipo");
    expect(selectMock).toHaveBeenCalledWith(
      "id, nombre, cargo, descripcion_cargo, telefono, correo, foto_url"
    );
    expect(orderMock).toHaveBeenCalledWith("orden");
    expect(miembros).toEqual([
      {
        id: "m1",
        nombre: "Wilmar Sosa",
        cargo: "Ventas y Liderazgo",
        descripcionCargo: "Agente inmobiliario, top producer y coach en liderazgo y ventas.",
        telefono: "+10000000000",
        correo: "wilmar@example.com",
        fotoUrl: "/images/cultura/wilmar-sosa.jpg",
      },
    ]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockReturnValueOnce({ data: null, error: { message: "timeout" } });

    const { getMiembrosEquipo } = await import("./equipo");

    await expect(getMiembrosEquipo()).rejects.toThrow("No se pudo cargar el equipo: timeout");
  });
});
