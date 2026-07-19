import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import { revealSlideLeft } from "@/lib/motion";

describe("CatalogoCursoCard", () => {
  it("muestra el título y el precio formateado del curso", () => {
    render(
      <ul>
        <CatalogoCursoCard
          curso={{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }}
          variants={revealSlideLeft}
        />
      </ul>
    );

    expect(screen.getByText("Ventas B2B")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
