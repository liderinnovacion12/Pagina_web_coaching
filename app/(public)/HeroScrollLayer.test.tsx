import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroScrollLayer } from "./HeroScrollLayer";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("HeroScrollLayer", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza fondo, partículas y contenido dentro del contenedor de scroll", () => {
    render(
      <HeroScrollLayer
        background={<div data-testid="mock-bg" />}
        particles={<div data-testid="mock-particles" />}
      >
        <div data-testid="mock-content" />
      </HeroScrollLayer>
    );

    expect(screen.getByTestId("hero-scroll-layer")).toBeInTheDocument();
    expect(screen.getByTestId("mock-bg")).toBeInTheDocument();
    expect(screen.getByTestId("mock-particles")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
    expect(screen.getByTestId("mock-bg").parentElement).toHaveClass(
      "absolute",
      "inset-0"
    );
  });

  it("no rompe el render cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);

    render(
      <HeroScrollLayer
        background={<div data-testid="mock-bg" />}
        particles={<div data-testid="mock-particles" />}
      >
        <div data-testid="mock-content" />
      </HeroScrollLayer>
    );

    expect(screen.getByTestId("hero-scroll-layer")).toBeInTheDocument();
    expect(screen.getByTestId("mock-bg")).toBeInTheDocument();
    expect(screen.getByTestId("mock-particles")).toBeInTheDocument();
    expect(screen.getByTestId("mock-content")).toBeInTheDocument();
  });
});
