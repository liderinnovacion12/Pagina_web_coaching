# Dashboard Stats Glow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "premium glow" stats section (large numbers, radial gold glow,
hairline dividers — inspired by gleamer.ai's stats section) to the student
welcome page (`/dashboard`), reusing the existing animated-counter behavior
from the public landing page.

**Architecture:** Extract the private `AnimatedCounter` component out of
`app/(public)/HeroContent.tsx` into a shared `components/motion/AnimatedCounter.tsx`
(zero behavior change). Build a new, dashboard-scoped `EstadisticasGlow`
component that reuses it with its own hardcoded stats (duplicated from the
landing's values, not imported — dashboard and public routes stay
decoupled). Insert `EstadisticasGlow` as a new section in
`DashboardContent.tsx`, animated by the page's existing stagger/fade-up
orchestration (no new scroll-trigger logic).

**Tech Stack:** Next.js 15 (App Router), React 19, Framer Motion 12
(`animate`, already used), Vitest + Testing Library (existing test setup).

**Reference spec:** `docs/superpowers/specs/2026-07-16-dashboard-stats-glow-design.md`

---

### Task 1: Extract `AnimatedCounter` into a shared component

**Files:**
- Create: `components/motion/AnimatedCounter.tsx`
- Test: `components/motion/AnimatedCounter.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/motion/AnimatedCounter.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedCounter } from "./AnimatedCounter";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

describe("AnimatedCounter", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza un valor con sufijo '+' y comas de miles", () => {
    render(<AnimatedCounter value="2,000+" />);
    expect(screen.getByText("2,000+")).toBeInTheDocument();
  });

  it("renderiza un valor con sufijo '%'", () => {
    render(<AnimatedCounter value="95%" />);
    expect(screen.getByText("95%")).toBeInTheDocument();
  });

  it("muestra el valor final sin animar cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<AnimatedCounter value="40+" />);
    expect(screen.getByText("40+")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "components/motion/AnimatedCounter.test.tsx"`
Expected: FAIL — cannot find module `./AnimatedCounter` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `components/motion/AnimatedCounter.tsx` — this is an exact extraction
of the component currently defined inline in `app/(public)/HeroContent.tsx`
(lines 10-53 as of this plan), unchanged except it's now exported from its
own file:

```tsx
"use client";

import { useEffect, useState } from "react";
import { animate } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

// Componente contador animado para un look técnico y pulido
export function AnimatedCounter({ value }: { value: string }) {
  const [displayValue, setDisplayValue] = useState(() => {
    if (typeof process !== "undefined" && process.env.NODE_ENV === "test") {
      return value;
    }
    return "0";
  });
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) {
      setDisplayValue(value);
      return;
    }

    // Extraemos los dígitos numéricos
    const numericPart = parseInt(value.replace(/[^0-9]/g, ""), 10);
    if (isNaN(numericPart)) {
      setDisplayValue(value);
      return;
    }

    // Extraemos cualquier sufijo (+, %, etc) y caracteres especiales
    const suffix = value.replace(/[0-9,]/g, "");
    const hasCommas = value.includes(",");

    const controls = animate(0, numericPart, {
      duration: 1.8,
      ease: [0.16, 1, 0.3, 1], // Easeout premium
      onUpdate(latest) {
        const rounded = Math.floor(latest);
        const formatted = hasCommas
          ? rounded.toLocaleString("en-US")
          : rounded.toString();
        setDisplayValue(`${formatted}${suffix}`);
      },
    });

    return () => controls.stop();
  }, [value, reducedMotion]);

  return <>{displayValue}</>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "components/motion/AnimatedCounter.test.tsx"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "components/motion/AnimatedCounter.tsx" "components/motion/AnimatedCounter.test.tsx"
git commit -m "feat(motion): extrae AnimatedCounter a un componente compartido"
```

---

### Task 2: Update `HeroContent` to use the shared `AnimatedCounter`

**Files:**
- Modify: `app/(public)/HeroContent.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `app/(public)/HeroContent.tsx` with:

```tsx
"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { blurFadeUp, fadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

type Estadistica = { valor: string; etiqueta: string };

