import { describe, it, expect, vi, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { HorizontalIntroPanels } from "./HorizontalIntroPanels";

const useIsDesktopMock = vi.fn().mockReturnValue(false);
const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);
const useMotionValueEventMock = vi.fn();

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useMotionValueEvent: (...args: unknown[]) =>
      useMotionValueEventMock(...args),
  };
});

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useIsDesktop: () => useIsDesktopMock(),
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("HorizontalIntroPanels", () => {
  afterEach(() => {
    useIsDesktopMock.mockClear();
    useIsDesktopMock.mockReturnValue(false);
    useReducedMotionSafeMock.mockClear();
    useReducedMotionSafeMock.mockReturnValue(false);
    useMotionValueEventMock.mockClear();
  });

  it("renderiza el layout vertical cuando no es desktop", () => {
    useIsDesktopMock.mockReturnValue(false);
    render(<HorizontalIntroPanels />);
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bienvenido a Team 100% Real Estate",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("Video de bienvenida — Team 100% Real Estate")
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("horizontal-intro-runway")
    ).not.toBeInTheDocument();
  });

  it("renderiza el layout vertical cuando prefiere reduced motion, aunque sea desktop", () => {
    useIsDesktopMock.mockReturnValue(true);
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<HorizontalIntroPanels />);
    expect(
      screen.queryByTestId("horizontal-intro-runway")
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1 })
    ).toBeInTheDocument();
  });

  it("renderiza los paneles horizontales en desktop sin reduced motion", () => {
    useIsDesktopMock.mockReturnValue(true);
    useReducedMotionSafeMock.mockReturnValue(false);
    render(<HorizontalIntroPanels />);
    expect(screen.getByTestId("horizontal-intro-runway")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Bienvenido a Team 100% Real Estate",
      })
    ).toBeInTheDocument();
    expect(
      screen.getByTitle("Video de bienvenida — Team 100% Real Estate")
    ).toBeInTheDocument();
  });

  it("el panel de video queda inert mientras el progreso de scroll está antes de la mitad", () => {
    useIsDesktopMock.mockReturnValue(true);
    useReducedMotionSafeMock.mockReturnValue(false);
    render(<HorizontalIntroPanels />);

    const registeredCallback = useMotionValueEventMock.mock.calls[0][2] as (
      value: number
    ) => void;

    act(() => registeredCallback(0.2));
    expect(screen.getByTestId("horizontal-intro-video-panel")).toHaveAttribute(
      "inert"
    );

    act(() => registeredCallback(0.8));
    expect(
      screen.getByTestId("horizontal-intro-video-panel")
    ).not.toHaveAttribute("inert");
  });
});
