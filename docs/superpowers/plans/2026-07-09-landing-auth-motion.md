# Motion y presentación premium — Landing + Auth (Fase 1) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Elevate the public landing page and the auth pages (login, registro,
recuperar-password, actualizar-password) with Apple/Cursor/Linear-inspired
motion — layered scroll parallax, a cursor-reactive glow, a scroll-aware
header, staggered reveals, and a soft cross-fade between routes — without
adding new landing content sections.

**Architecture:** A small shared motion layer (`lib/motion.ts` for variants
and a reduced-motion-safe hook, `components/motion/CursorGlow.tsx` for the
cursor spotlight, `components/SiteHeader.tsx` for the scroll-aware header)
gets consumed by the existing landing (`app/(public)/page.tsx`,
`HeroBackground.tsx`, `CatalogoList.tsx`) and auth (`login/`, `registro/`,
`recuperar-password/`, `actualizar-password/`) components. Everything is
built on Framer Motion, already a project dependency.

**Tech Stack:** Next.js 15 (App Router), React 19, Framer Motion 12,
Tailwind CSS, Vitest + Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-07-09-landing-auth-motion-design.md`

---

## Task 1: Test environment polyfills for ResizeObserver/IntersectionObserver

Framer Motion's `useScroll`, `whileInView`, and `layoutId` features rely on
`ResizeObserver`/`IntersectionObserver`, neither of which jsdom implements.
Every later task's tests depend on this. This must land first.

**Files:**
- Modify: `vitest.setup.ts`

- [ ] **Step 1: Verify the gap exists**

Run: `npx vitest run app/\(public\)/CatalogoList.test.tsx`
Expected: PASS (current tests don't yet exercise Framer Motion's
observer-based features, so this just confirms the baseline is green before
you touch anything).

- [ ] **Step 2: Add the polyfills**

Replace the full contents of `vitest.setup.ts` with:

```ts
import "@testing-library/jest-dom/vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

class IntersectionObserverStub implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin: string = "";
  readonly thresholds: ReadonlyArray<number> = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof globalThis.IntersectionObserver === "undefined") {
  globalThis.IntersectionObserver =
    IntersectionObserverStub as unknown as typeof IntersectionObserver;
}
```

- [ ] **Step 3: Confirm the suite still passes**

Run: `npm run test`
Expected: PASS (all existing tests, unchanged behavior — this step only adds
missing globals, it doesn't change any component).

- [ ] **Step 4: Commit**

```bash
git add vitest.setup.ts
git commit -m "test: agrega polyfills de ResizeObserver/IntersectionObserver para Framer Motion"
```

---

## Task 2: Generate visual references with imagegen-frontend-web

Per the spec, fix concrete visual direction before writing motion code for
the Hero, Catálogo, and Auth branding panel. This task has no code — it
produces reference images used to judge the implementation in later tasks.

- [ ] **Step 1: Invoke the imagegen-frontend-web skill**

Call the Skill tool with `skill: "imagegen-frontend-web"` and generate one
horizontal reference image per section below (three images total, per the
skill's one-image-per-section rule). Use this brief for all three, adjusted
per section:

> Brand: "TEAM 100% REAL ESTATE" — executive coaching platform. Palette:
> near-black ink background (`#07070b`–`#0b0b12`), gold accents
> (`#d9a94e`–`#f0d38a`), cool grey-blue "mist" text (`#6b7385`–`#aab1c4`).
> Display typeface: Bricolage Grotesque (bold, geometric). Mono accents:
> IBM Plex Mono, uppercase, tracked. Tone: confident, exclusive, editorial,
> executive-premium — not SaaS-cream, not generic blue/grey dashboard.
> Direction: Apple/Linear/Cursor-inspired — generous negative space, subtle
> depth via layered fine-line geometry (not photography, not 3D), a soft
> gold radial glow that suggests cursor-reactive light, crisp typography
> hierarchy.

  1. **Hero** — full-bleed dark hero, large "Transforma tu Liderazgo"
     headline (gold gradient on "Liderazgo"), a small uppercase mono badge
     above it, two CTAs (solid gold primary, outlined gold secondary), a row
     of 3 stats below. Background: fine diagonal line geometry with a subtle
     layered/parallax feel (some lines closer, some farther, implied depth)
     and a soft gold glow positioned as if following a cursor near the
     headline.
  2. **Catálogo de cursos** — a heading + subhead over a 3-column grid of
     course cards on the same ink background; one card shown mid-hover with
     a raised shadow and a thin gold gradient border to communicate the
     hover state; other cards flat/resting for contrast.
  3. **Auth branding panel** — a tall narrow panel (roughly 1:2 aspect, as
     it will sit beside a login form), same fine-line geometry as the Hero
     but composed vertically, wordmark at top, a short inspirational
     headline + one line of body copy anchored lower, a soft gold glow in
     one corner.

