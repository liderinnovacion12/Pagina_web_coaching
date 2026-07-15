import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AliadosGrid } from "./AliadosGrid";
import type { Aliado } from "@/lib/db/aliados.types";

function crearAliado(overrides: Partial<Aliado> & { id: string; servicio: string }): Aliado {
  return {
    descripcion: "Descripción de prueba.",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    contactoCorreo: "contacto@prueba.com",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const ALIADOS: Aliado[] = [
  crearAliado({ id: "a1", servicio: "Tributaria LLC" }),
  crearAliado({ id: "a2", servicio: "Grow Marketing" }),
];

describe("AliadosGrid", () => {
  it("renderiza una tarjeta por cada aliado", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    expect(screen.getByText("Tributaria LLC")).toBeInTheDocument();
    expect(screen.getByText("Grow Marketing")).toBeInTheDocument();
  });

  it("muestra el título y subtítulo de la página", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    expect(screen.getByText("Aliados Estratégicos del Equipo")).toBeInTheDocument();
    expect(screen.getByText(/Contactos y aliados/)).toBeInTheDocument();
  });
});
