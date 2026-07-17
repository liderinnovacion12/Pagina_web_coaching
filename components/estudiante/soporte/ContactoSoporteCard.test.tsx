import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContactoSoporteCard } from "./ContactoSoporteCard";
import type { ContactoSoporte } from "@/lib/db/contactos-soporte.types";

function crearContacto(
  overrides: Partial<ContactoSoporte> & { id: string; nombre: string }
): ContactoSoporte {
  return {
    cargo: "CARGO DE PRUEBA",
    descripcionCargo: "Descripción de prueba.",
    telefono: "+1 (000) 000-0000",
    correo: "contacto@prueba.com",
    fotoUrl:
      "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/prueba.jpeg",
    orden: 0,
    activo: true,
    ...overrides,
  };
}

describe("ContactoSoporteCard", () => {
  it("muestra el nombre, cargo y descripción", () => {
    const contacto = crearContacto({
      id: "c1",
      nombre: "John Díaz",
      cargo: "CEO",
      descripcionCargo: "Director ejecutivo de la empresa",
    });

    render(<ContactoSoporteCard contacto={contacto} />);

    expect(screen.getByText("John Díaz")).toBeInTheDocument();
    expect(screen.getByText("CEO")).toBeInTheDocument();
    expect(screen.getByText("Director ejecutivo de la empresa")).toBeInTheDocument();
  });

  it("los links de teléfono y correo tienen los hrefs correctos", () => {
    const contacto = crearContacto({
      id: "c1",
      nombre: "John Díaz",
      telefono: "+1 (305) 593-6361",
      correo: "jdiaz@teammyrealty.com",
    });

    render(<ContactoSoporteCard contacto={contacto} />);

    expect(screen.getByRole("link", { name: "+1 (305) 593-6361" })).toHaveAttribute(
      "href",
      "tel:+1 (305) 593-6361"
    );
    expect(screen.getByRole("link", { name: "jdiaz@teammyrealty.com" })).toHaveAttribute(
      "href",
      "mailto:jdiaz@teammyrealty.com"
    );
  });

  it("sin fotoUrl, muestra la inicial del nombre en vez de una imagen", () => {
    const contacto = crearContacto({ id: "c1", nombre: "Julie Meneses", fotoUrl: null });

    const { container } = render(<ContactoSoporteCard contacto={contacto} />);

    expect(container.querySelector("img")).not.toBeInTheDocument();
    expect(screen.getByText("J")).toBeInTheDocument();
  });

  it("no usa ningún ícono en la tarjeta", () => {
    const contacto = crearContacto({ id: "c1", nombre: "John Díaz" });

    const { container } = render(<ContactoSoporteCard contacto={contacto} />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