- [ ] **Step 2: Review the three images against the spec**

Confirm each image reads as "the same site" (identical palette, type
personality, and line-geometry language) before proceeding — if any image
drifts from the brief (adds photography, changes the palette, adds a section
not requested), regenerate that image only.

No commit for this task (no repo files change).

---

## Task 3: Shared motion utilities (`lib/motion.ts`)

**Files:**
- Create: `lib/motion.ts`
- Test: `lib/motion.test.ts`

- [ ] **Step 1: Write the failing test**

Create `lib/motion.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

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
    expect(SCROLL_REVEAL_VIEWPORT).toEqual({ once: true, margin: "-10% 0px" });
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL with "Cannot find module './motion'" (or similar — the file
doesn't exist yet).

- [ ] **Step 3: Implement `lib/motion.ts`**

```ts
import { useReducedMotion, type Variants } from "framer-motion";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: {
    opacity: 1,
    transform: "translateY(0px)",
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: EASE_OUT } },
};

export function staggerContainer(
  staggerChildren = 0.06,
  delayChildren = 0
): Variants {
  return {
    hidden: {},
    visible: {
      transition: { staggerChildren, delayChildren },
    },
  };
}

export const SCROLL_REVEAL_VIEWPORT = {
  once: true,
  margin: "-10% 0px",
} as const;

export function useReducedMotionSafe(): boolean {
  return useReducedMotion() ?? false;
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS (9 tests)

- [ ] **Step 5: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts
git commit -m "feat(motion): agrega variantes y hook de reduced-motion compartidos"
```

---

## Task 4: Cursor-reactive glow (`CursorGlow`)

**Files:**
- Create: `components/motion/CursorGlow.tsx`
- Test: `components/motion/CursorGlow.test.tsx`

Depends on Task 3 (`lib/motion.ts`).

- [ ] **Step 1: Write the failing test**

Create `components/motion/CursorGlow.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run components/motion/CursorGlow.test.tsx`
Expected: FAIL with "Cannot find module './CursorGlow'".

- [ ] **Step 3: Implement `CursorGlow.tsx`**

```tsx
"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
} from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

const GLOW_SIZE = 480;

