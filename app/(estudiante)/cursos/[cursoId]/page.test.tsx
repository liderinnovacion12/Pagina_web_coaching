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
      accesoCurso: true,
      lecciones: [
        { id: "l1", titulo: "Psicología de la negociación", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: true },
        { id: "l2", titulo: "Técnicas de cierre", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 2, segundoActual: 30, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByText("Negociación y Cierre")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /técnicas de cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1/lecciones/l2"
    );
  });

  it("muestra las lecciones con candado y sin link si el curso está bloqueado", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Maestría en Rentas",
      categoria: "clases",
      accesoCurso: false,
      lecciones: [
        { id: "l1", titulo: "Introducción a rentas", tipoContenido: "video", muxAssetId: null, storageKey: null, orden: 1, segundoActual: 0, completado: false },
      ],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({}),
      })
    );

    expect(screen.getByText("Introducción a rentas")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /introducción a rentas/i })).not.toBeInTheDocument();
  });

  it("muestra un banner cuando la URL trae bloqueado=1", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Maestría en Rentas",
      categoria: "clases",
      accesoCurso: false,
      lecciones: [],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({ bloqueado: "1" }),
      })
    );

    expect(
      screen.getByText(/no tienes acceso a este curso todavía/i)
    ).toBeInTheDocument();
  });

  it("no muestra el banner si bloqueado=1 pero el curso ya tiene acceso (URL obsoleta)", async () => {
    getCursoDetalleMock.mockResolvedValue({
      id: "c1",
      titulo: "Maestría en Rentas",
      categoria: "clases",
      accesoCurso: true,
      lecciones: [],
    });

    const CursoDetallePage = (await import("./page")).default;
    render(
      await CursoDetallePage({
        params: Promise.resolve({ cursoId: "c1" }),
        searchParams: Promise.resolve({ bloqueado: "1" }),
      })
    );

    expect(
      screen.queryByText(/no tienes acceso a este curso todavía/i)
    ).not.toBeInTheDocument();
  });

  it("llama a notFound si el curso no existe", async () => {
    getCursoDetalleMock.mockResolvedValue(null);

    const CursoDetallePage = (await import("./page")).default;

    await expect(
      CursoDetallePage({
        params: Promise.resolve({ cursoId: "no-existe" }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_NOT_FOUND");
    expect(notFoundMock).toHaveBeenCalled();
  });
});
