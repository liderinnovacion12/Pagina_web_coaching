import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParadaEvento } from "./ParadaEvento";
import type { Evento, ParadaLineaDeTiempo } from "@/lib/db/eventos.types";

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

function crearParada(
  overrides: Partial<ParadaLineaDeTiempo> & { evento: Evento }
): ParadaLineaDeTiempo {
  return {
    claveParada: `${overrides.evento.id}:f1`,
    fecha: { id: "f1", fechaInicio: "2026-01-01", fechaFin: "2026-01-01", ubicacion: "Miami" },
    estado: "proximo",
    mostrarVideo: false,
    ...overrides,
  };
}

describe("ParadaEvento", () => {
  it("muestra el título, subtítulo, fecha, ubicación y categoría", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento de Prueba" });
    const parada = crearParada({ evento });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByText("Evento de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo de prueba")).toBeInTheDocument();
    expect(screen.getByText("Miami")).toBeInTheDocument();
    expect(screen.getByText("Eventos Internacionales")).toBeInTheDocument();
  });

  it("muestra el video cuando mostrarVideo es true y el evento tiene youtubeUrl", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Video",
      youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
    });
    const parada = crearParada({ evento, mostrarVideo: true });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByTitle("Video de Evento con Video")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/jV468IGkYtg"
    );
  });

  it("no muestra el video cuando mostrarVideo es false, aunque el evento tenga youtubeUrl", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Video",
      youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
    });
    const parada = crearParada({ evento, mostrarVideo: false });

    const { container } = render(<ParadaEvento parada={parada} />);

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("muestra el badge 'En ejecución' cuando el estado es en_ejecucion", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento en Curso" });
    const parada = crearParada({ evento, estado: "en_ejecucion" });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByText("En ejecución")).toBeInTheDocument();
  });

  it("no muestra ningún badge de estado cuando el evento es proximo", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento Proximo" });
    const parada = crearParada({ evento, estado: "proximo" });

    render(<ParadaEvento parada={parada} />);

    expect(screen.queryByText("En ejecución")).not.toBeInTheDocument();
  });

  it("atenua la parada cuando el evento ya paso, sin bajar el contraste del texto", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento Pasado" });
    const parada = crearParada({ evento, estado: "realizado" });

    const { container } = render(<ParadaEvento parada={parada} />);

    expect(container.firstElementChild).toHaveClass("opacity-90");
    expect(container.firstElementChild).not.toHaveClass("opacity-40");
  });

  it("no atenua la parada cuando el evento es proximo o esta en curso", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento Proximo" });
    const parada = crearParada({ evento, estado: "proximo" });

    const { container } = render(<ParadaEvento parada={parada} />);

    expect(container.firstElementChild).not.toHaveClass("opacity-90");
  });
});
