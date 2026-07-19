import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectoCard } from "./ProyectoCard";
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

describe("ProyectoCard", () => {
  it("muestra título, precio, descripción, contacto y el link de WhatsApp", () => {
    const proyecto = crearProyecto({ id: "p1", nombre: "Domus" });

    render(<ProyectoCard proyecto={proyecto} enFoco={false} />);

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

    render(<ProyectoCard proyecto={proyecto} enFoco={false} />);

    expect(screen.queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });
});
