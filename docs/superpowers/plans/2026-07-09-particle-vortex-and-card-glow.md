# Vórtice de partículas + tarjetas con glow al hover Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el fondo estático del Hero/panel de login por un vórtice
de partículas en Canvas 2D (respiración sincronizada, deriva libre por
partícula, inclinación hacia el cursor) y cambiar las tarjetas del catálogo y
los paneles de Auth de un borde estático a un glow dorado que solo aparece al
hacer hover.

**Architecture:** Un componente nuevo y autocontenido
(`components/motion/ParticleField.tsx`) que dibuja el vórtice imperativamente
sobre un `<canvas>` vía `requestAnimationFrame`, se monta en las dos
superficies que ya comparten `HeroBackground`/`CursorGlow` hoy
(`app/(public)/page.tsx` y `app/(public)/login/LoginBranding.tsx`), y no toca
ningún otro archivo del sistema de motion existente. Las tarjetas y paneles de
Auth solo cambian sus clases de Tailwind (sin nuevos componentes).

**Tech Stack:** Next.js 15 (App Router), React 19, Canvas 2D (sin
dependencias nuevas), Tailwind CSS, Vitest + Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-07-09-particle-vortex-and-card-glow-design.md`

---

## Task 1: `ParticleField` component

**Files:**
- Create: `components/motion/ParticleField.tsx`
- Test: `components/motion/ParticleField.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/motion/ParticleField.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Run it to confirm it fails**

Run: `npx vitest run components/motion/ParticleField.test.tsx`
Expected: FAIL with "Cannot find module './ParticleField'".

- [ ] **Step 3: Implement `ParticleField.tsx`**

Create `components/motion/ParticleField.tsx`:

