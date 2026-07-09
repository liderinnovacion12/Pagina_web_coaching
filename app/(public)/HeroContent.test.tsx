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
    expect(screen.getByText("Líderes")).toBeInTheDocument();
  });
});
