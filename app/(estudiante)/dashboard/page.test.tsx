import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const getMiembrosEquipoMock = vi.fn();

vi.mock("@/lib/db/equipo", () => ({
  getMiembrosEquipo: getMiembrosEquipoMock,
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    getMiembrosEquipoMock.mockReset();
    getMiembrosEquipoMock.mockResolvedValue([
      {
        id: "m1",
        nombre: "Wilmar Sosa",
        cargo: "Ventas y Liderazgo",
        descripcionCargo:
          "Agente inmobiliario, top producer y coach en liderazgo y ventas. Ayuda a agentes a fortalecer su influencia, claridad y capacidad de cierre.",
        telefono: "+10000000000",
        correo: "wilmar@example.com",
        fotoUrl: "/images/cultura/wilmar-sosa.jpg",
      },
      {
        id: "m2",
        nombre: "Samuel Oropeza",
        cargo: "Marketing e Inteligencia Artificial",
        descripcionCargo:
          "Agente inmobiliario, coach en mercadeo, ventas y crecimiento de equipos. Especialista en sistemas y automatizaciones que generan prospectos.",
        telefono: "+10000000001",
        correo: "samuel@example.com",
        fotoUrl: "/images/cultura/samuel-oropeza.jpg",
      },
    ]);
  });

  it("muestra el encabezado de bienvenida", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(
      screen.getByRole("heading", { level: 1, name: "Bienvenido a Team 100% Real Estate" })
    ).toBeInTheDocument();
    expect(screen.getByText("by Wilmar Sosa y Samuel Oropeza")).toBeInTheDocument();
  });

  it("embebe el video de bienvenida de Loom", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    const iframe = screen.getByTitle("Video de bienvenida — Team 100% Real Estate");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
    );
  });

  it("el boton de WhatsApp enlaza a /herramientas", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(
      screen.getByRole("link", { name: /únete a los grupos y comunidades de whatsapp/i })
    ).toHaveAttribute("href", "/herramientas");
  });

  it("muestra los 4 pasos de Como Usar la Plataforma", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByText("Usa el menú lateral para navegar entre módulos.")).toBeInTheDocument();
    expect(screen.getByText("Revisa el calendario de clases y eventos.")).toBeInTheDocument();
    expect(screen.getByText("Descarga los recursos disponibles.")).toBeInTheDocument();
    expect(screen.getByText("Contacta a soporte si tienes dudas.")).toBeInTheDocument();
  });

  it("los accesos rapidos enlazan a las 4 rutas correctas", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

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

  it("muestra el encabezado de Cultura y Equipo", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByRole("heading", { level: 2, name: "Cultura y Equipo" })).toBeInTheDocument();
    expect(
      screen.getByText("Conoce a los líderes y los principios que nos guían.")
    ).toBeInTheDocument();
  });

  it("muestra una tarjeta por cada miembro del equipo con su telefono clicable", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByRole("heading", { level: 3, name: "Wilmar Sosa" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Samuel Oropeza" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+10000000000" })).toHaveAttribute(
      "href",
      "tel:+10000000000"
    );
    expect(screen.getByRole("link", { name: "+10000000001" })).toHaveAttribute(
      "href",
      "tel:+10000000001"
    );
  });

  it("muestra la Mision, la Vision y los 4 valores", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(screen.getByRole("heading", { name: "Nuestra Misión" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Nuestra Visión" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Integridad" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Compromiso" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Colaboración" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Excelencia" })).toBeInTheDocument();
  });

  it("muestra la frase destacada de la Filosofia de Equipo", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    expect(
      screen.getByText(
        "Aquí no estamos solo para recibir información. Estamos para dar, aportar y sumar valor al equipo."
      )
    ).toBeInTheDocument();
  });

  it("muestra las 8 fotos de la Galeria del Equipo", async () => {
    const DashboardPage = (await import("./page")).default;
    render(await DashboardPage());

    const fotos = screen.getAllByAltText("Foto del equipo Team 100% Real Estate");
    expect(fotos).toHaveLength(8);
  });
});
