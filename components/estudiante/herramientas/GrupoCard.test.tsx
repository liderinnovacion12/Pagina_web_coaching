import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GrupoCard } from "./GrupoCard";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

function crearGrupo(
  overrides: Partial<GrupoComunidad> & { id: string; nombre: string }
): GrupoComunidad {
  return {
    categoria: "miami",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: "https://chat.whatsapp.com/prueba",
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("GrupoCard", () => {
  it("vista grid: acento verde WhatsApp en la franja lateral y el link", () => {
    const grupo = crearGrupo({ id: "g1", nombre: "Domus", tipoCanal: "whatsapp" });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.firstElementChild).toHaveClass("border-l-whatsapp");
    expect(screen.getByRole("link", { name: /unirse/i })).toHaveClass("text-whatsapp");
  });

  it("vista grid: acento dorado Dropbox en la franja lateral y el link", () => {
    const grupo = crearGrupo({
      id: "g2",
      nombre: "Carpeta Compartida",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.firstElementChild).toHaveClass("border-l-gold-500");
    expect(screen.getByRole("link", { name: /abrir carpeta/i })).toHaveClass("text-gold-300");
  });

  it("vista lista: tambien aplica el acento verde WhatsApp en la franja lateral", () => {
    const grupo = crearGrupo({ id: "g3", nombre: "Domus", tipoCanal: "whatsapp" });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    expect(container.firstElementChild).toHaveClass("border-l-whatsapp");
  });

  it("vista lista: tambien aplica el acento dorado Dropbox en la franja lateral", () => {
    const grupo = crearGrupo({
      id: "g4",
      nombre: "Carpeta",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    expect(container.firstElementChild).toHaveClass("border-l-gold-500");
  });

  it("no renderiza ningun icono", () => {
    const grupo = crearGrupo({ id: "g5", nombre: "Sin Icono" });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
