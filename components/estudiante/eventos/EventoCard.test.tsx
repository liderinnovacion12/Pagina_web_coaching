import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventoCard } from "./EventoCard";
import { hoyIso, type Evento } from "@/lib/db/eventos.types";

function crearEvento(overrides: Partial<Evento> & { id: string; titulo: string }): Evento {
  return {
    categoria: "internacional",
    subtitulo: "Subtítulo de prueba",
    youtubeUrl: null,
    orden: 0,
    activo: true,
    fechas: [],
    ...overrides,
  };
}

describe("EventoCard", () => {
  it("muestra el título y subtítulo", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento de Prueba" });

    render(<EventoCard evento={evento} />);

    expect(screen.getByText("Evento de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo de prueba")).toBeInTheDocument();
  });

  it("embebe el video cuando youtubeUrl está presente", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Video",
      youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
    });

    render(<EventoCard evento={evento} />);

    expect(screen.getByTitle("Video de Evento con Video")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/jV468IGkYtg"
    );
  });

  it("no muestra ningún iframe cuando youtubeUrl es null", () => {
    const evento = crearEvento({ id: "e1", titulo: "Sin Video" });

    const { container } = render(<EventoCard evento={evento} />);

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("muestra el badge 'Realizado con éxito' para una fecha pasada", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Fechas",
      fechas: [
        { id: "f1", fechaInicio: "2020-01-01", fechaFin: "2020-01-02", ubicacion: "Bogotá, Colombia" },
      ],
    });

    render(<EventoCard evento={evento} />);

    expect(screen.getByText("Realizado con éxito")).toBeInTheDocument();
  });

  it("muestra el badge 'En ejecución' para una fecha que incluye hoy", () => {
    const hoy = hoyIso();
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento en Curso",
      fechas: [{ id: "f1", fechaInicio: hoy, fechaFin: hoy, ubicacion: "Bogotá, Colombia" }],
    });

    render(<EventoCard evento={evento} />);

    expect(screen.getByText("En ejecución")).toBeInTheDocument();
  });

  it("no muestra ningún badge para una fecha futura", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento Futuro",
      fechas: [
        { id: "f1", fechaInicio: "2099-01-01", fechaFin: "2099-01-02", ubicacion: "Bogotá, Colombia" },
      ],
    });

    render(<EventoCard evento={evento} />);

    expect(screen.queryByText("Realizado con éxito")).not.toBeInTheDocument();
    expect(screen.queryByText("En ejecución")).not.toBeInTheDocument();
  });
});
