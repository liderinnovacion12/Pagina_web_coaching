import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getCursosPorCategoriaMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/cursos", () => ({
  getCursosPorCategoria: getCursosPorCategoriaMock,
}));

describe("Sistema100Page", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursosPorCategoriaMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("consulta solo la categoría sistema_100 y muestra las tarjetas", async () => {
    getCursosPorCategoriaMock.mockResolvedValue([
      { id: "c1", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100", totalLecciones: 3, leccionesCompletadas: 0, progresoPorcentaje: 0 },
    ]);

    const Sistema100Page = (await import("./page")).default;
    render(await Sistema100Page());

    expect(getCursosPorCategoriaMock).toHaveBeenCalledWith("u1", "sistema_100");
    expect(screen.getByText("Mentalidad de Líder 100+")).toBeInTheDocument();
  });
});
