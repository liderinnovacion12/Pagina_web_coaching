import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AliadoCard } from "./AliadoCard";
import type { Aliado } from "@/lib/db/aliados.types";

function crearAliado(overrides: Partial<Aliado> & { id: string; servicio: string }): Aliado {
  return {
    descripcion: "Descripción de prueba.",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    contactoCorreo: "contacto@prueba.com",
    imagenUrl:
      "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/prueba.jpeg",
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("AliadoCard", () => {
  it("con un solo contacto, no repite el nombre en el pie", () => {
    const aliado = crearAliado({
      id: "a1",
      servicio: "Tributaria LLC",
      contactoNombre: "Ricardo Fernandez de Cordoba Martos",
      contactoTelefono: "+1 (305) 458-6559",
      contactoCorreo: "ricardo.fernandez@firstglobalfinanceus.com",
    });

    render(<AliadoCard aliado={aliado} />);

    expect(screen.getAllByText("Ricardo Fernandez de Cordoba Martos")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /\+1 \(305\) 458-6559/ })).toHaveAttribute(
      "href",
      "tel:+1 (305) 458-6559"
    );
  });

  it("con dos contactos, el nombre precede cada teléfono/correo", () => {
    const aliado = crearAliado({
      id: "a3",
      servicio: "Keep It Simple - Transaction Coordinator",
      contactoNombre: "Anahis\nAntonio",
      contactoTelefono: "+1 (478) 412-5213\n+1 (832) 299-5129",
      contactoCorreo: "Anahis@keepitsimple.properties\nAntonio@keepitsimple.properties",
    });

    render(<AliadoCard aliado={aliado} />);

    expect(screen.getByText("Anahis")).toBeInTheDocument();
    expect(screen.getByText("Antonio")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\+1 \(478\) 412-5213/ })).toHaveAttribute(
      "href",
      "tel:+1 (478) 412-5213"
    );
    expect(screen.getByRole("link", { name: /\+1 \(832\) 299-5129/ })).toHaveAttribute(
      "href",
      "tel:+1 (832) 299-5129"
    );
  });

  it("sin imagenUrl, muestra el ícono de respaldo en vez de una imagen", () => {
    const aliado = crearAliado({ id: "a4", servicio: "Nuevo Aliado", imagenUrl: null });

    render(<AliadoCard aliado={aliado} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("cuando faltan líneas de teléfono/correo para un contacto, no renderiza un link vacío", () => {
    const aliado = crearAliado({
      id: "a5",
      servicio: "Aliado Incompleto",
      contactoNombre: "Primero\nSegundo",
      // Solo una línea de teléfono para dos contactos: al segundo le falta.
      contactoTelefono: "+1 (111) 111-1111",
      contactoCorreo: "primero@prueba.com\nsegundo@prueba.com",
    });

    render(<AliadoCard aliado={aliado} />);

    // Solo debe existir un link tel: (el del primer contacto) y dos links mailto:.
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.every((link) => link.textContent && link.textContent.trim() !== "")).toBe(true);
    expect(screen.getByRole("link", { name: /\+1 \(111\) 111-1111/ })).toBeInTheDocument();
  });
});
