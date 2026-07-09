import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParticleField } from "./ParticleField";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("ParticleField", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza el canvas del vórtice de partículas", () => {
    render(<ParticleField />);
    expect(screen.getByTestId("particle-field-canvas")).toBeInTheDocument();
  });

  it("no renderiza nada si el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<ParticleField />);
    expect(
      screen.queryByTestId("particle-field-canvas")
    ).not.toBeInTheDocument();
  });
});