export function CursorGlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();
  const [finePointer, setFinePointer] = useState(false);

  const mouseX = useMotionValue(-GLOW_SIZE);
  const mouseY = useMotionValue(-GLOW_SIZE);
  const springX = useSpring(mouseX, { stiffness: 120, damping: 20, mass: 0.5 });
  const springY = useSpring(mouseY, { stiffness: 120, damping: 20, mass: 0.5 });
  const transform = useMotionTemplate`translate3d(${springX}px, ${springY}px, 0)`;

  useEffect(() => {
    const query = window.matchMedia("(hover: hover) and (pointer: fine)");
    setFinePointer(query.matches);

    function handleChange(event: MediaQueryListEvent) {
      setFinePointer(event.matches);
    }

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  function handlePointerMove(event: PointerEvent<HTMLDivElement>) {
    const bounds = containerRef.current?.getBoundingClientRect();
    if (!bounds) return;
    mouseX.set(event.clientX - bounds.left - GLOW_SIZE / 2);
    mouseY.set(event.clientY - bounds.top - GLOW_SIZE / 2);
  }

  if (reducedMotion || !finePointer) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      onPointerMove={handlePointerMove}
      data-testid="cursor-glow-layer"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <motion.div
        aria-hidden="true"
        style={{ width: GLOW_SIZE, height: GLOW_SIZE, transform }}
        className="absolute rounded-full bg-gold-400/10 blur-[100px]"
      />
    </div>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run components/motion/CursorGlow.test.tsx`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add components/motion/CursorGlow.tsx components/motion/CursorGlow.test.tsx
git commit -m "feat(motion): agrega CursorGlow, spotlight dorado que sigue el cursor"
```

---

## Task 5: Layered parallax for `HeroBackground`

**Files:**
- Modify: `app/(public)/HeroBackground.tsx`
- Test: `app/(public)/HeroBackground.test.tsx` (new)

Depends on Task 3.

- [ ] **Step 1: Write the failing test**

Create `app/(public)/HeroBackground.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run "app/(public)/HeroBackground.test.tsx"`
Expected: FAIL — `getByTestId("hero-background")` not found (current
`HeroBackground.tsx` has no test ids and no layer grouping).

- [ ] **Step 3: Implement the layered version**

Replace the full contents of `app/(public)/HeroBackground.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

export function HeroBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const backY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -30]);
  const midY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -60]);
  const frontY = useTransform(scrollYProgress, [0, 1], [0, reducedMotion ? 0 : -110]);

  const backTransform = useMotionTemplate`translate3d(0px, ${backY}px, 0px)`;
  const midTransform = useMotionTemplate`translate3d(0px, ${midY}px, 0px)`;
  const frontTransform = useMotionTemplate`translate3d(0px, ${frontY}px, 0px)`;

  return (
    <div
      ref={containerRef}
      data-testid="hero-background"
      className="pointer-events-none absolute inset-0 h-full w-full animate-drift-slow overflow-hidden"
    >
      <svg
        aria-hidden="true"
        className="h-full w-full"
        viewBox="0 0 1400 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <motion.g
          data-testid="hero-layer-back"
          style={{ transform: backTransform }}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        >
          <path d="M-100 780 L1500 -80" className="text-mist-500/20" />
        </motion.g>

        <motion.g
          data-testid="hero-layer-mid"
          style={{ transform: midTransform }}
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
        >
          <path d="M-100 900 L1200 -100" className="text-gold-500/40" />
          <path d="M200 950 L1500 120" className="text-mist-500/15" />
        </motion.g>

        <motion.g data-testid="hero-layer-front" style={{ transform: frontTransform }}>
          <circle cx="360" cy="360" r="4" className="fill-gold-400" />
          <circle cx="90" cy="640" r="3" className="fill-mist-400/60" />
          <circle cx="1180" cy="150" r="3" className="fill-mist-400/60" />
        </motion.g>
      </svg>
    </div>
  );
}
```

This preserves every path/circle from the original SVG (same coordinates,
same colors), just grouped into three `motion.g` layers that drift at
different speeds as the hero scrolls past — the "profundidad por capas"
from the spec. The existing `animate-drift-slow` ambient loop stays as-is on
the outer container.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run "app/(public)/HeroBackground.test.tsx"`
Expected: PASS (2 tests)

- [ ] **Step 5: Run the full suite to check for regressions**

Run: `npm run test`
Expected: PASS — no other file imports `HeroBackground` yet except
`app/(public)/page.tsx`, which only renders it (no prop/shape changes).

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/HeroBackground.tsx" "app/(public)/HeroBackground.test.tsx"
git commit -m "feat(landing): agrega parallax por capas al fondo del hero"
```

---

## Task 6: Scroll-aware header (`SiteHeader`)

**Files:**
- Create: `components/SiteHeader.tsx`
- Test: `components/SiteHeader.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/SiteHeader.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteHeader } from "./SiteHeader";

describe("SiteHeader", () => {
  it("renderiza el wordmark, el selector de idioma y el link de ingreso", () => {
    render(<SiteHeader />);

    expect(screen.getByTestId("site-header")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /team 100%.*real estate/i })
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Ingresar" })).toHaveAttribute(
      "href",
      "/login"
    );
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run components/SiteHeader.test.tsx`
Expected: FAIL with "Cannot find module './SiteHeader'".

- [ ] **Step 3: Implement `SiteHeader.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion, useMotionTemplate, useScroll, useTransform } from "framer-motion";

export function SiteHeader() {
  const { scrollY } = useScroll();
  const paddingY = useTransform(scrollY, [0, 80], [32, 14]);
  const backgroundAlpha = useTransform(scrollY, [0, 80], [0, 0.72]);
  const borderAlpha = useTransform(scrollY, [0, 80], [0, 0.08]);
  const backgroundColor = useMotionTemplate`rgba(7, 7, 11, ${backgroundAlpha})`;
  const borderColor = useMotionTemplate`rgba(255, 255, 255, ${borderAlpha})`;

  return (
    <motion.header
      data-testid="site-header"
      style={{
        paddingTop: paddingY,
        paddingBottom: paddingY,
        backgroundColor,
        borderColor,
      }}
      className="sticky top-0 z-20 border-b backdrop-blur-xl"
    >
      <div className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-white"
        >
          TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
          <span className="text-gold-400"> •</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 font-mono text-xs text-mist-300">
            <span className="text-white">ES</span>
            <span className="text-mist-500">|</span>
            <span>EN</span>
          </div>
          <Link
            href="/login"
            className="rounded-full border border-gold-500/60 px-4 py-1.5 text-sm font-medium text-gold-300 transition hover:bg-gold-500/10"
          >
            Ingresar
          </Link>
        </div>
      </div>
    </motion.header>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run components/SiteHeader.test.tsx`
Expected: PASS (1 test)

- [ ] **Step 5: Commit**

```bash
git add components/SiteHeader.tsx components/SiteHeader.test.tsx
git commit -m "feat(landing): agrega SiteHeader que se compacta al hacer scroll"
```

---

## Task 7: Orchestrated hero content (`HeroContent`) and wiring into `page.tsx`

**Files:**
- Create: `app/(public)/HeroContent.tsx`
- Test: `app/(public)/HeroContent.test.tsx`
- Modify: `app/(public)/page.tsx`

Depends on Tasks 3, 5, 6.

- [ ] **Step 1: Write the failing test**

Create `app/(public)/HeroContent.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { HeroContent } from "./HeroContent";

describe("HeroContent", () => {
  it("renderiza el titular, los CTAs y las estadísticas recibidas", () => {
    render(
      <HeroContent estadisticas={[{ valor: "2,000+", etiqueta: "Líderes" }]} />
    );

    expect(screen.getByText("Transforma tu")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Comenzar ahora" })
    ).toHaveAttribute("href", "/registro");
    expect(
      screen.getByRole("link", { name: "Ver metodología" })
    ).toHaveAttribute("href", "#cursos");
    expect(screen.getByText("2,000+")).toBeInTheDocument();
    expect(screen.getByText("Líderes")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run "app/(public)/HeroContent.test.tsx"`
Expected: FAIL with "Cannot find module './HeroContent'".

- [ ] **Step 3: Implement `HeroContent.tsx`**

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

type Estadistica = { valor: string; etiqueta: string };

export function HeroContent({
  estadisticas,
}: {
  estadisticas: Estadistica[];
}) {
  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.1)}
      className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20"
    >
      <motion.span
        variants={fadeUp}
        className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gold-300"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400" />
        Coaching Executive Platform
      </motion.span>

      <motion.h1
        variants={fadeUp}
        className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl"
      >
        Transforma tu
        <br />
        <span className="text-gradient-gold">Liderazgo</span>
      </motion.h1>

      <motion.p
        variants={fadeUp}
        className="mt-6 max-w-xl text-balance text-lg text-mist-400"
      >
        Plataforma de coaching ejecutivo para líderes que buscan impacto
        real. Aprende de los mejores, donde estés.
      </motion.p>

      <motion.div variants={fadeUp} className="mt-10 flex flex-col gap-4 sm:flex-row">
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/registro"
            className="block rounded-lg bg-gold-500 px-7 py-3 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors hover:bg-gold-400"
          >
            Comenzar ahora
          </Link>
        </motion.div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="#cursos"
            className="block rounded-lg border border-gold-500/50 px-7 py-3 font-semibold text-gold-300 transition hover:bg-gold-500/10"
          >
            Ver metodología
          </Link>
        </motion.div>
      </motion.div>

      <motion.dl variants={fadeUp} className="mt-16 flex gap-10 sm:gap-16">
        {estadisticas.map((stat) => (
          <div key={stat.etiqueta}>
            <dt className="sr-only">{stat.etiqueta}</dt>
            <dd className="font-mono text-3xl font-semibold text-gold-400">
              {stat.valor}
            </dd>
            <p className="mt-1 text-sm text-mist-500">{stat.etiqueta}</p>
          </div>
        ))}
      </motion.dl>
    </motion.section>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run "app/(public)/HeroContent.test.tsx"`
Expected: PASS (1 test)

- [ ] **Step 5: Wire `SiteHeader` and `HeroContent` into `page.tsx`**

Replace the full contents of `app/(public)/page.tsx`:

```tsx
import { getCursosPublicados } from "@/lib/db/cursos";
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { SiteHeader } from "@/components/SiteHeader";

const ESTADISTICAS = [
  { valor: "2,000+", etiqueta: "Líderes" },
  { valor: "40+", etiqueta: "Países" },
  { valor: "95%", etiqueta: "Satisfacción" },
];

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="bg-ink-950">
      <SiteHeader />

      <div className="relative overflow-hidden bg-grain">
        <HeroBackground />
        <HeroContent estadisticas={ESTADISTICAS} />
      </div>

      <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-white">
          Catálogo de cursos
        </h2>
        <p className="mt-2 text-mist-400">
          Programas diseñados por coaches ejecutivos con experiencia real.
        </p>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
    </main>
  );
}
```

Note the header moved *outside* the `overflow-hidden` hero wrapper: a
`position: sticky` element loses its stickiness once it scrolls past the
bottom edge of an `overflow-hidden` ancestor, so `SiteHeader` must be a
sibling of that wrapper, not nested inside it.

- [ ] **Step 6: Run the full suite to check for regressions**

Run: `npm run test`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/HeroContent.tsx" "app/(public)/HeroContent.test.tsx" "app/(public)/page.tsx"
git commit -m "feat(landing): orquesta la entrada del hero y conecta SiteHeader"
```

