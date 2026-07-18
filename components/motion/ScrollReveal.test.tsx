import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollReveal } from "./ScrollReveal";

describe("ScrollReveal", () => {
  it("renderiza sus children", () => {
    render(
      <ScrollReveal variants={{}}>
        <p>Contenido de prueba</p>
      </ScrollReveal>
    );
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("aplica el className recibido al contenedor", () => {
    const { container } = render(
      <ScrollReveal variants={{}} className="grid gap-6">
        <span>x</span>
      </ScrollReveal>
    );
    expect(container.firstElementChild).toHaveClass("grid", "gap-6");
  });

  it("no requiere children (uso decorativo, ej. un separador)", () => {
    const { container } = render(<ScrollReveal variants={{}} className="my-2 border-t" />);
    expect(container.firstElementChild).toHaveClass("my-2", "border-t");
  });
});
