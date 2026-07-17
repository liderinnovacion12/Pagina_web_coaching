import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EventosGrid } from "./EventosGrid";
import type { Evento } from "@/lib/db/eventos.types";

function crearEvento(
  overrides: Partial<Evento> & { id: string; titulo: string; categoria: Evento["categoria"] }
): Evento {
  return {
    subtitulo: "Subtítulo",
    youtubeUrl: null,
    orden: 0,
    activo: true,
    fechas: [],
    ...overrides,
  };
}

const EVENTOS: Evento[] = [
  crearEvento({ id: "e1", titulo: "Florida como destino inmobiliario", categoria: "internacional" }),
  crearEvento({ id: "e2", titulo: "Eventos New York", categoria: "nacional_eeuu" }),
];

describe("EventosGrid", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<EventosGrid eventos={EVENTOS} />);

    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(screen.getByText("Mantente informado sobre próximos eventos del equipo")).toBeInTheDocument();
  });

  it("agrupa los eventos por categoría con su encabezado de sección", () => {
    render(<EventosGrid eventos={EVENTOS} />);

    expect(screen.getByText("Eventos Internacionales")).toBeInTheDocument();
    expect(screen.getByText("Eventos Nacionales en EE.UU.")).toBeInTheDocument();
    expect(screen.getByText("Florida como destino inmobiliario")).toBeInTheDocument();
    expect(screen.getByText("Eventos New York")).toBeInTheDocument();
  });

  it("no muestra el encabezado de una categoría sin eventos", () => {
    const soloInternacional = [
      crearEvento({ id: "e1", titulo: "Florida como destino inmobiliario", categoria: "internacional" }),
    ];

    render(<EventosGrid eventos={soloInternacional} />);

    expect(screen.queryByText("Eventos Nacionales en EE.UU.")).not.toBeInTheDocument();
  });

  it("el botón de más información enlaza a WhatsApp en una pestaña nueva", () => {
    render(<EventosGrid eventos={EVENTOS} />);

    const boton = screen.getByRole("link", { name: "Solicitar más Información" });
    expect(boton).toHaveAttribute("href", "https://wa.link/o926ih");
    expect(boton).toHaveAttribute("target", "_blank");
    expect(boton).toHaveAttribute("rel", "noopener noreferrer");
  });
});
