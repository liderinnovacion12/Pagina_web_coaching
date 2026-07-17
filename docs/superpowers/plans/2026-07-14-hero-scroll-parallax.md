# Hero Scroll Parallax Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the landing hero's background (particle field + gradient) fade and
parallax as the user scrolls, and make the hero content shift at a different
rate, so the section reads as layered/3D instead of static — without adding any
new dependency.

**Architecture:** A new client component `HeroScrollLayer` owns a `ref` on the
hero section and a Framer Motion `useScroll({ target })` hook scoped to that
section's height. It derives `opacity`/`y` `MotionValue`s with `useTransform`
and applies them via three internal `motion.div` wrappers around the
already-existing `HeroBackground`, `ParticleField`, and `HeroContent`
components (passed in as props/children), so none of those three components'
internals change except `HeroContent`, which gains one optional `style` prop to
receive its parallax offset. `app/(public)/page.tsx` swaps its current plain
`<div>` wrapper for `<HeroScrollLayer>`. `/login` and `/recuperar-password`
(which use `ParticleField` directly, not through this wrapper) are untouched.

**Tech Stack:** Next.js 15 (App Router), React 19, Framer Motion 12
(`useScroll`, `useTransform`, `motion.div` — already a dependency), Vitest +
Testing Library (existing test setup, no new mocks needed — `components/SiteHeader.tsx`
already proves `useScroll()` renders fine under the current jsdom setup).

**Reference spec:** `docs/superpowers/specs/2026-07-14-hero-scroll-parallax-design.md`

---

### Task 1: `HeroContent` accepts an optional parallax `style`

**Files:**
- Modify: `app/(public)/HeroContent.tsx`
- Test: `app/(public)/HeroContent.test.tsx`

- [ ] **Step 1: Write the failing test**

Add this test to `app/(public)/HeroContent.test.tsx` (inside the existing
`describe("HeroContent", ...)` block, as a new `it`):

```tsx
  it("aplica un estilo externo (parallax) al contenedor raíz cuando se provee", () => {
    const { container } = render(
      <HeroContent
        estadisticas={[{ valor: "2,000+", etiqueta: "Líderes" }]}
        style={{ opacity: 0.5 }}
      />
    );

    const section = container.querySelector("section");
    expect(section).toHaveStyle({ opacity: "0.5" });
  });
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(public)/HeroContent.test.tsx"`
Expected: FAIL — TypeScript error / prop `style` does not exist on
`HeroContent`'s props type (or the rendered `section` has no `opacity` style).

- [ ] **Step 3: Write minimal implementation**

In `app/(public)/HeroContent.tsx`, change the import line (currently
`import { motion, animate } from "framer-motion";`) to also import the
`MotionStyle` type:

```tsx
import { motion, animate, type MotionStyle } from "framer-motion";
```

Change the component signature (currently
`export function HeroContent({ estadisticas }: { estadisticas: Estadistica[] })`)
to:

```tsx
export function HeroContent({
  estadisticas,
  style,
}: {
  estadisticas: Estadistica[];
  style?: MotionStyle;
}) {
```

Change the root element (currently
`<motion.section initial="hidden" animate="visible" variants={staggerContainer(0.08, 0.1)} className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20">`)
to also pass `style`:

```tsx
    <motion.section
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08, 0.1)}
      style={style}
      className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pb-24 pt-12 text-center sm:pt-20"
    >
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "app/(public)/HeroContent.test.tsx"`
Expected: PASS (3 tests: the two existing ones + the new one).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/HeroContent.tsx" "app/(public)/HeroContent.test.tsx"
git commit -m "feat(landing): HeroContent acepta un style externo para parallax"
```

---

### Task 2: Create `HeroScrollLayer`

**Files:**
- Create: `app/(public)/HeroScrollLayer.tsx`
- Test: `app/(public)/HeroScrollLayer.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/(public)/HeroScrollLayer.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "app/(public)/HeroScrollLayer.test.tsx"`
Expected: FAIL — cannot find module `./HeroScrollLayer` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `app/(public)/HeroScrollLayer.tsx`:

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useReducedMotionSafe } from "@/lib/motion";

export function HeroScrollLayer({
  background,
  particles,
  children,
}: {
  background: ReactNode;
  particles: ReactNode;
  children: ReactNode;
}) {
  const heroRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });

  const bgOpacity = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const bgY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 40]);

  if (reducedMotion) {
    return (
      <div
        ref={heroRef}
        data-testid="hero-scroll-layer"
        className="relative overflow-hidden bg-grain"
      >
        {background}
        {particles}
        {children}
      </div>
    );
  }

  return (
    <div
      ref={heroRef}
      data-testid="hero-scroll-layer"
      className="relative overflow-hidden bg-grain"
    >
      <motion.div style={{ opacity: bgOpacity, y: bgY }}>
        {background}
      </motion.div>
      <motion.div style={{ opacity: bgOpacity }}>{particles}</motion.div>
      <motion.div style={{ y: contentY }}>{children}</motion.div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "app/(public)/HeroScrollLayer.test.tsx"`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/HeroScrollLayer.tsx" "app/(public)/HeroScrollLayer.test.tsx"
