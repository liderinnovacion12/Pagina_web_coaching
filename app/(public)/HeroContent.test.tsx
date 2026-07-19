import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroContent } from "./HeroContent";

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
});
