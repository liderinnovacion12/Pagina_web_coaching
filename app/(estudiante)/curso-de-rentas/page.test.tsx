import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CursoDeRentasPage from "./page";

describe("CursoDeRentasPage", () => {
  it("muestra el título y subtítulo", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Maestría en Rentas" })).toBeInTheDocument();
    expect(
      screen.getByText("Domina el arte de las rentas inmobiliarias con nuestro programa completo.")
    ).toBeInTheDocument();
  });

  it("muestra el beneficio del 50% de descuento y el código", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByText(/Disfruta de un 50% de descuento en tu inscripción\./)).toBeInTheDocument();
    expect(screen.getByText("TEAM100REAL")).toBeInTheDocument();
  });

  it("muestra los 6 ítems del checklist", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByText("Módulos en video:")).toBeInTheDocument();
    expect(screen.getByText("Guiones y plantillas:")).toBeInTheDocument();
    expect(screen.getByText("Sesiones de reuniones en vivo grupales.")).toBeInTheDocument();
    expect(screen.getByText("Comunidad privada de WhatsApp:")).toBeInTheDocument();
    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.getByText("Plan de 30 días:")).toBeInTheDocument();
  });

  it("el CTA final enlaza a la plataforma externa en una pestaña nueva", () => {
    render(<CursoDeRentasPage />);

    const cta = screen.getByRole("link", { name: "Inscríbete ahora" });
    expect(cta).toHaveAttribute("href", "https://www.aprendeconwilmar.com/maestriaenrentas/pdp");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("no usa ningún ícono ni emoji en el contenido visible", () => {
    const { container } = render(<CursoDeRentasPage />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent ?? "")).toBe(false);
  });
});
