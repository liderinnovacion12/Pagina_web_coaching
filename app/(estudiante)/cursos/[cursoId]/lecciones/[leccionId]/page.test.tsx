import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getLeccionDetalleMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});
const redirectMock = vi.fn((url: string) => {
  throw new Error(`NEXT_REDIRECT:${url}`);
});

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/lecciones", () => ({
  getLeccionDetalle: getLeccionDetalleMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
  redirect: redirectMock,
}));

vi.mock("./LeccionPlayer", () => ({
  LeccionPlayer: ({ leccionId }: { leccionId: string }) => (
    <div data-testid="player">{leccionId}</div>
  ),
}));

describe("LeccionPage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getLeccionDetalleMock.mockReset();
    notFoundMock.mockClear();
    redirectMock.mockClear();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });
  });

  it("muestra el título y la navegación anterior/siguiente", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l2",
      titulo: "Técnicas de cierre",
      cursoId: "c1",
      cursoTitulo: "Negociación y Cierre",
      tipoContenido: "video",
      muxAssetId: null,
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: "l1",
      leccionSiguienteId: "l3",
      accesoCurso: true,
    });

    const LeccionPage = (await import("./page")).default;
    render(
      await LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l2" }) })
    );

    expect(screen.getByText("Técnicas de cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /lección anterior/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l1"
    );
    expect(screen.getByRole("link", { name: /siguiente lección/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l3"
    );
  });

  it("no renderiza links de navegación en los extremos", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l1",
      titulo: "Psicología de la negociación",
      cursoId: "c1",
      cursoTitulo: "Negociación y Cierre",
      tipoContenido: "video",
      muxAssetId: null,
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: null,
      leccionSiguienteId: "l2",
      accesoCurso: true,
    });

    const LeccionPage = (await import("./page")).default;
    render(
      await LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l1" }) })
    );

    expect(screen.queryByRole("link", { name: /lección anterior/i })).not.toBeInTheDocument();
  });

  it("llama a notFound si la lección no existe", async () => {
    getLeccionDetalleMock.mockResolvedValue(null);

    const LeccionPage = (await import("./page")).default;

    await expect(
      LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "no-existe" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
  });

  it("redirige a la portada del curso si no hay acceso", async () => {
    getLeccionDetalleMock.mockResolvedValue({
      id: "l2",
      titulo: "Introducción a rentas",
      cursoId: "c1",
      cursoTitulo: "Maestría en Rentas",
      tipoContenido: "video",
      muxAssetId: "mux-123",
      storageKey: null,
      segundoActual: 0,
      completado: false,
      leccionAnteriorId: null,
      leccionSiguienteId: null,
      accesoCurso: false,
    });

    const LeccionPage = (await import("./page")).default;

    await expect(
      LeccionPage({ params: Promise.resolve({ cursoId: "c1", leccionId: "l2" }) })
    ).rejects.toThrow("NEXT_REDIRECT:/cursos/c1?bloqueado=1");
    expect(redirectMock).toHaveBeenCalledWith("/cursos/c1?bloqueado=1");
  });
});