```tsx
"use client";

import { useEffect, useRef } from "react";
import { useReducedMotionSafe } from "@/lib/motion";

const SLOT_FRACTIONS = [0.16, 0.34, 0.52, 0.7, 0.88, 1.0];
const BREATH_PERIOD = 6.5;
const BREATH_MIN = 0.42;
const ROTATION_SPEED = 0.045;
const ACCENT_RATIO = 0.12;
const ACCENT_RGB = "217,169,78"; // gold-500
const NEUTRAL_RGB = "139,147,167"; // mist-400

type Particle = {
  baseAngle: number;
  slotFraction: number;
  radiusPx: number;
  accent: boolean;
  opacityMin: number;
  opacityMax: number;
  opacityPhase: number;
  opacitySpeed: number;
  wanderAmpX: number;
  wanderAmpY: number;
  wanderFreqX: number;
  wanderFreqY: number;
  wanderPhaseX: number;
  wanderPhaseY: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function rgba(rgb: string, alpha: number) {
  return `rgba(${rgb},${alpha})`;
}

export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = useReducedMotionSafe();

  useEffect(() => {
    if (reducedMotion) return;

    const canvas = canvasRef.current;
    const container = canvas?.parentElement;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let center = { x: 0, y: 0 };
    let maxRadius = 0;
    const lean = { x: 0, y: 0 };
    const mouse = { x: -9999, y: -9999 };
    let animationFrame = 0;
    const dpr = Math.max(1, window.devicePixelRatio || 1);

    function initParticles(width: number, height: number) {
      center = { x: width / 2, y: height / 2 };
      maxRadius = Math.min(width, height) * 0.46;

      const spokeCount = Math.min(36, Math.max(18, Math.round(width / 26)));
      const next: Particle[] = [];
      for (let s = 0; s < spokeCount; s++) {
        const baseAngle = (s / spokeCount) * Math.PI * 2;
        for (const slot of SLOT_FRACTIONS) {
          const frac = slot * (0.92 + Math.random() * 0.16);
          next.push({
            baseAngle: baseAngle + (Math.random() - 0.5) * 0.045,
            slotFraction: frac,
            radiusPx: 0.6 + frac * 1.7,
            accent: Math.random() < ACCENT_RATIO,
            opacityMin: 0.16,
            opacityMax: 0.3 + Math.random() * 0.5,
            opacityPhase: Math.random() * Math.PI * 2,
            opacitySpeed: 0.5 + Math.random() * 0.6,
            wanderAmpX: 6 + Math.random() * 16,
            wanderAmpY: 6 + Math.random() * 16,
            wanderFreqX: 0.12 + Math.random() * 0.35,
            wanderFreqY: 0.12 + Math.random() * 0.35,
            wanderPhaseX: Math.random() * Math.PI * 2,
            wanderPhaseY: Math.random() * Math.PI * 2,
          });
        }
      }
      particles = next;
    }

    function resize() {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles(rect.width, rect.height);
    }

    function draw(elapsedMs: number) {
      const rect = container.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const seconds = elapsedMs / 1000;
      ctx.clearRect(0, 0, width, height);

      // shared breathing phase: a plain sine has zero velocity at both the
      // fully-contracted and fully-expanded extremes and peaks mid-cycle —
      // "slow near the center, accelerates outward, eases to a stop at the
      // edge before reversing" comes for free from this shape.
      const omega = (Math.PI * 2) / BREATH_PERIOD;
      const raw = (Math.sin(seconds * omega - Math.PI / 2) + 1) / 2;
      const radiusFraction = BREATH_MIN + (1 - BREATH_MIN) * raw;
      const breathVelocity =
        (omega * Math.cos(seconds * omega - Math.PI / 2)) / 2;
      const breathGlow = 0.7 + 0.3 * raw;
      const globalAngle = seconds * ROTATION_SPEED;

      let nx = 0;
      let ny = 0;
      if (mouse.x > -9000) {
        nx = clamp((mouse.x - width / 2) / (width / 2), -1, 1);
        ny = clamp((mouse.y - height / 2) / (height / 2), -1, 1);
      }
      lean.x += (nx * 40 - lean.x) * 0.06;
      lean.y += (ny * 24 - lean.y) * 0.06;
      const squashX = 1 - Math.abs(nx) * 0.12;
      const cx = center.x + lean.x;
      const cy = center.y + lean.y;

      for (const p of particles) {
        const theta = p.baseAngle + globalAngle;
        const currentR = maxRadius * radiusFraction * p.slotFraction;
        const wanderX =
          p.wanderAmpX * Math.sin(seconds * p.wanderFreqX + p.wanderPhaseX);
        const wanderY =
          p.wanderAmpY * Math.sin(seconds * p.wanderFreqY + p.wanderPhaseY);
        const x = cx + Math.cos(theta) * currentR * squashX + wanderX;
        const y = cy + Math.sin(theta) * currentR + wanderY;

        const perspective = 0.4 + p.slotFraction * 0.9;
        const wave =
          (Math.sin(seconds * p.opacitySpeed + p.opacityPhase) + 1) / 2;
        const opacity =
          (p.opacityMin + wave * (p.opacityMax - p.opacityMin)) * breathGlow;
        const color = p.accent ? ACCENT_RGB : NEUTRAL_RGB;

        const speedAtSlot =
          Math.abs(breathVelocity) * (1 - BREATH_MIN) * maxRadius * p.slotFraction;
        const dirSign = breathVelocity >= 0 ? 1 : -1;
        const ux = Math.cos(theta) * dirSign;
        const uy = Math.sin(theta) * dirSign;
        const tailLen = p.radiusPx * perspective * 2.2 + speedAtSlot * 0.5;
        const tailX = x - ux * tailLen;
        const tailY = y - uy * tailLen;

        const trail = ctx.createLinearGradient(tailX, tailY, x, y);
        trail.addColorStop(0, rgba(color, 0));
        trail.addColorStop(1, rgba(color, opacity));
        ctx.strokeStyle = trail;
        ctx.lineWidth = Math.max(0.8, p.radiusPx * perspective * 1.3);
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(x, y);
        ctx.stroke();

        ctx.fillStyle = rgba(color, Math.min(1, opacity * 1.5));
        ctx.beginPath();
        ctx.arc(x, y, p.radiusPx * perspective * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function loop(timestamp: number) {
      draw(timestamp);
      animationFrame = requestAnimationFrame(loop);
    }

    function stopLoop() {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }

    function startLoop() {
      if (animationFrame !== 0) return;
      animationFrame = requestAnimationFrame(loop);
    }

    function handlePointerMove(event: PointerEvent) {
      const rect = canvas.getBoundingClientRect();
      mouse.x = event.clientX - rect.left;
      mouse.y = event.clientY - rect.top;
    }

    function handlePointerLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    // Pause the rAF loop entirely (not just the draw call) while the field
    // is scrolled out of view, instead of paying for canvas work off-screen.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) startLoop();
        else stopLoop();
      },
      { threshold: 0 }
    );
    intersectionObserver.observe(container);

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Unlike CursorGlow.tsx (which sets `pointer-events-none` on the same
    // element it listens to — CSS excludes that element from hit-testing,
    // so its onPointerMove handler can never fire), this canvas keeps the
    // default `pointer-events: auto`. Sibling content that should stay
    // clickable (headline, CTAs) is rendered after it with `relative z-10`,
    // so it still intercepts its own clicks via normal stacking order while
    // the canvas receives pointer moves everywhere else.
    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    return () => {
      stopLoop();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
    };
  }, [reducedMotion]);

  if (reducedMotion) {
    return null;
  }

  return (
    <canvas
      ref={canvasRef}
      data-testid="particle-field-canvas"
      aria-hidden="true"
      className="absolute inset-0 h-full w-full"
    />
  );
}
```

