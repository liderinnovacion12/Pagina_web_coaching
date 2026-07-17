import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventoForm } from "./EventoForm";
import type { EventoFormState } from "@/app/(admin)/admin/eventos/actions";
import type { Evento } from "@/lib/db/eventos.types";

const accionMock = async (
  _prevState: EventoFormState,
  _formData: FormData
): Promise<EventoFormState> => ({ error: null });

describe("EventoForm", () => {
  it("sin evento, empieza con una fila de fecha vacía", () => {
    render(<EventoForm action={accionMock} />);

    expect(screen.getAllByLabelText("Inicio")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Quitar" })).toBeDisabled();
  });

  it("agrega una fila nueva al hacer click en 'Agregar fecha'", () => {
    render(<EventoForm action={accionMock} />);

    fireEvent.click(screen.getByRole("button", { name: "Agregar fecha" }));

    expect(screen.getAllByLabelText("Inicio")).toHaveLength(2);
    expect(screen.getAllByRole("button", { name: "Quitar" })[0]).not.toBeDisabled();
  });

  it("quita una fila al hacer click en 'Quitar', pero no deja menos de una", () => {
    render(<EventoForm action={accionMock} />);

    fireEvent.click(screen.getByRole("button", { name: "Agregar fecha" }));
    expect(screen.getAllByLabelText("Inicio")).toHaveLength(2);

    fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[0]);
    expect(screen.getAllByLabelText("Inicio")).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Quitar" })).toBeDisabled();
  });

  it("con un evento existente, precarga sus fechas", () => {
    const evento: Evento = {
      id: "evento-1",
      categoria: "internacional",
      titulo: "Florida como destino inmobiliario",
      subtitulo: "Cronograma de eventos 2026 · Bogotá, Distrito Capital",
      youtubeUrl: null,
      orden: 1,
      activo: true,
      fechas: [
        {
          id: "fecha-1",
          fechaInicio: "2026-01-30",
          fechaFin: "2026-01-31",
          ubicacion: "Bogotá, Colombia",
        },
        {
          id: "fecha-2",
          fechaInicio: "2026-03-13",
          fechaFin: "2026-03-14",
          ubicacion: "Bogotá, Colombia",
        },
      ],
    };

    render(<EventoForm evento={evento} action={accionMock} />);

    expect(screen.getAllByLabelText("Inicio")).toHaveLength(2);
    expect(screen.getByDisplayValue("2026-01-30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("2026-03-13")).toBeInTheDocument();
  });
});