export function HeroContent({
  estadisticas,
}: {
  estadisticas: Estadistica[];
}) {
  const reducedMotion = useReducedMotionSafe();
  const animVariant = reducedMotion ? fadeUp : blurFadeUp;

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.1)}
      className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20"
    >
      <motion.span
        variants={animVariant}
        className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-gold-500/5 px-4 py-1.5 font-mono text-xs uppercase tracking-wider text-gold-300 backdrop-blur-md"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-gold-400 animate-pulse" />
        Coaching Executive Platform
      </motion.span>

      <motion.h1
        variants={animVariant}
        className="mt-8 font-display text-5xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl"
      >
        Transforma tu
        <br />
        <span className="text-gradient-gold">Liderazgo</span>
      </motion.h1>

      <motion.p
        variants={animVariant}
        className="mt-6 max-w-xl text-balance text-lg text-mist-400"
      >
        Plataforma de coaching ejecutivo para líderes que buscan impacto
        real. Aprende de los mejores, donde estés.
      </motion.p>

      <motion.div variants={animVariant} className="mt-10 flex flex-col gap-4 sm:flex-row">
        {/* Botón Principal - Brillo Shimmer al Hover */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="/registro"
            className="group relative overflow-hidden inline-flex h-12 items-center justify-center rounded-lg bg-gold-500 px-7 font-semibold text-ink-950 shadow-[0_0_24px_rgba(217,169,78,0.18)] transition-all duration-300 hover:bg-gold-400 hover:shadow-[0_0_32px_rgba(217,169,78,0.32)]"
          >
            <span className="relative z-10">Comenzar ahora</span>
            <span className="absolute inset-0 z-0 w-[200%] translate-x-[-100%] bg-gradient-to-r from-transparent via-white/35 to-transparent transition-transform duration-1000 ease-out group-hover:translate-x-[100%]" />
          </Link>
        </motion.div>

        {/* Botón Secundario */}
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
          <Link
            href="#cursos"
            className="inline-flex h-12 items-center justify-center rounded-lg border border-gold-500/40 px-7 font-semibold text-gold-300 transition-all duration-300 hover:border-gold-400 hover:bg-gold-500/5 hover:text-white"
          >
            Ver metodología
          </Link>
        </motion.div>
      </motion.div>

      {/* Grid de Estadísticas con Contadores */}
      <motion.dl
        variants={animVariant}
        className="mt-16 grid gap-10 text-left sm:grid-cols-3 sm:gap-16"
      >
        {estadisticas.map((stat) => (
          <div key={stat.etiqueta}>
            <dt className="sr-only">{stat.etiqueta}</dt>
            <dd className="font-mono text-3xl font-semibold text-gold-400">
              <AnimatedCounter value={stat.valor} />
            </dd>
            <p className="mt-1 text-sm text-mist-500">{stat.etiqueta}</p>
          </div>
        ))}
      </motion.dl>
    </motion.section>
  );
}
```

The only changes from the current file: `useEffect`/`useState` (React) and
`animate` (framer-motion) are no longer imported (they were only used by the
now-removed inline `AnimatedCounter`), and `AnimatedCounter` is now imported
from `@/components/motion/AnimatedCounter` instead of being defined in this
file.

- [ ] **Step 2: Run the existing test to verify no regression**

Run: `npx vitest run "app/(public)/HeroContent.test.tsx"`
Expected: PASS (1 test — unchanged, this file's test was not modified).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (confirms no orphaned imports/unused variables causing
type errors, and that `AnimatedCounter`'s import path resolves).

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/HeroContent.tsx"
git commit -m "refactor(landing): usa AnimatedCounter compartido en HeroContent"
```

---

### Task 3: Create `EstadisticasGlow`

**Files:**
- Create: `components/estudiante/dashboard/EstadisticasGlow.tsx`
- Test: `components/estudiante/dashboard/EstadisticasGlow.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/estudiante/dashboard/EstadisticasGlow.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { EstadisticasGlow } from "./EstadisticasGlow";

describe("EstadisticasGlow", () => {
  it("renderiza las 3 estadisticas del equipo con sus valores y etiquetas", () => {
    render(<EstadisticasGlow />);

    expect(screen.getByText("2,000+")).toBeInTheDocument();
    expect(screen.getByText("Líderes", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("40+")).toBeInTheDocument();
    expect(screen.getByText("Países", { selector: "p" })).toBeInTheDocument();
    expect(screen.getByText("95%")).toBeInTheDocument();
    expect(screen.getByText("Satisfacción", { selector: "p" })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "components/estudiante/dashboard/EstadisticasGlow.test.tsx"`
Expected: FAIL — cannot find module `./EstadisticasGlow` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `components/estudiante/dashboard/EstadisticasGlow.tsx`:

```tsx
import { AnimatedCounter } from "@/components/motion/AnimatedCounter";

type Estadistica = { valor: string; etiqueta: string };

// Mismos valores que app/(public)/page.tsx (ESTADISTICAS) — duplicados
// intencionalmente: landing pública y dashboard autenticado son árboles de
// rutas independientes, no se acoplan entre sí.
const ESTADISTICAS_EQUIPO: Estadistica[] = [
  { valor: "2,000+", etiqueta: "Líderes" },
  { valor: "40+", etiqueta: "Países" },
  { valor: "95%", etiqueta: "Satisfacción" },
];

export function EstadisticasGlow() {
  return (
    <div className="relative overflow-hidden rounded-[24px] border border-white/[0.06] p-8 sm:p-12">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.10),transparent_60%)]"
      />

      <dl className="relative grid gap-8 sm:grid-cols-3 sm:gap-12">
        {ESTADISTICAS_EQUIPO.map((stat) => (
          <div key={stat.etiqueta} className="border-t border-white/10 pt-5">
            <dt className="sr-only">{stat.etiqueta}</dt>
            <dd className="font-mono text-5xl font-bold text-gold-400 sm:text-6xl">
              <AnimatedCounter value={stat.valor} />
            </dd>
            <p className="mt-2 text-sm text-mist-400">{stat.etiqueta}</p>
          </div>
        ))}
      </dl>
    </div>
  );
}
```