- [ ] **Step 4: Run the test to confirm it passes**

Run: `npx vitest run components/motion/ParticleField.test.tsx`
Expected: PASS (2 tests). jsdom's `HTMLCanvasElement.getContext` returns
`null` (no canvas backend installed), which the component already guards
against with an early `return`, so the effect no-ops harmlessly in tests —
no canvas mocking package needed.

- [ ] **Step 5: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add components/motion/ParticleField.tsx components/motion/ParticleField.test.tsx
git commit -m "feat(motion): agrega ParticleField, vortice de particulas en Canvas"
```

---

## Task 2: Wire `ParticleField` into the landing Hero

**Files:**
- Modify: `app/(public)/page.tsx`

Depends on Task 1.

- [ ] **Step 1: Add the import and mount it in the Hero wrapper**

In `app/(public)/page.tsx`, add the import alongside the existing ones:

```tsx
import { ParticleField } from "@/components/motion/ParticleField";
```

Then update the Hero wrapper `<div>` to render `ParticleField` between
`HeroBackground` and `HeroContent`:

```tsx
      <div className="relative overflow-hidden bg-grain">
        <HeroBackground />
        <ParticleField />
        <HeroContent estadisticas={ESTADISTICAS} />
      </div>
```

`HeroContent` already renders with `relative z-10` internally
(`app/(public)/HeroContent.tsx`), so its badge/headline/CTAs stay above the
canvas and remain clickable.

- [ ] **Step 2: Run the existing Hero-related tests to confirm no regressions**

Run:
```bash
npx vitest run "app/(public)/HeroContent.test.tsx" "app/(public)/HeroBackground.test.tsx"
```
Expected: PASS — these tests assert on text/links/testids that
`ParticleField` doesn't touch.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "feat(landing): monta ParticleField detras del contenido del hero"
```

---

## Task 3: Wire `ParticleField` into the `/login` branding panel

**Files:**
- Modify: `app/(public)/login/LoginBranding.tsx`

Depends on Task 1.

- [ ] **Step 1: Add the import and mount it alongside `HeroBackground`**

In `app/(public)/login/LoginBranding.tsx`, add the import:

```tsx
import { ParticleField } from "@/components/motion/ParticleField";
```

Update the top of the component to insert `ParticleField` between
`HeroBackground` and `CursorGlow`:

```tsx
      <HeroBackground />
      <ParticleField />
      <CursorGlow />
```

- [ ] **Step 2: Run the existing login test suite to confirm no regressions**

Run: `npx vitest run "app/(public)/login/LoginForm.test.tsx"`
Expected: PASS — `LoginBranding` has no dedicated test file, and
`LoginForm.test.tsx` doesn't assert on the branding panel's markup.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/login/LoginBranding.tsx"
git commit -m "feat(auth): monta ParticleField en el panel de marca de login"
```

---

## Task 4: Hover-only glow on `CatalogoCursoCard`

**Files:**
- Modify: `app/(public)/CatalogoCursoCard.tsx`

- [ ] **Step 1: Replace the static hover border with the glow treatment**

In `app/(public)/CatalogoCursoCard.tsx`, find:

```tsx
      className="rounded-xl border border-white/10 bg-ink-900 p-5 transition-colors duration-200 hover:border-gold-500/40"
```

Replace with (quiet at rest, border + glow shadow only on hover — no
animation while idle):

```tsx
      className="rounded-xl border border-white/10 bg-ink-900 p-5 transition duration-300 hover:border-gold-500/60 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.12),0_20px_48px_-20px_rgba(0,0,0,0.5),0_0_28px_-6px_rgba(217,169,78,0.18)]"
```

- [ ] **Step 2: Run the existing test to confirm no regressions**

Run: `npx vitest run "app/(public)/CatalogoCursoCard.test.tsx"`
Expected: PASS (1 test, unchanged — it only asserts on title/price text).

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/CatalogoCursoCard.tsx"
git commit -m "feat(landing): tarjetas del catalogo ganan glow dorado solo al hover"
```

---

## Task 5: Hover-only glow on the Auth form panels

**Files:**
- Modify: `app/(public)/login/page.tsx`
- Modify: `app/(public)/registro/page.tsx`
- Modify: `app/(public)/recuperar-password/page.tsx`
- Modify: `app/(public)/actualizar-password/page.tsx`

- [ ] **Step 1: Update the login panel (keeps its existing static shadow)**

In `app/(public)/login/page.tsx`, find:

```tsx
          <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
```

Replace with:

```tsx
          <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 shadow-[0_0_40px_rgba(0,0,0,0.25)] transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_40px_rgba(0,0,0,0.25),0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
```