---

## Task 8: `CatalogoCursoCard` extraction and stagger reveal

**Files:**
- Create: `app/(public)/CatalogoCursoCard.tsx`
- Test: `app/(public)/CatalogoCursoCard.test.tsx`
- Modify: `app/(public)/CatalogoList.tsx`

Depends on Task 3. Named `CatalogoCursoCard` (not `CursoCard`) to avoid
confusion with the unrelated `components/estudiante/CursoCard.tsx`, which
renders a different shape of data (`CursoConProgreso`, not `CursoPublicado`).

- [ ] **Step 1: Write the failing test**

Create `app/(public)/CatalogoCursoCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogoCursoCard } from "./CatalogoCursoCard";

describe("CatalogoCursoCard", () => {
  it("muestra el título y el precio formateado del curso", () => {
    render(
      <ul>
        <CatalogoCursoCard
          curso={{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }}
        />
      </ul>
    );

    expect(screen.getByText("Ventas B2B")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run "app/(public)/CatalogoCursoCard.test.tsx"`
Expected: FAIL with "Cannot find module './CatalogoCursoCard'".

- [ ] **Step 3: Implement `CatalogoCursoCard.tsx`**

```tsx
"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { fadeUp } from "@/lib/motion";

export function CatalogoCursoCard({ curso }: { curso: CursoPublicado }) {
  return (
    <motion.li
      variants={fadeUp}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl border border-white/10 bg-ink-900 p-5 transition-colors duration-200 hover:border-gold-500/40"
    >
      <h3 className="font-display font-semibold text-white">
        {curso.titulo}
      </h3>
      <p className="mt-2 font-mono text-gold-400">
        ${curso.precio.toFixed(2)}
      </p>
    </motion.li>
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run "app/(public)/CatalogoCursoCard.test.tsx"`
Expected: PASS (1 test)

