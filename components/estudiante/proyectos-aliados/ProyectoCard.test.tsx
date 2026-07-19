import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectoCard, calcularEstiloFoco } from "./ProyectoCard";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

function crearProyecto(
  overrides: Partial<ProyectoAliado> & { id: string; nombre: string }
): ProyectoAliado {
  return {
    descripcion: "Descripción de prueba.",
    precioDesde: "Desde $500K",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    whatsappUrl: "https://chat.whatsapp.com/prueba",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("calcularEstiloFoco", () => {
  it("en intensidad 0 devuelve la escala/opacidad más lejanas", () => {
    expect(calcularEstiloFoco(0, false)).toEqual({ scale: 0.82, opacity: 0.45 });
  });

  it("en intensidad 1 devuelve la escala/opacidad más centradas", () => {
    expect(calcularEstiloFoco(1, false)).toEqual({ scale: 1.12, opacity: 1 });
  });

  it("en intensidad 0.5 interpola a mitad de camino", () => {
    const resultado = calcularEstiloFoco(0.5, false);
    expect(resultado.scale).toBeCloseTo(0.97);
    expect(resultado.opacity).toBeCloseTo(0.725);
  });

  it("con reducedMotion=true ignora la intensidad y devuelve escala/opacidad neutras", () => {
    expect(calcularEstiloFoco(1, true)).toEqual({ scale: 1, opacity: 1 });
    expect(calcularEstiloFoco(0, true)).toEqual({ scale: 1, opacity: 1 });
  });
});

describe("ProyectoCard", () => {
  it("muestra título, precio, descripción, contacto y el link de WhatsApp", () => {
    const proyecto = crearProyecto({ id: "p1", nombre: "Domus" });

    render(<ProyectoCard proyecto={proyecto} intensidad={0} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Desde $500K")).toBeInTheDocument();
    expect(screen.getByText("Descripción de prueba.")).toBeInTheDocument();
    expect(screen.getByText(/Contacto Prueba/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /unirse al grupo de whatsapp/i })
    ).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
  });

  it("no muestra el precio si precioDesde es null", () => {
    const proyecto = crearProyecto({
      id: "p2",
      nombre: "Elle Residences",
      precioDesde: null,
    });

    render(<ProyectoCard proyecto={proyecto} intensidad={1} />);

    expect(screen.queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });
});
