import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ClasesCatalogo } from "./ClasesCatalogo";

const CURSOS = [
  { id: "c1", titulo: "Marketing Digital para Agentes", categoria: "clases" as const, totalLecciones: 2, leccionesCompletadas: 0, progresoPorcentaje: 0 },
  { id: "c2", titulo: "Mentalidad de Líder 100+", categoria: "sistema_100" as const, totalLecciones: 3, leccionesCompletadas: 3, progresoPorcentaje: 100 },
];

describe("ClasesCatalogo", () => {
  it("filtra por texto de búsqueda", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.change(screen.getByLabelText("Buscar clases"), { target: { value: "marketing" } });

    expect(screen.getByText("Marketing Digital para Agentes")).toBeInTheDocument();
    expect(screen.queryByText("Mentalidad de Líder 100+")).not.toBeInTheDocument();
  });

  it("filtra por categoría con los chips", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.click(screen.getByRole("button", { name: "Sistema 100+" }));

    expect(screen.getByText("Mentalidad de Líder 100+")).toBeInTheDocument();
    expect(screen.queryByText("Marketing Digital para Agentes")).not.toBeInTheDocument();
  });

  it("muestra estado vacío si no hay resultados", () => {
    render(<ClasesCatalogo cursos={CURSOS} />);

    fireEvent.change(screen.getByLabelText("Buscar clases"), { target: { value: "no existe" } });

    expect(screen.getByText("No encontramos clases con ese nombre.")).toBeInTheDocument();
  });
});
