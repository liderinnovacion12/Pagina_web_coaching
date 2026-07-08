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

describe("ClasesPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursosPorCategoriaMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("consulta todas las categorías (sin filtro) y renderiza el catálogo", async () => {
    getCursosPorCategoriaMock.mockResolvedValue([
      { id: "c1", titulo: "Marketing Digital para Agentes", categoria: "clases", totalLecciones: 2, leccionesCompletadas: 0, progresoPorcentaje: 0 },
    ]);

    const ClasesPage = (await import("./page")).default;
    render(await ClasesPage());

    expect(getCursosPorCategoriaMock).toHaveBeenCalledWith("u1", undefined);
    expect(screen.getByText("Marketing Digital para Agentes")).toBeInTheDocument();
  });
});
