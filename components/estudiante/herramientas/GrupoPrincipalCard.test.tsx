import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GrupoPrincipalCard } from "./GrupoPrincipalCard";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

function crearGrupo(
  overrides: Partial<GrupoComunidad> & { id: string; nombre: string }
): GrupoComunidad {
  return {
    categoria: "grupo_principal",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: "https://chat.whatsapp.com/prueba",
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("GrupoPrincipalCard", () => {
  it("no renderiza nada si no hay grupo principal", () => {
    const { container } = render(<GrupoPrincipalCard grupo={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el nombre y los badges 'Oficial' y '100% Privado'", () => {
    const grupo = crearGrupo({ id: "principal", nombre: "Grupo Principal del Equipo" });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(screen.getByText("Grupo Principal del Equipo")).toBeInTheDocument();
    expect(screen.getByText("Oficial")).toBeInTheDocument();
    expect(screen.getByText("100% Privado")).toBeInTheDocument();
  });

  it("muestra un boton 'Unirse al grupo' con el enlace correcto cuando hay enlaceUrl", () => {
    const grupo = crearGrupo({
      id: "principal",
      nombre: "Grupo Principal del Equipo",
      enlaceUrl: "https://chat.whatsapp.com/prueba",
    });
    render(<GrupoPrincipalCard grupo={grupo} />);

    const boton = screen.getByRole("link", { name: /unirse al grupo/i });
    expect(boton).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(boton).toHaveAttribute("target", "_blank");
  });

  it("muestra 'Enlace pendiente' cuando no hay enlaceUrl", () => {
    const grupo = crearGrupo({
      id: "principal",
      nombre: "Grupo Principal del Equipo",
      enlaceUrl: null,
    });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(screen.getByText("Enlace pendiente")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /unirse al grupo/i })).not.toBeInTheDocument();
  });

  it("usa el detalle cargado desde admin si existe, en vez de la descripcion por defecto", () => {
    const grupo = crearGrupo({
      id: "principal",
      nombre: "Grupo Principal del Equipo",
      detalle: "Solo para agentes activos del equipo",
    });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(screen.getByText("Solo para agentes activos del equipo")).toBeInTheDocument();
    expect(
      screen.queryByText("Canal maestro de comunicación general del equipo.")
    ).not.toBeInTheDocument();
  });

  it("usa la descripcion por defecto cuando no hay detalle cargado", () => {
    const grupo = crearGrupo({ id: "principal", nombre: "Grupo Principal del Equipo" });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(
      screen.getByText("Canal maestro de comunicación general del equipo.")
    ).toBeInTheDocument();
  });
});
