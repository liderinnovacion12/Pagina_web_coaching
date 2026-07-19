import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
  crearAliado({ id: "a1", servicio: "Tributaria LLC", descripcion: "Descripción de Tributaria." }),
  crearAliado({ id: "a2", servicio: "Grow Marketing", descripcion: "Descripción de Grow Marketing." }),
];

describe("AliadosGrid", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    expect(screen.getByText("Aliados Estratégicos del Equipo")).toBeInTheDocument();
    expect(screen.getByText(/Contactos y aliados/)).toBeInTheDocument();
  });

  it("lista los nombres de todos los aliados, con el primero seleccionado por defecto", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    // "Tributaria LLC" aparece dos veces: el botón de la lista y el
    // título del panel de detalle (es el primero, seleccionado por defecto).
    expect(screen.getAllByText("Tributaria LLC")).toHaveLength(2);
    // "Grow Marketing" solo aparece una vez: el botón de la lista (no
    // está seleccionado todavía).
    expect(screen.getByText("Grow Marketing")).toBeInTheDocument();
  });

  it("el primer aliado tiene aria-current, y cambia al hacer click en otro", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    const botonTributaria = screen.getByRole("button", { name: "Tributaria LLC" });
    const botonGrow = screen.getByRole("button", { name: "Grow Marketing" });
    expect(botonTributaria).toHaveAttribute("aria-current", "true");
    expect(botonGrow).toHaveAttribute("aria-current", "false");

    fireEvent.click(botonGrow);

    expect(screen.getByText("Descripción de Grow Marketing.")).toBeInTheDocument();
    expect(botonGrow).toHaveAttribute("aria-current", "true");
    expect(botonTributaria).toHaveAttribute("aria-current", "false");
  });

  it("con un solo contacto, no repite el nombre en el panel de detalle", () => {
    const aliado = crearAliado({
      id: "a1",
      servicio: "Tributaria LLC",
      contactoNombre: "Ricardo Fernandez de Cordoba Martos",
      contactoTelefono: "+1 (305) 458-6559",
      contactoCorreo: "ricardo.fernandez@firstglobalfinanceus.com",
    });

    render(<AliadosGrid aliados={[aliado]} />);

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

    render(<AliadosGrid aliados={[aliado]} />);

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

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("con imagenUrl, muestra la imagen en vez del ícono de respaldo", () => {
    const aliado = crearAliado({
      id: "a6",
      servicio: "Aliado Con Foto",
      imagenUrl: "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/prueba.jpeg",
    });

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.getByRole("img", { name: "Aliado Con Foto" })).toBeInTheDocument();
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

    render(<AliadosGrid aliados={[aliado]} />);

    // Solo debe existir un link tel: (el del primer contacto) y dos links mailto:.
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.every((link) => link.textContent && link.textContent.trim() !== "")).toBe(true);
    expect(screen.getByRole("link", { name: /\+1 \(111\) 111-1111/ })).toBeInTheDocument();
  });
});
