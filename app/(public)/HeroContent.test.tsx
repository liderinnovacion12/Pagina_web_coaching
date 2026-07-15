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
  });

  it("aplica un estilo externo (parallax) al contenedor raíz cuando se provee", () => {
    const { container } = render(
      <HeroContent
        estadisticas={[{ valor: "2,000+", etiqueta: "Líderes" }]}
        style={{ opacity: 0.5 }}
      />
    );

    const section = container.querySelector("section");
    expect(section).toHaveStyle({ opacity: "0.5" });
  });
});
