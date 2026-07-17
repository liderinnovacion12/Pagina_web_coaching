import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SoporteContent } from "./SoporteContent";
import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";

function crearContacto(
  overrides: Partial<ContactoSoporte> & { id: string; nombre: string }
): ContactoSoporte {
  return {
    cargo: "CARGO",
    descripcionCargo: "Descripción.",
    telefono: "+1 (000) 000-0000",
    correo: "contacto@prueba.com",
    fotoUrl: null,
    orden: 0,
    activo: true,
    ...overrides,
  };
}

const CONTACTOS: ContactoSoporte[] = [
  crearContacto({ id: "c1", nombre: "John Díaz" }),
  crearContacto({ id: "c2", nombre: "Luis Pinto" }),
];

describe("SoporteContent", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<SoporteContent contactos={CONTACTOS} />);

    expect(screen.getByText("Soporte, Ayuda y Contactos")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Estamos aquí para ayudarte - Encuentra toda la información de contacto del equipo"
      )
    ).toBeInTheDocument();
  });

  it("muestra la sección My Assistant con su link", () => {
    render(<SoporteContent contactos={CONTACTOS} />);

    expect(screen.getByText("My Assistant")).toBeInTheDocument();
    expect(screen.getByText("Asistente de IA de My Realty")).toBeInTheDocument();

    const boton = screen.getByRole("link", { name: "Empieza a usar My Assistant hoy" });
    expect(boton).toHaveAttribute(
      "href",
      "https://chatgpt.com/g/g-688ad2df1708819186005deae59fc948-myassistant"
    );
    expect(boton).toHaveAttribute("target", "_blank");
    expect(boton).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("muestra una tarjeta por cada contacto", () => {
    render(<SoporteContent contactos={CONTACTOS} />);

    expect(screen.getByText("John Díaz")).toBeInTheDocument();
    expect(screen.getByText("Luis Pinto")).toBeInTheDocument();
  });

  it("no usa ningún ícono en toda la página", () => {
    const { container } = render(<SoporteContent contactos={CONTACTOS} />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
