import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CursoCard } from "./CursoCard";

describe("CursoCard", () => {
  it("muestra el título, un link al detalle y el % de progreso", () => {
    render(
      <CursoCard
        curso={{
          id: "c1",
          titulo: "Negociación y Cierre",
          categoria: "sistema_100",
          totalLecciones: 4,
          leccionesCompletadas: 2,
          progresoPorcentaje: 50,
        }}
      />
    );

    expect(screen.getByRole("link", { name: /negociación y cierre/i })).toHaveAttribute(
      "href",
      "/cursos/c1"
    );
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("marca 'Completado' cuando el progreso es 100%", () => {
    render(
      <CursoCard
        curso={{
          id: "c1",
          titulo: "Negociación y Cierre",
          categoria: "sistema_100",
          totalLecciones: 2,
          leccionesCompletadas: 2,
          progresoPorcentaje: 100,
        }}
      />
    );

    expect(screen.getByText("Completado")).toBeInTheDocument();
  });
});