- [ ] **Step 2: Update the registro panel**

In `app/(public)/registro/page.tsx`, find:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
```

Replace with:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
```

- [ ] **Step 3: Update the recuperar-password panel**

In `app/(public)/recuperar-password/page.tsx`, find:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
```

Replace with the same class string as Step 2:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
```

- [ ] **Step 4: Update the actualizar-password panel**

In `app/(public)/actualizar-password/page.tsx`, find:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
```

Replace with the same class string as Step 2:

```tsx
        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 transition duration-300 hover:border-gold-500/35 hover:shadow-[0_0_0_1px_rgba(217,169,78,0.14),0_0_32px_-4px_rgba(217,169,78,0.22)]">
```

- [ ] **Step 5: Run the Auth test suites to confirm no regressions**

Run:
```bash
npx vitest run "app/(public)/login/LoginForm.test.tsx" "app/(public)/registro/RegistroForm.test.tsx" "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx" "app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx"
```
Expected: PASS — these assert on form labels/validation/submission, not on
the wrapping panel's classes. If any of the four files doesn't exist, skip
it and run the rest.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/login/page.tsx" "app/(public)/registro/page.tsx" "app/(public)/recuperar-password/page.tsx" "app/(public)/actualizar-password/page.tsx"
git commit -m "feat(auth): paneles de formularios ganan glow dorado solo al hover"
```

---

## Task 6: Final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Typecheck**

Run: `npm run typecheck`
Expected: no errors.

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Full test suite**

Run: `npm run test`
Expected: PASS, every test green (existing + `ParticleField.test.tsx`).

- [ ] **Step 4: Manual browser verification**

Run: `npm run dev`, then in a browser check, for both normal and with the OS
"reduce motion" setting turned on:

- `/` — the vortex behind the hero breathes in and out on a synchronized
  cycle, individual particles drift independently instead of moving in
  lockstep, the whole structure leans gently toward the cursor without
  breaking formation, and the headline/CTAs remain fully clickable (canvas
  doesn't block them).
- `/login` — same vortex behavior in the branding panel (desktop width
  only, panel is `hidden lg:flex`); the login form itself is unaffected.
- `/` catalog and all four Auth panels: no border/glow visible at rest;
  hovering over a course card or a form panel brings up the gold
  border+glow smoothly; moving the mouse away removes it smoothly.
- With "reduce motion" enabled at the OS level: `/` and `/login` show no
  particle canvas at all (component returns `null`); hover glow on cards
  and panels is instant (no transition) per the project's global
  `prefers-reduced-motion` CSS rule; nothing else breaks.

Expected: all of the above holds; no regression in existing
login/registro/recuperar/actualizar functionality (submitting forms,
validation errors, loading states).

- [ ] **Step 5: Commit only if manual verification required follow-up fixes**

If Step 4 surfaced no issues, there is nothing to commit for this task. If
it did, fix the specific issue, re-run Steps 1–4, then:

```bash
git add <archivos-corregidos>
git commit -m "fix(motion): ajusta <detalle especifico encontrado en verificacion manual>"
```

---

## Self-review notes

- **Spec coverage:** every decision in
  `docs/superpowers/specs/2026-07-09-particle-vortex-and-card-glow-design.md`
  maps to a task — `ParticleField` structure/breathing/wander/streak/cursor
  math → Task 1 (ported directly from the validated mockup, same constants:
  `BREATH_PERIOD` 6.5s, `BREATH_MIN` 0.42, `ROTATION_SPEED` 0.045,
  `SLOT_FRACTIONS` 6 slots, ~12% accent ratio); Hero/LoginBranding mounting →
  Tasks 2–3; card glow → Task 4; the four Auth panels → Task 5;
  accessibility/perf (reduced-motion gating, pause off-screen, no
  `pointer-events-none` bug) → enforced inline in Task 1's implementation.
- **Deviation from spec called out explicitly:** none — Task 1's code is a
  direct TypeScript port of the mockup's vanilla JS, same variable names
  where practical (`radiusFraction`, `breathVelocity`, `wanderAmpX`, etc.)
  so the spec's prose description and the implementation stay traceable to
  each other.
- **Out of scope, not touched by this plan:** `CursorGlow.tsx`'s existing
  `pointer-events-none` bug (noted for awareness in Task 1's code comment,
  not fixed); the broader "todo el sitio" palette/layout redesign (Phases
  A–D discussed separately) — no `tailwind.config.ts` changes in this plan.
- **Risk called out and mitigated:** jsdom has no canvas 2D backend, so
  `canvas.getContext("2d")` returns `null` in tests — Task 1's component
  already guards on this and returns early, so no canvas-mocking dependency
  is needed for the test suite to pass.
