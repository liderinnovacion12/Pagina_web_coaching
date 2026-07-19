import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroContent } from "./HeroContent";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("HeroContent", () => {
  it("renderiza el titular, los CTAs y las estadísticas recibidas", () => {
    render(
      <HeroContent estadisticas={[{ valor: "2,000+", etiqueta: "Líderes" }]} />
    );

    expect(screen.getByText("Transforma tu")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Comenzar ahora" })).toHaveAttribute(
      "href",
      "/registro"
    );
    expect(screen.getByRole("link", { name: "Ver metodología" })).toHaveAttribute(
      "href",
      "#cursos"
    );
    expect(screen.getByText("2,000+")).toBeInTheDocument();
    // "Líderes" también existe en un <dt> sr-only; se apunta al <p> visible.
    expect(screen.getByText("Líderes", { selector: "p" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /descubrí nuestros cursos/i })
    ).toHaveAttribute("href", "#cursos");
  });

  it("mantiene visible el indicador de scroll cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(
      <HeroContent estadisticas={[{ valor: "2,000+", etiqueta: "Líderes" }]} />
    );
    expect(
      screen.getByRole("link", { name: /descubrí nuestros cursos/i })
    ).toBeInTheDocument();
    useReducedMotionSafeMock.mockReturnValue(false);
  });
});
