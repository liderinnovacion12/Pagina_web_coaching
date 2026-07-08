import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getSesionUsuarioMock = vi.fn();
const getCursoDetalleMock = vi.fn();
const notFoundMock = vi.fn(() => {
  throw new Error("NEXT_NOT_FOUND");
});

vi.mock("@/lib/auth/session", () => ({
  getSesionUsuario: getSesionUsuarioMock,
}));

vi.mock("@/lib/db/cursos", () => ({
  getCursoDetalle: getCursoDetalleMock,
}));

vi.mock("next/navigation", () => ({
  notFound: notFoundMock,
}));

describe("CursoDetallePage", () => {
  beforeEach(() => {
    getSesionUsuarioMock.mockReset();
    getCursoDetalleMock.mockReset();
    notFoundMock.mockClear();
    getSesionUsuarioMock.mockResolvedValue({ id: "u1", email: "ana@example.com", rol: "estudiante" });
  });

  it("muestra el título del curso y la lista de lecciones con su estado", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Negociación y Cierre",
      categoria: "sistema_100",
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 30, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(await CursoDetallePage({ params: Promise.resolve({ cursoId: "c1" }) }));

    expect(screen.getByText("Negociación y Cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /técnicas de cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l2"
    );
  });

  it("llama a notFound si el curso no existe", async () => {
    getCursoDetalleMock.mockResolvedValue(null);

    const CursoDetallePage = (await import("./page")).default;

    await expect(
      CursoDetallePage({ params: Promise.resolve({ cursoId: "no-existe" }) })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
