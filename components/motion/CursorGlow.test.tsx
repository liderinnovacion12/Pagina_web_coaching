import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { CursorGlow } from "./CursorGlow";

const useReducedMotionSafeMock = vi.fn();

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

function mockMatchMedia(matches: boolean) {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })) as unknown as typeof window.matchMedia;
}

describe("CursorGlow", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("no renderiza nada si el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    mockMatchMedia(true);
    render(<CursorGlow />);
    expect(screen.queryByTestId("cursor-glow-layer")).not.toBeInTheDocument();
  });

  it("no renderiza nada en dispositivos sin cursor fino (touch)", () => {
    useReducedMotionSafeMock.mockReturnValue(false);
    mockMatchMedia(false);
    render(<CursorGlow />);
    expect(screen.queryByTestId("cursor-glow-layer")).not.toBeInTheDocument();
  });

  it("renderiza la capa de glow con cursor fino y sin reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(false);
    mockMatchMedia(true);
    render(<CursorGlow />);
    expect(screen.getByTestId("cursor-glow-layer")).toBeInTheDocument();
  });
});