Note: this file does not need a `"use client"` directive itself — it has no
hooks or browser APIs of its own. `AnimatedCounter` (which it renders) already
carries its own `"use client"` directive, and `DashboardContent.tsx` (its
only consumer, added in Task 4) is already a client component — Next.js does
not require every intermediate file in a client module graph to redeclare
`"use client"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "components/estudiante/dashboard/EstadisticasGlow.test.tsx"`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add "components/estudiante/dashboard/EstadisticasGlow.tsx" "components/estudiante/dashboard/EstadisticasGlow.test.tsx"
git commit -m "feat(dashboard): agrega EstadisticasGlow"
```

---

### Task 4: Insert `EstadisticasGlow` into the welcome page

**Files:**
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

- [ ] **Step 1: Add the import**

In `app/(estudiante)/dashboard/DashboardContent.tsx`, change the import
block (currently ending with):

```tsx
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";
```

to add the new component import:

```tsx
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";
import { EstadisticasGlow } from "@/components/estudiante/dashboard/EstadisticasGlow";
```

- [ ] **Step 2: Insert the new section**

Find this block (the end of "1. Cabecera Principal" and the start of
"2. Video de Bienvenida"):

```tsx
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </motion.div>

      {/* 2. Video de Bienvenida */}
```

Replace it with (inserting a new `motion.div` section in between; the
existing numbered comments for the sections that follow are intentionally
left as-is — they're just labels, not renumbered, to keep this diff minimal):

```tsx
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </motion.div>

      {/* Estadísticas del Equipo */}
      <motion.div variants={cardVariants}>
        <EstadisticasGlow />
      </motion.div>

      {/* 2. Video de Bienvenida */}
```

- [ ] **Step 3: Run the dashboard page test to verify no regression**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS (10 tests — this suite doesn't assert section order or an
exhaustive list of page content, so the new section shouldn't break it; it
also mocks `getMiembrosEquipo`/`getGaleriaEquipo`, not anything
`EstadisticasGlow` depends on).

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "feat(dashboard): inserta EstadisticasGlow en la pagina de bienvenida"
```

---

### Task 5: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests passing (no new failures introduced by Tasks 1-4; a
pre-existing, unrelated flaky test in
`app/(estudiante)/dashboard/page.test.tsx` — "muestra el encabezado de
bienvenida" — is known to occasionally fail only when run as part of the
full suite and pass in isolation; if it's the *only* failure, rerun it in
isolation with `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"` to
confirm it's that known flake, not a real regression, before treating the
suite as green).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (pre-existing warnings in unrelated files are fine).

- [ ] **Step 3: Manual verification in the browser**

Start the dev server (`npm run dev`) with valid Supabase credentials in
`.env.local` (or use a temporary preview route bypassing data fetching, the
same technique used for the hero-scroll-parallax feature, if no credentials
are available in this environment).

- Visit `/dashboard`: confirm the new "Estadísticas del Equipo" section
  appears between the welcome header and the induction video, the three
  numbers count up from 0 on page load, the gold radial glow is subtle (not
  competing visually with the rest of the page), and the hairline dividers
  render above each number.
- Visit `/` (landing): confirm the hero's stats still count up exactly as
  before — this confirms the `AnimatedCounter` extraction in Task 1/2 didn't
  change landing behavior.
- Toggle `prefers-reduced-motion: reduce` in DevTools and reload both pages:
  confirm both show final numbers immediately, no count-up animation.

- [ ] **Step 4: Final commit (only if Steps 1-2 required fixes)**

If lint or the full suite required any fix, commit it separately:

```bash
git add -A
git commit -m "fix(dashboard): ajustes tras verificacion de EstadisticasGlow"
```

If no fixes were needed, skip this step — Tasks 1-4 already committed
everything.

---

## Self-review notes

- **Spec coverage:** `AnimatedCounter` extraction (Task 1-2), new
  `EstadisticasGlow` component with the exact visual spec (radial glow,
  hairline dividers, `text-5xl`/`text-6xl` numbers, reused landing stat
  values) (Task 3), insertion between header and video (Task 4), no 3D
  transforms anywhere (never introduced in any task), no new dependencies
  (only `framer-motion`, already installed), accessibility (`sr-only` `dt`,
  `aria-hidden` glow — inherited from the existing pattern and explicit in
  Task 3) — all covered.
- **Out of scope confirmed not touched:** Curso de Rentas, Aliados
  Estratégicos, Proyectos Inmobiliarios Aliados are not touched by any task.
- **Type consistency:** `Estadistica` type (`{ valor: string; etiqueta:
  string }`) is defined identically (structurally) in both
  `app/(public)/HeroContent.tsx` and `components/estudiante/dashboard/EstadisticasGlow.tsx`
  — intentionally duplicated per the spec's decoupling decision, not
  imported from one into the other.