- [ ] **Step 5: Update `CatalogoList.tsx` to use it with a stagger reveal**

Replace the full contents of `app/(public)/CatalogoList.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import { SCROLL_REVEAL_VIEWPORT, staggerContainer } from "@/lib/motion";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p className="text-mist-400">Próximamente nuevos cursos.</p>;
  }

  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_REVEAL_VIEWPORT}
      variants={staggerContainer(0.07)}
      className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      {cursos.map((curso) => (
        <CatalogoCursoCard key={curso.id} curso={curso} />
      ))}
    </motion.ul>
  );
}
```

This adds `"use client"` to `CatalogoList.tsx` (it now uses Framer Motion
hooks/props), converting it from a Server Component to a Client Component.
It still receives `cursos` as a prop from the async Server Component
`page.tsx`, so no data-fetching changes are needed.

- [ ] **Step 6: Run the existing `CatalogoList` test to confirm no regression**

Run: `npx vitest run "app/(public)/CatalogoList.test.tsx"`
Expected: PASS (2 tests, unchanged — it only asserts on text content, not
markup structure).

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/CatalogoCursoCard.tsx" "app/(public)/CatalogoCursoCard.test.tsx" "app/(public)/CatalogoList.tsx"
git commit -m "feat(landing): extrae CatalogoCursoCard y agrega stagger reveal al catalogo"
```

---

## Task 9: Cross-fade transition between `(public)` routes

**Files:**
- Create: `app/(public)/template.tsx`
- Test: `app/(public)/template.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/(public)/template.test.tsx`:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import PublicTemplate from "./template";

vi.mock("next/navigation", () => ({
  usePathname: () => "/login",
}));

describe("PublicTemplate", () => {
  it("renderiza sus hijos", () => {
    render(
      <PublicTemplate>
        <p>Contenido</p>
      </PublicTemplate>
    );
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run "app/(public)/template.test.tsx"`
Expected: FAIL with "Cannot find module './template'".

