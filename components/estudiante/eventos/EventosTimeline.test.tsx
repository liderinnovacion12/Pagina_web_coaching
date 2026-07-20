import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventosTimeline } from "./EventosTimeline";
import { hoyIso, type Evento } from "@/lib/db/eventos.types";

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

function sumarDias(fechaIso: string, dias: number): string {
  const fecha = new Date(`${fechaIso}T00:00:00Z`);
  fecha.setUTCDate(fecha.getUTCDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

describe("EventosTimeline", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<EventosTimeline eventos={[]} />);

    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(
      screen.getByText("Mantente informado sobre próximos eventos del equipo")
    ).toBeInTheDocument();
  });

  it("ordena las paradas cronologicamente sin importar la categoria", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Tardio",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2099-06-01", fechaFin: "2099-06-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Temprano",
        categoria: "nacional_eeuu",
        fechas: [{ id: "f2", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "Y" }],
      }),
    ];

    render(<EventosTimeline eventos={eventos} />);

    const titulos = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titulos).toEqual(["Evento Temprano", "Evento Tardio"]);
  });

  it("filtra por categoria con los chips", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Internacional",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Nacional",
        categoria: "nacional_eeuu",
        fechas: [{ id: "f2", fechaInicio: "2099-02-01", fechaFin: "2099-02-01", ubicacion: "Y" }],
      }),
    ];

    render(<EventosTimeline eventos={eventos} />);

    fireEvent.click(screen.getByRole("button", { name: "Eventos Internacionales" }));

    expect(screen.getByText("Evento Internacional")).toBeInTheDocument();
    expect(screen.queryByText("Evento Nacional")).not.toBeInTheDocument();
  });

  it("muestra el marcador 'Hoy' entre lo pasado y lo proximo", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Pasado",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2000-01-01", fechaFin: "2000-01-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Futuro",
        categoria: "internacional",
        fechas: [{ id: "f2", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "Y" }],
      }),
    ];

    const { container } = render(<EventosTimeline eventos={eventos} />);

    const texto = container.textContent ?? "";
    const posPasado = texto.indexOf("Evento Pasado");
    const posHoy = texto.indexOf("Hoy");
    const posFuturo = texto.indexOf("Evento Futuro");

    expect(posPasado).toBeGreaterThanOrEqual(0);
    expect(posHoy).toBeGreaterThan(posPasado);
    expect(posFuturo).toBeGreaterThan(posHoy);
  });

  it("muestra un mensaje cuando no hay eventos", () => {
    render(<EventosTimeline eventos={[]} />);
    expect(screen.getByText("No hay eventos en esta categoría.")).toBeInTheDocument();
  });

  it("no revienta al filtrar desde una lista con eventos hacia una categoria sin eventos", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Internacional",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "X" }],
      }),
    ];

    render(<EventosTimeline eventos={eventos} />);

    fireEvent.click(screen.getByRole("button", { name: "Eventos Nacionales en EE.UU." }));

    expect(screen.getByText("No hay eventos en esta categoría.")).toBeInTheDocument();
    expect(screen.queryByText("Evento Internacional")).not.toBeInTheDocument();
  });

  it("un evento de varios dias que ya empezo pero sigue en curso hoy queda despues del marcador 'Hoy', no antes", () => {
    const hoy = hoyIso();
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento En Curso",
        categoria: "internacional",
        fechas: [
          { id: "f1", fechaInicio: sumarDias(hoy, -3), fechaFin: sumarDias(hoy, 3), ubicacion: "X" },
        ],
      }),
    ];

    const { container } = render(<EventosTimeline eventos={eventos} />);

    const texto = container.textContent ?? "";
    const posHoy = texto.indexOf("Hoy");
    const posEvento = texto.indexOf("Evento En Curso");

    expect(posHoy).toBeGreaterThanOrEqual(0);
    expect(posEvento).toBeGreaterThan(posHoy);
  });

  it("el botón de más información enlaza a WhatsApp en una pestaña nueva", () => {
    render(<EventosTimeline eventos={[]} />);

    const boton = screen.getByRole("link", { name: "Solicitar más Información" });
    expect(boton).toHaveAttribute("href", "https://wa.link/o926ih");
    expect(boton).toHaveAttribute("target", "_blank");
    expect(boton).toHaveAttribute("rel", "noopener noreferrer");
  });
});
