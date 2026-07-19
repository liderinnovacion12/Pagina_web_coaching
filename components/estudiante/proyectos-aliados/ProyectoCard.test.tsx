import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { ProyectoCard } from "./ProyectoCard";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

const useInViewMock = vi.fn().mockReturnValue(false);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: (...args: unknown[]) => useInViewMock(...args),
  };
});

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

describe("ProyectoCard", () => {
  afterEach(() => {
    useInViewMock.mockClear();
    useInViewMock.mockReturnValue(false);
  });

  it("muestra título, precio, descripción, contacto y el link de WhatsApp", () => {
    const proyecto = crearProyecto({ id: "p1", nombre: "Domus" });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Desde $500K")).toBeInTheDocument();
    expect(screen.getByText("Descripción de prueba.")).toBeInTheDocument();
    expect(screen.getByText(/Contacto Prueba/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /unirse al grupo de whatsapp/i })
    ).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
  });

  it("no muestra el precio si precioDesde es null", () => {
    const proyecto = crearProyecto({
      id: "p2",
      nombre: "Elle Residences",
      precioDesde: null,
    });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(screen.queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });

  it("usa el contenedor de scroll como root y angosta la zona de medición al centro", () => {
    const proyecto = crearProyecto({ id: "p3", nombre: "Cualquiera" });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        root: containerRef,
        margin: "0px -35% 0px -35%",
        amount: 0.6,
      })
    );
  });
});
