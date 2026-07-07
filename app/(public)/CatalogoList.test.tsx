import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogoList } from "./CatalogoList";

describe("CatalogoList", () => {
  it("muestra un mensaje cuando no hay cursos", () => {
    render(<CatalogoList cursos={[]} />);
    expect(screen.getByText("Próximamente nuevos cursos.")).toBeInTheDocument();
  });

  it("muestra título y precio de cada curso", () => {
    render(
      <CatalogoList
        cursos={[{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }]}
      />
    );

    expect(screen.getByText("Ventas B2B")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