- [ ] **Step 3: Implement `template.tsx`**

```tsx
"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PublicTemplate({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
```

A Next.js `template.tsx` (unlike `layout.tsx`) re-mounts on every
navigation within the segment, which combined with `key={pathname}` on the
`AnimatePresence` child produces the cross-fade between Login, Registro,
Recuperar and Actualizar password.

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run "app/(public)/template.test.tsx"`
Expected: PASS (1 test)

- [ ] **Step 5: Run the full suite to check for regressions**

Run: `npm run test`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/template.tsx" "app/(public)/template.test.tsx"
git commit -m "feat(auth): agrega transicion cross-fade entre rutas publicas"
```

---

## Task 10: Auth pages motion homologation

**Files:**
- Modify: `app/(public)/login/LoginBranding.tsx`
- Modify: `app/(public)/login/LoginForm.tsx`
- Modify: `app/(public)/registro/RegistroForm.tsx`
- Modify: `app/(public)/recuperar-password/RecuperarPasswordForm.tsx`
- Modify: `app/(public)/actualizar-password/ActualizarPasswordForm.tsx`

Depends on Tasks 4 and 5 (`CursorGlow`, layered `HeroBackground`).

- [ ] **Step 1: `LoginBranding.tsx` reuses `HeroBackground` + `CursorGlow`**

Replace the full contents of `app/(public)/login/LoginBranding.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import { HeroBackground } from "@/app/(public)/HeroBackground";
import { CursorGlow } from "@/components/motion/CursorGlow";

export function LoginBranding() {
  return (
    <div className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-16">
      <HeroBackground />
      <CursorGlow />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(217,169,78,0.08),transparent_55%),radial-gradient(circle_at_80%_80%,rgba(217,169,78,0.05),transparent_50%)]"
      />

      <motion.span
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 font-display text-lg font-bold tracking-tight text-white"
      >
        TEAM 100%<span className="text-gold-400"> REAL ESTATE</span>
        <span className="text-gold-400"> •</span>
      </motion.span>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 max-w-md"
      >
        <h2 className="font-display text-[42px] font-bold leading-[1.1] text-white">
          El liderazgo se construye,
          <br />
          no se improvisa.
        </h2>
        <p className="mt-6 text-lg text-mist-400">
          Team 100% Real Estate es la plataforma de coaching ejecutivo para líderes que
          buscan resultados medibles, con acompañamiento real en cada etapa
          del camino.
        </p>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 font-mono text-xs uppercase tracking-wider text-mist-500"
      >
        Coaching Executive Platform
      </motion.p>
    </div>
  );
}
```

Only the background changed (custom inline SVG → shared `HeroBackground` +
`CursorGlow`); the text content and its entrance animation are untouched.

- [ ] **Step 2: Add press feedback to `LoginForm.tsx`'s submit button**

In `app/(public)/login/LoginForm.tsx`, find the submit button:

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

