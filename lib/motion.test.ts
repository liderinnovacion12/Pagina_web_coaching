import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

const useReducedMotionMock = vi.fn();

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useReducedMotion: () => useReducedMotionMock(),
  };
});

import {
  EASE_OUT,
  fadeUp,
  fadeIn,
  staggerContainer,
  SCROLL_REVEAL_VIEWPORT,
  useReducedMotionSafe,
  useIsDesktop,
  revealUp,
  revealSlideLeft,
  revealSlideRight,
} from "./motion";

describe("variantes de motion", () => {
  it("fadeUp parte invisible/desplazado y usa el easing del proyecto", () => {
    expect(fadeUp.hidden).toEqual({ opacity: 0, transform: "translateY(18px)" });
    expect(fadeUp.visible).toMatchObject({
      opacity: 1,
      transform: "translateY(0px)",
      transition: { duration: 0.6, ease: EASE_OUT },
    });
  });

  it("fadeIn solo anima opacidad", () => {
    expect(fadeIn.hidden).toEqual({ opacity: 0 });
    expect(fadeIn.visible).toMatchObject({ opacity: 1 });
  });

  it("staggerContainer usa 60ms de stagger por defecto (dentro del rango 30-80ms)", () => {
    const variant = staggerContainer();
    expect(variant.visible).toMatchObject({
      transition: { staggerChildren: 0.06, delayChildren: 0 },
    });
  });

  it("staggerContainer acepta overrides de stagger y delay", () => {
    const variant = staggerContainer(0.08, 0.1);
    expect(variant.visible).toMatchObject({
      transition: { staggerChildren: 0.08, delayChildren: 0.1 },
    });
  });

  it("SCROLL_REVEAL_VIEWPORT dispara una sola vez con margen negativo", () => {
    expect(SCROLL_REVEAL_VIEWPORT).toEqual({ once: true, margin: "-5% 0px" });
  });

  it("revealUp parte invisible/desplazado con blur y usa el easing del proyecto", () => {
    expect(revealUp.hidden).toEqual({ opacity: 0, y: 25, filter: "blur(4px)" });
    expect(revealUp.visible).toMatchObject({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: EASE_OUT },
    });
  });

  it("revealSlideLeft entra desde la izquierda con blur pronunciado, sin rotación", () => {
    expect(revealSlideLeft.hidden).toEqual({
      opacity: 0,
      x: -130,
      filter: "blur(10px)",
    });
    expect(revealSlideLeft.visible).toMatchObject({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });

  it("revealSlideRight entra desde la derecha con blur pronunciado, sin rotación", () => {
    expect(revealSlideRight.hidden).toEqual({
      opacity: 0,
      x: 130,
      filter: "blur(10px)",
    });
    expect(revealSlideRight.visible).toMatchObject({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });
});

describe("useReducedMotionSafe", () => {
  it("devuelve false si framer-motion aún no determinó la preferencia (null)", () => {
    useReducedMotionMock.mockReturnValue(null);
    const { result } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(false);
  });

  it("devuelve true cuando el usuario prefiere reduced motion", () => {
    useReducedMotionMock.mockReturnValue(true);
    const { result } = renderHook(() => useReducedMotionSafe());
    expect(result.current).toBe(true);
  });
});

describe("useIsDesktop", () => {
  function mockMatchMedia(matches: boolean) {
    const listeners: Array<(event: MediaQueryListEvent) => void> = [];
    const mql = {
      matches,
      addEventListener: (
        _event: string,
        cb: (event: MediaQueryListEvent) => void
      ) => {
        listeners.push(cb);
      },
      removeEventListener: vi.fn(),
    };
    const matchMediaMock = vi.fn().mockReturnValue(mql);
    window.matchMedia = matchMediaMock as unknown as typeof window.matchMedia;
    return { listeners, matchMediaMock };
  }

  it("devuelve false cuando el viewport es menor al breakpoint desktop", () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);
  });

  it("devuelve true cuando el viewport es igual o mayor al breakpoint desktop", () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(true);
  });

  it("consulta el breakpoint de 1024px", () => {
    const { matchMediaMock } = mockMatchMedia(false);
    renderHook(() => useIsDesktop());
    expect(matchMediaMock).toHaveBeenCalledWith("(min-width: 1024px)");
  });

  it("actualiza el valor cuando cambia el tamaño del viewport", () => {
    const { listeners } = mockMatchMedia(false);
    const { result } = renderHook(() => useIsDesktop());
    expect(result.current).toBe(false);

    act(() => {
      listeners.forEach((cb) =>
        cb({ matches: true } as MediaQueryListEvent)
      );
    });
    expect(result.current).toBe(true);
  });
});
