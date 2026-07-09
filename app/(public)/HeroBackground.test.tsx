import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroBackground } from "./HeroBackground";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("HeroBackground", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza las tres capas de parallax (fondo, medio, frente)", () => {
    render(<HeroBackground />);
    expect(screen.getByTestId("hero-background")).toBeInTheDocument();
    expect(screen.getByTestId("hero-layer-back")).toBeInTheDocument();
    expect(screen.getByTestId("hero-layer-mid")).toBeInTheDocument();
    expect(screen.getByTestId("hero-layer-front")).toBeInTheDocument();
  });

  it("no rompe el render cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<HeroBackground />);
    expect(screen.getByTestId("hero-background")).toBeInTheDocument();
  });
});
