import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProyectosAliadosGrid } from "./ProyectosAliadosGrid";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

function crearProyecto(
  overrides: Partial<ProyectoAliado> & { id: string; nombre: string }
): ProyectoAliado {
  return {
    descripcion: "Descripción de prueba.",
    precioDesde: "Desde $500K",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    whatsappUrl: "https://chat.whatsapp.com/prueba",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const PROYECTOS: ProyectoAliado[] = [
  crearProyecto({ id: "p1", nombre: "Domus" }),
  crearProyecto({ id: "p2", nombre: "Elle Residences", precioDesde: null }),
];

describe("ProyectosAliadosGrid", () => {
  it("renderiza una tarjeta por cada proyecto", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Elle Residences")).toBeInTheDocument();
  });

  it("muestra el badge de precio solo si precioDesde no es null", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getAllByText(/^Desde \$/)).toHaveLength(1);
  });

  it("el link de WhatsApp usa la URL correcta y abre en una pestaña nueva", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const links = screen.getAllByRole("link", { name: /unirse al grupo de whatsapp/i });
    expect(links[0]).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("muestra la comisión regular y la del equipo", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText(/comisión regular/i)).toBeInTheDocument();
    expect(screen.getByText(/comisión para el equipo/i)).toBeInTheDocument();
  });

  it("tiene botones de navegación con su aria-label", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByRole("button", { name: "Proyecto anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proyecto siguiente" })).toBeInTheDocument();
  });

  it("el botón 'Proyecto anterior' en la primera tarjeta centra la última (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const cards = Array.from(scrollContainer.children) as HTMLDivElement[];
    expect(cards).toHaveLength(3);

    const CARD_WIDTH = 320;
    const GAP = 24;
    Object.defineProperty(scrollContainer, "clientWidth", {
      configurable: true,
      value: CARD_WIDTH,
    });
    Object.defineProperty(scrollContainer, "scrollLeft", {
      configurable: true,
      value: 0,
      writable: true,
    });
    cards.forEach((card, i) => {
      Object.defineProperty(card, "offsetLeft", {
        configurable: true,
        value: i * (CARD_WIDTH + GAP),
      });
      Object.defineProperty(card, "offsetWidth", {
        configurable: true,
        value: CARD_WIDTH,
      });
    });
    scrollContainer.scrollTo = vi.fn();

    // Fuerza el recálculo de intensidades con la geometría mockeada de arriba.
    // La tarjeta centrada resultante (scrollLeft=0) es la primera (índice 0).
    fireEvent(window, new Event("resize"));

    fireEvent.click(screen.getByRole("button", { name: "Proyecto anterior" }));

    const centroUltima = cards[2].offsetLeft + cards[2].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroUltima - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("el botón 'Proyecto siguiente' en la última tarjeta centra la primera (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const cards = Array.from(scrollContainer.children) as HTMLDivElement[];

    const CARD_WIDTH = 320;
    const GAP = 24;
    Object.defineProperty(scrollContainer, "clientWidth", {
      configurable: true,
      value: CARD_WIDTH,
    });
    cards.forEach((card, i) => {
      Object.defineProperty(card, "offsetLeft", {
        configurable: true,
        value: i * (CARD_WIDTH + GAP),
      });
      Object.defineProperty(card, "offsetWidth", {
        configurable: true,
        value: CARD_WIDTH,
      });
    });
    const centroUltima = cards[2].offsetLeft + cards[2].offsetWidth / 2;
    Object.defineProperty(scrollContainer, "scrollLeft", {
      configurable: true,
      value: centroUltima - CARD_WIDTH / 2,
      writable: true,
    });
    scrollContainer.scrollTo = vi.fn();

    // Fuerza el recálculo: con scrollLeft alineado al centro de la última
    // tarjeta, la tarjeta centrada resultante es la última (índice 2).
    fireEvent(window, new Event("resize"));

    fireEvent.click(screen.getByRole("button", { name: "Proyecto siguiente" }));

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: "smooth",
    });
  });
});
