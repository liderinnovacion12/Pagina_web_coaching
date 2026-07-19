import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
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

function tarjetasReales(container: HTMLElement): HTMLElement[] {
  const scrollContainer = container.querySelector(".overflow-x-auto");
  if (!scrollContainer) throw new Error("scroll container no encontrado");
  return Array.from(scrollContainer.children).filter(
    (card): card is HTMLElement => !card.hasAttribute("inert")
  );
}

function mockearGeometria(
  scrollContainer: HTMLElement,
  anchoTarjeta: number,
  gap: number
): HTMLElement[] {
  const todasLasTarjetas = Array.from(scrollContainer.children) as HTMLElement[];
  Object.defineProperty(scrollContainer, "clientWidth", {
    configurable: true,
    value: anchoTarjeta,
  });
  todasLasTarjetas.forEach((card, i) => {
    Object.defineProperty(card, "offsetLeft", {
      configurable: true,
      value: i * (anchoTarjeta + gap),
    });
    Object.defineProperty(card, "offsetWidth", {
      configurable: true,
      value: anchoTarjeta,
    });
  });
  return todasLasTarjetas;
}

function mockearScrollLeft(scrollContainer: HTMLElement, valorInicial: number): () => number {
  let actual = valorInicial;
  Object.defineProperty(scrollContainer, "scrollLeft", {
    configurable: true,
    get: () => actual,
    set: (v: number) => {
      actual = v;
    },
  });
  return () => actual;
}

describe("ProyectosAliadosGrid", () => {
  it("renderiza una tarjeta real por cada proyecto (mas las copias clonadas para el loop)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    expect(scrollContainer.children).toHaveLength(6); // 3 segmentos x 2 proyectos

    const reales = tarjetasReales(container);
    expect(reales).toHaveLength(2);
    expect(reales[0]).toHaveTextContent("Domus");
    expect(reales[1]).toHaveTextContent("Elle Residences");
  });

  it("muestra el precio solo si precioDesde no es null (en la copia real)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const reales = tarjetasReales(container);
    expect(within(reales[0]).getByText(/^Desde \$/)).toBeInTheDocument();
    expect(within(reales[1]).queryByText(/^Desde \$/)).not.toBeInTheDocument();
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

  it("las copias clonadas quedan inert (fuera del teclado/lector de pantalla)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const todas = Array.from(scrollContainer.children) as HTMLElement[];
    const inert = todas.filter((el) => el.hasAttribute("inert"));
    const noInert = todas.filter((el) => !el.hasAttribute("inert"));
    expect(inert).toHaveLength(4); // 2 segmentos clon x 2 proyectos
    expect(noInert).toHaveLength(2); // segmento real x 2 proyectos
  });

  it("el botón 'Proyecto anterior' en la primera tarjeta real centra la última tarjeta real (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    expect(reales).toHaveLength(3);

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    mockearScrollLeft(scrollContainer, centroPrimeraReal - CARD_WIDTH / 2);
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));
    fireEvent.click(screen.getByRole("button", { name: "Proyecto anterior" }));

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroUltimaReal - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("el botón 'Proyecto siguiente' en la última tarjeta real centra la primera tarjeta real (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    mockearScrollLeft(scrollContainer, centroUltimaReal - CARD_WIDTH / 2);
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));
    fireEvent.click(screen.getByRole("button", { name: "Proyecto siguiente" }));

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroPrimeraReal - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("si la tarjeta centrada cae en un clon 'después', el scroll se reposiciona silenciosamente a la copia real equivalente", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    const todas = mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    // El primer clon "después" es la tarjeta inmediatamente siguiente a las 3 reales.
    const indiceUltimaReal = todas.indexOf(reales[2]);
    const primerClonDespues = todas[indiceUltimaReal + 1];

    const centroClonDespues = primerClonDespues.offsetLeft + primerClonDespues.offsetWidth / 2;
    const leerScrollLeft = mockearScrollLeft(
      scrollContainer,
      centroClonDespues - CARD_WIDTH / 2
    );
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    expect(leerScrollLeft()).toBeCloseTo(centroPrimeraReal - CARD_WIDTH / 2);
  });

  it("si la tarjeta centrada cae en un clon 'antes', el scroll se reposiciona silenciosamente a la copia real equivalente", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    const todas = mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    // El último clon "antes" (el de p3) es la tarjeta inmediatamente previa a las 3 reales.
    const indicePrimeraReal = todas.indexOf(reales[0]);
    const ultimoClonAntes = todas[indicePrimeraReal - 1];

    const centroClonAntes = ultimoClonAntes.offsetLeft + ultimoClonAntes.offsetWidth / 2;
    const leerScrollLeft = mockearScrollLeft(
      scrollContainer,
      centroClonAntes - CARD_WIDTH / 2
    );
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    expect(leerScrollLeft()).toBeCloseTo(centroUltimaReal - CARD_WIDTH / 2);
  });
});