git commit -m "feat(landing): agrega HeroScrollLayer con parallax de scroll"
```

---

### Task 3: Wire `HeroScrollLayer` into the landing page

**Files:**
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Replace the hero wrapper**

In `app/(public)/page.tsx`, change the import block (currently):

```tsx
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { ParticleField } from "@/components/motion/ParticleField";
```

to add `HeroScrollLayer`:

```tsx
import { CatalogoList } from "./CatalogoList";
import { HeroBackground } from "./HeroBackground";
import { HeroContent } from "./HeroContent";
import { HeroScrollLayer } from "./HeroScrollLayer";
import { ParticleField } from "@/components/motion/ParticleField";
```

Then change the JSX (currently):

```tsx
      <div className="relative overflow-hidden bg-grain">
        <HeroBackground />
        <ParticleField />
        <HeroContent estadisticas={ESTADISTICAS} />
      </div>
```

to:

```tsx
      <HeroScrollLayer
        background={<HeroBackground />}
        particles={<ParticleField />}
      >
        <HeroContent estadisticas={ESTADISTICAS} />
      </HeroScrollLayer>
```

- [ ] **Step 2: Run the full test suite (no test file changes in this task, but confirm nothing broke)**

Run: `npx vitest run`
Expected: PASS — all suites green, including `HeroBackground.test.tsx`,
`HeroContent.test.tsx`, `HeroScrollLayer.test.tsx`, `CatalogoList.test.tsx`,
`CatalogoCursoCard.test.tsx`, `template.test.tsx`.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "feat(landing): usa HeroScrollLayer en la hero de la landing"
```

---

### Task 4: Verify in the browser and finalize

**Files:** none (verification only)

- [ ] **Step 1: Typecheck and lint**

Run: `npm run typecheck`
Expected: no errors.

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 2: Start the dev server**

Run: `npm run dev`

- [ ] **Step 3: Manually verify the landing hero**

Open `http://localhost:3000/` in a browser:
- At the top of the page, the particle field and gradient background should
  look exactly as before (no flash/jump on load).
- Scroll slowly from the top down to the `Catálogo de cursos` heading: the
  particle field and gradient should visibly fade out and shift slightly,
  and the hero text/CTAs should move at a subtly different rate than the
  background (layered depth).
- Once fully scrolled past the hero, the particle canvas must **not** be
  visible behind the course catalog cards (this was the pre-existing bug the
  spec calls out).
- Scroll back up: the effect should reverse smoothly (it's driven by
  `scrollYProgress`, not a one-shot animation).

- [ ] **Step 4: Verify `/login` is unaffected**

Open `http://localhost:3000/login`: the `ParticleField` background and its
"focus mode" (particles flowing around the card on input focus) must look and
behave exactly as before — this page does not use `HeroScrollLayer`.

- [ ] **Step 5: Verify reduced motion**

In Chrome DevTools: Rendering tab → "Emulate CSS media feature
prefers-reduced-motion" → `reduce`. Reload `http://localhost:3000/`:
- The hero should render immediately with no parallax/fade animation tied to
  scroll (background and content stay static/fully opaque regardless of
  scroll position) — matches the existing reduced-motion behavior of
  `ParticleField` (which already renders `null` under reduced motion) and
  `HeroContent`'s existing entrance animation fallback.

- [ ] **Step 6: Run the full test suite one last time**

Run: `npx vitest run`
Expected: PASS, all suites green.

- [ ] **Step 7: Final commit (only if Step 1 required fixes)**

If typecheck/lint required any fix, commit it separately:

```bash
git add -A
git commit -m "fix(landing): ajustes de typecheck/lint para HeroScrollLayer"
```

If no fixes were needed, skip this step — Tasks 1–3 already committed
everything.

---

## Self-review notes

- **Spec coverage:** fade+parallax of background (Task 2/3), differential
  content movement (Task 1/2/3), scoping to hero height via `target: heroRef`
  (Task 2), reduced-motion fallback (Task 2, verified Step 5 of Task 4), no
  new dependencies (only `framer-motion`, already installed), `/login`
  untouched (verified Step 4 of Task 4), catalog no longer shows the particle
  canvas bleeding through (verified Step 3 of Task 4) — all covered.
- **Out of scope confirmed not touched:** no GSAP/Lenis/Three.js added, no
  cursor-tilt on `HeroContent`, no changes to `/login`, `/recuperar-password`,
  dashboard, or course catalog components beyond the wrapper swap in
  `page.tsx`.
