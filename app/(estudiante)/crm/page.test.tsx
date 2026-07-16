import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CrmPage from "./page";

describe("CrmPage", () => {
  it("muestra el título y subtítulo", () => {
    render(<CrmPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "CRM para Agentes Inmobiliarios" })
    ).toBeInTheDocument();
    expect(
      screen.getByText("GoHighLevel – Domina el sistema para gestionar tus leads")
    ).toBeInTheDocument();
  });

  it("muestra el párrafo de la alianza estratégica", () => {
    render(<CrmPage />);

    expect(
      screen.getByText(/Como agentes del Team Wilmar & Samuel, tenemos acceso al CRM GoHighLevel/)
    ).toBeInTheDocument();
  });

  it("muestra los 5 beneficios", () => {
    render(<CrmPage />);

    expect(screen.getByText("CRM con plantillas preconfiguradas")).toBeInTheDocument();
    expect(screen.getByText("Automatizaciones listas para usar")).toBeInTheDocument();
    expect(screen.getByText("Flujos diseñados para agentes inmobiliarios")).toBeInTheDocument();
    expect(screen.getByText("Grabaciones y entrenamientos semanales")).toBeInTheDocument();
    expect(screen.getByText("Soporte y acompañamiento")).toBeInTheDocument();
  });

  it("muestra el precio regular tachado y el precio preferencial", () => {
    render(<CrmPage />);

    expect(screen.getByText("$97/mes")).toBeInTheDocument();
    expect(screen.getByText(/\$77/)).toBeInTheDocument();
  });

  it("el enlace de recorrido de la plataforma abre en una pestaña nueva", () => {
    render(<CrmPage />);

    const link = screen.getByRole("link", { name: /Ver recorrido de la plataforma/ });
    expect(link).toHaveAttribute("href", "https://gohighlevel.samueloropeza.com/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("el enlace para abrir la cuenta de CRM abre en una pestaña nueva", () => {
    render(<CrmPage />);

    const link = screen.getByRole("link", { name: "Abrir mi cuenta de CRM" });
    expect(link).toHaveAttribute("href", "https://gohighlevelscrm.com/crm");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
