import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollReveal } from "./ScrollReveal";

const useInViewMock = vi.fn().mockReturnValue(true);
const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: (...args: unknown[]) => useInViewMock(...args),
  };
});

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("ScrollReveal", () => {
  afterEach(() => {
    useInViewMock.mockClear();
    useInViewMock.mockReturnValue(true);
    useReducedMotionSafeMock.mockClear();
    useReducedMotionSafeMock.mockReturnValue(false);
  });

  it("renderiza sus children", () => {
    render(
      <ScrollReveal variants={{}}>
        <p>Contenido de prueba</p>
      </ScrollReveal>
    );
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("aplica el className recibido al contenedor", () => {
    const { container } = render(
      <ScrollReveal variants={{}} className="grid gap-6">
        <span>x</span>
      </ScrollReveal>
    );
    expect(container.firstElementChild).toHaveClass("grid", "gap-6");
  });

  it("no requiere children (uso decorativo, ej. un separador)", () => {
    const { container } = render(
      <ScrollReveal variants={{}} className="my-2 border-t" />
    );
    expect(container.firstElementChild).toHaveClass("my-2", "border-t");
  });

  it("usa once=true por defecto cuando no se especifica", () => {
    render(
      <ScrollReveal variants={{}}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ once: true })
    );
  });

  it("pasa once=false a useInView cuando se especifica", () => {
    render(
      <ScrollReveal variants={{}} once={false}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ once: false })
    );
  });

  it("marca el contenedor inert cuando el contenido no esta en vista", () => {
    useInViewMock.mockReturnValue(false);
    const { container } = render(
      <ScrollReveal variants={{}}>
        <a href="/test">enlace</a>
      </ScrollReveal>
    );
    expect(container.firstElementChild).toHaveAttribute("inert");
  });

  it("no marca el contenedor inert cuando el contenido esta en vista", () => {
    useInViewMock.mockReturnValue(true);
    const { container } = render(
      <ScrollReveal variants={{}}>
        <a href="/test">enlace</a>
      </ScrollReveal>
    );
    expect(container.firstElementChild).not.toHaveAttribute("inert");
  });

  it("se muestra de inmediato y no queda inert cuando el usuario prefiere reduced motion, sin importar el scroll", () => {
    useInViewMock.mockReturnValue(false);
    useReducedMotionSafeMock.mockReturnValue(true);
    const { container } = render(
      <ScrollReveal variants={{}}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(container.firstElementChild).not.toHaveAttribute("inert");
  });

  it("respeta useInView cuando el usuario no prefiere reduced motion", () => {
    useInViewMock.mockReturnValue(false);
    useReducedMotionSafeMock.mockReturnValue(false);
    const { container } = render(
      <ScrollReveal variants={{}}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(container.firstElementChild).toHaveAttribute("inert");
  });
});
