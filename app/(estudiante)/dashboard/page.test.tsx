import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("muestra el encabezado de bienvenida", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Bienvenido a Team 100% Real Estate" })
    ).toBeInTheDocument();
    expect(screen.getByText("by Wilmar Sosa y Samuel Oropeza")).toBeInTheDocument();
  });

  it("embebe el video de bienvenida de Loom", () => {
    render(<DashboardPage />);

    const iframe = screen.getByTitle("Video de bienvenida — Team 100% Real Estate");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
    );
  });

  it("el boton de WhatsApp enlaza a /herramientas", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("link", { name: /únete a los grupos y comunidades de whatsapp/i })
    ).toHaveAttribute("href", "/herramientas");
  });

  it("muestra los 4 pasos de Como Usar la Plataforma", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Usa el menú lateral para navegar entre módulos.")).toBeInTheDocument();
    expect(screen.getByText("Revisa el calendario de clases y eventos.")).toBeInTheDocument();
    expect(screen.getByText("Descarga los recursos disponibles.")).toBeInTheDocument();
    expect(screen.getByText("Contacta a soporte si tienes dudas.")).toBeInTheDocument();
  });

  it("los accesos rapidos enlazan a las 4 rutas correctas", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "Grupos de WhatsApp" })).toHaveAttribute(
      "href",
      "/herramientas"
    );
    expect(screen.getByRole("link", { name: "Calendario de Clases" })).toHaveAttribute(
      "href",
      "/calendario"
    );
    expect(screen.getByRole("link", { name: "Recursos de Ventas" })).toHaveAttribute(
      "href",
      "/marketing"
    );
    expect(screen.getByRole("link", { name: "Soporte" })).toHaveAttribute("href", "/soporte");
  });
});