Replace it with (adds `whileTap`):

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          whileTap={pendiente ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

- [ ] **Step 3: Same `whileTap` addition in `RegistroForm.tsx`**

In `app/(public)/registro/RegistroForm.tsx`, find:

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

Replace with:

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          whileTap={pendiente ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

- [ ] **Step 4: Same `whileTap` addition in `ActualizarPasswordForm.tsx`**

In `app/(public)/actualizar-password/ActualizarPasswordForm.tsx`, find:

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

Replace with:

```tsx
        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          whileTap={pendiente ? undefined : { scale: 0.97 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
```

- [ ] **Step 5: Upgrade `RecuperarPasswordForm.tsx`'s plain button to match**

In `app/(public)/recuperar-password/RecuperarPasswordForm.tsx`, add the
`motion` import:

```tsx
"use client";

import { useActionState } from "react";
import { motion } from "framer-motion";
import { Mail } from "lucide-react";
import { solicitarRecuperacion, type RecuperarPasswordState } from "./actions";
```

Then find the submit button:

```tsx
      <button
        type="submit"
        disabled={pendiente}
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Enviando..." : "Enviar instrucciones"}
      </button>
```

Replace with:

```tsx
      <motion.button
        type="submit"
        disabled={pendiente}
        whileHover={pendiente ? undefined : { y: -2 }}
        whileTap={pendiente ? undefined : { scale: 0.97 }}
        transition={{ duration: 0.15 }}
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Enviando..." : "Enviar instrucciones"}
      </motion.button>
```

- [ ] **Step 6: Run the existing auth test suites to confirm no regressions**

Run:
```bash
npx vitest run "app/(public)/login/LoginForm.test.tsx" "app/(public)/registro/RegistroForm.test.tsx" "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx" "app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx"
```
Expected: PASS — these tests assert on labels, validation, and submit
behavior, none of which changed. If `RegistroForm.test.tsx` or
`ActualizarPasswordForm.test.tsx` don't exist yet, run
`npx vitest run "app/(public)/login/LoginForm.test.tsx" "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx"` instead.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/login/LoginBranding.tsx" "app/(public)/login/LoginForm.tsx" "app/(public)/registro/RegistroForm.tsx" "app/(public)/actualizar-password/ActualizarPasswordForm.tsx" "app/(public)/recuperar-password/RecuperarPasswordForm.tsx"
git commit -m "feat(auth): homologa el motion de las paginas de autenticacion con el hero"
```

---

## Task 11: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Full test suite**

Run: `npm run test`
Expected: PASS, every test green (existing + all tests added in Tasks 1–10).

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, then in a browser check, for both normal and with the OS
"reduce motion" setting turned on:

- `/` — header compacts on scroll, hero background layers drift at
  different speeds while scrolling, cursor glow follows the pointer in the
  hero (desktop with a mouse), hero content enters staggered on load,
  catalog cards reveal on scroll and elevate on hover.
- `/login` → `/registro` — cross-fade between the two pages instead of a
  hard cut; branding panel shows the same layered background + cursor glow
  as the hero.
- With "reduce motion" enabled at the OS level: no parallax movement, no
  cursor glow, only short opacity fades — nothing crashes or looks broken.

Expected: all of the above holds; no regression in existing login/registro/
recuperar/actualizar functionality (submitting forms, validation errors,
loading states).

- [ ] **Step 5: Commit only if manual verification required follow-up fixes**

If Step 4 surfaced no issues, there is nothing to commit for this task. If
it did, fix the specific issue, re-run Steps 1–4, then:

```bash
git add <archivos-corregidos>
git commit -m "fix(landing): ajusta <detalle especifico encontrado en verificacion manual>"
```

---

## Self-review notes

- **Spec coverage:** every section of
  `docs/superpowers/specs/2026-07-09-landing-auth-motion-design.md` maps to
  a task — shared motion system → Task 3; `CursorGlow` → Task 4; Hero
  parallax → Task 5; `SiteHeader` → Task 6; Hero stagger/CTAs → Task 7;
  Catálogo reveal/hover → Task 8; Auth cross-fade → Task 9; Auth homologation
  (branding panel, focus ring, button language) → Task 10; a11y/perf
  constraints (`useReducedMotionSafe`, `useSpring`/`useMotionValue`, no
  `focus-visible` regressions) are enforced inline in Tasks 3–10 rather than
  as a separate task, since they're cross-cutting; imagegen references →
  Task 2.
- **Deviation from spec called out explicitly:** the spec mentioned a
  `useScrollReveal()` hook; this plan uses a simpler `SCROLL_REVEAL_VIEWPORT`
  constant instead, since wrapping `whileInView` in a custom hook added
  indirection without adding testable behavior — same outcome, less
  surface area (YAGNI).
- **Naming consistency:** `useReducedMotionSafe`, `fadeUp`, `fadeIn`,
  `staggerContainer`, `SCROLL_REVEAL_VIEWPORT`, `EASE_OUT`, `CursorGlow`,
  `SiteHeader`, `HeroContent`, `CatalogoCursoCard` are used identically
  across every task that references them.
- **Risk called out and mitigated:** jsdom lacks `ResizeObserver`/
  `IntersectionObserver`, which Framer Motion's `useScroll`/`whileInView`
  need — Task 1 adds polyfills before any test that depends on them.
