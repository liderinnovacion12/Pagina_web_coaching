import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import OficinasPage from "./page";

describe("OficinasPage", () => {
  it("muestra el título y subtítulo", () => {
    render(<OficinasPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Nuestras Oficinas" })
    ).toBeInTheDocument();
    expect(screen.getByText("Ubicaciones del equipo en Florida")).toBeInTheDocument();
  });

  it("muestra las 4 ciudades", () => {
    render(<OficinasPage />);

    expect(screen.getByText("Miami")).toBeInTheDocument();
    expect(screen.getByText("Orlando")).toBeInTheDocument();
    expect(screen.getByText("Tampa")).toBeInTheDocument();
    expect(screen.getByText("West Palm Beach")).toBeInTheDocument();
  });

  it("muestra las 4 direcciones", () => {
    render(<OficinasPage />);

    expect(screen.getByText("7791 NW 46 St, Suite 417, Doral, FL 33166")).toBeInTheDocument();
    expect(screen.getByText("8810 Commodity Circle #4, Orlando, FL 32819")).toBeInTheDocument();
    expect(screen.getByText("2014 Drew Street, Clearwater, FL 33765")).toBeInTheDocument();
    expect(
      screen.getByText("6685 Forest Hill Blvd, Suite 206, Greenacres, FL 33413")
    ).toBeInTheDocument();
  });

  it("embebe un mapa de Google Maps por oficina con la dirección correcta", () => {
    render(<OficinasPage />);

    expect(screen.getByTitle("Mapa de la oficina de Miami")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=7791%20NW%2046%20St%2C%20Suite%20417%2C%20Doral%2C%20FL%2033166&output=embed"
    );
    expect(screen.getByTitle("Mapa de la oficina de Orlando")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=8810%20Commodity%20Circle%20%234%2C%20Orlando%2C%20FL%2032819&output=embed"
    );
    expect(screen.getByTitle("Mapa de la oficina de Tampa")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=2014%20Drew%20Street%2C%20Clearwater%2C%20FL%2033765&output=embed"
    );
    expect(screen.getByTitle("Mapa de la oficina de West Palm Beach")).toHaveAttribute(
      "src",
      "https://www.google.com/maps?q=6685%20Forest%20Hill%20Blvd%2C%20Suite%20206%2C%20Greenacres%2C%20FL%2033413&output=embed"
    );
  });

  it("cada botón de reserva enlaza al Calendly correcto de su oficina", () => {
    render(<OficinasPage />);

    const botones = screen.getAllByRole("link", { name: "Reservar sala de juntas" });
    expect(botones).toHaveLength(4);

    expect(botones[0]).toHaveAttribute(
      "href",
      "https://calendly.com/myrealtygroupapp/conference-room-miami?month=2026-04"
    );
    expect(botones[0]).toHaveAttribute("target", "_blank");
    expect(botones[0]).toHaveAttribute("rel", "noopener noreferrer");

    expect(botones[1]).toHaveAttribute(
      "href",
      "https://calendly.com/corporaterelations-teammyrealty/30min?month=2025-12"
    );
    expect(botones[2]).toHaveAttribute(
      "href",
      "https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04"
    );
    expect(botones[3]).toHaveAttribute(
      "href",
      "https://calendly.com/myrealtygroupapp/new-meeting?month=2026-04"
    );
  });
});
