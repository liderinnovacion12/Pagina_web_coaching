import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectosAliadosGrid } from "./ProyectosAliadosGrid";
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

const PROYECTOS: ProyectoAliado[] = [
  crearProyecto({ id: "p1", nombre: "Domus" }),
  crearProyecto({ id: "p2", nombre: "Elle Residences", precioDesde: null }),
];

describe("ProyectosAliadosGrid", () => {
  it("renderiza una tarjeta por cada proyecto", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Elle Residences")).toBeInTheDocument();
  });

  it("muestra el badge de precio solo si precioDesde no es null", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getAllByText(/^Desde \$/)).toHaveLength(1);
  });

  it("el link de WhatsApp usa la URL correcta y abre en una pestaña nueva", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const links = screen.getAllByRole("link", { name: /unirse al grupo de whatsapp/i });
    expect(links[0]).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("muestra la comisión regular y la del equipo", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText(/comisión regular/i)).toBeInTheDocument();
    expect(screen.getByText(/comisión para el equipo/i)).toBeInTheDocument();
  });
});
