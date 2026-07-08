import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getResumenEstudianteMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/dashboard", () => ({
  getResumenEstudiante: getResumenEstudianteMock,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getResumenEstudianteMock.mockReset();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("muestra las 4 estadísticas y la sección continuar viendo", async () => {
    getResumenEstudianteMock.mockResolvedValue({
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

    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByText("80")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("Activa")).toBeInTheDocument();
    expect(screen.getByText("Fuentes de leads en 2026")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /retomar/i })).toHaveAttribute(
      "href",
      "/cursos/c2/lecciones/l2"
    );
  });

  it("muestra el estado vacío para un estudiante sin actividad", async () => {
    getResumenEstudianteMock.mockResolvedValue({
      xpTotal: 0,
      insigniasCount: 0,
      cursosEnProgreso: 0,
      membresiaEstado: "sin_membresia",
      continuarViendo: null,
    });

    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.queryByText(/continuar viendo/i)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /comenzar sistema 100\+/i })).toHaveAttribute(
      "href",
      "/sistema-100"
    );
  });
});
