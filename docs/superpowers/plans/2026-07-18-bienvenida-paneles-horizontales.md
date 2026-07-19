# Bienvenida — paneles horizontales (Cabecera + Video) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar las secciones "Cabecera Principal" y "Video de Bienvenida"
de `/dashboard` por un tramo de scroll horizontal tipo alkares.com en
desktop, manteniendo el layout vertical actual sin cambios en mobile/tablet
y cuando `prefers-reduced-motion` está activo.

**Architecture:** Un componente nuevo `HorizontalIntroPanels` decide entre
dos ramas de render: la rama vertical existente (reutilizada tal cual) o una
rama nueva de 2 paneles con "pin + scrub" horizontal construida con
`framer-motion` (`useScroll`/`useTransform`/`useMotionValueEvent`, sin
dependencias nuevas). Un hook nuevo `useIsDesktop()` decide la rama junto con
el `useReducedMotionSafe()` ya existente.

**Tech Stack:** Next.js 15, React 19, framer-motion 12, Tailwind CSS, Vitest
+ Testing Library.

---

## Corrección respecto al spec aprobado

Durante la escritura de este plan se encontró una inconsistencia en la
Sección 2 del spec (`docs/superpowers/specs/2026-07-18-bienvenida-paneles-horizontales-design.md`):
describía que el subtítulo "by Wilmar Sosa y Samuel Oropeza" se revela
**dentro del Panel 2 (Video)**, pero ese texto es contenido de la Cabecera
(Panel 1) — duplicarlo en el Panel 2 no tiene sentido de contenido y no fue
la intención real. Este plan corrige eso: el subtítulo permanece únicamente
en el Panel 1, junto al título. El Panel 2 solo tiene el efecto de zoom-in
del video al activarse, sin texto adicional (coherente con la decisión ya
tomada en el ciclo anterior de que el video no lleva etiqueta).

---

### Task 1: Hook `useIsDesktop` + polyfill de `matchMedia` en tests

**Files:**
- Modify: `lib/motion.ts`
- Modify: `lib/motion.test.ts`
- Modify: `vitest.setup.ts`

- [ ] **Step 1: Agregar un stub global de `matchMedia` a `vitest.setup.ts`**

jsdom no implementa `window.matchMedia` — sin este stub, cualquier test que
renderice `DashboardContent` (que a partir de la Task 4 usará
`useIsDesktop`) fallaría con `TypeError: window.matchMedia is not a
function`. El stub por defecto responde `matches: false` (o sea "no
desktop"), preservando el comportamiento actual de todos los tests
existentes que no lo sobreescriben explícitamente.

```ts
// vitest.setup.ts — agregar al final del archivo
if (typeof window.matchMedia === "undefined") {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })) as unknown as typeof window.matchMedia;
}
```

- [ ] **Step 2: Escribir los tests que fallan para `useIsDesktop`**

Agregar al final de `lib/motion.test.ts`:

```ts
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
```

Actualizar los imports al inicio de `lib/motion.test.ts`:

```ts
import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
```

y agregar `useIsDesktop` al import de `"./motion"`.

- [ ] **Step 3: Correr los tests y verificar que fallan**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `useIsDesktop` no existe todavía en `lib/motion.ts`.

- [ ] **Step 4: Implementar `useIsDesktop` en `lib/motion.ts`**

Agregar al final de `lib/motion.ts` (después de `useReducedMotionSafe`):

```ts
import { useEffect, useState } from "react";

const DESKTOP_MEDIA_QUERY = "(min-width: 1024px)";

export function useIsDesktop(): boolean {
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(DESKTOP_MEDIA_QUERY);
    setIsDesktop(mediaQueryList.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setIsDesktop(event.matches);
    };

    mediaQueryList.addEventListener("change", handleChange);
    return () => mediaQueryList.removeEventListener("change", handleChange);
  }, []);

  return isDesktop;
}
```

El import de `useEffect`/`useState` va junto al import existente de
`framer-motion` en la parte superior del archivo (`lib/motion.ts` no tiene
imports de React todavía — agregar la línea `import { useEffect, useState }
from "react";` antes del import de `framer-motion`).

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS — todos los tests de `useIsDesktop` y los ya existentes de
`lib/motion.test.ts`.

- [ ] **Step 6: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts vitest.setup.ts
git commit -m "feat(motion): agrega useIsDesktop y polyfill de matchMedia en tests"
```

---

### Task 2: Mover `revealUp` a `lib/motion.ts`

**Files:**
- Modify: `lib/motion.ts`
- Modify: `lib/motion.test.ts`
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

El nuevo componente `HorizontalIntroPanels` (Task 3) necesita la misma
variante `revealUp` que ya usa `DashboardContent.tsx` para su rama vertical
de respaldo. En vez de duplicar la definición o crear un import circular
entre los dos archivos, se centraliza en `lib/motion.ts` (que ya define
`EASE_OUT` con el mismo valor de easing que la constante local `EASE` de
`DashboardContent.tsx`).

- [ ] **Step 1: Escribir el test que falla para `revealUp`**

Agregar a `lib/motion.test.ts`, dentro de `describe("variantes de motion", ...)`:

```ts
  it("revealUp parte invisible/desplazado con blur y usa el easing del proyecto", () => {
    expect(revealUp.hidden).toEqual({ opacity: 0, y: 25, filter: "blur(4px)" });
    expect(revealUp.visible).toMatchObject({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.6, ease: EASE_OUT },
    });
  });
```

Agregar `revealUp` al import de `"./motion"`.

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `revealUp` no existe todavía en `lib/motion.ts`.

- [ ] **Step 3: Agregar `revealUp` a `lib/motion.ts`**

Agregar después de `blurFadeUp`:

```ts
export const revealUp: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE_OUT },
  },
};
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS.

- [ ] **Step 5: Actualizar `DashboardContent.tsx` para importar `revealUp`**

En `app/(estudiante)/dashboard/DashboardContent.tsx`, eliminar la definición
local (líneas 82-90 actuales):

```tsx
const revealUp: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};
```

y agregar el import (junto al import ya existente de `ScrollReveal`):

```tsx
import { revealUp } from "@/lib/motion";
```

No se toca `const EASE = [...]` local (sigue usada por `revealLeft`,
`revealRight`, `revealScale`, `revealFromLeftFar`, `revealFromRightFar`).

- [ ] **Step 6: Correr toda la suite de Bienvenida y verificar que sigue en verde**

Run: `npx vitest run "app/(estudiante)/dashboard" components/estudiante/dashboard`
Expected: PASS — mismo comportamiento, ahora `revealUp` viene de
`lib/motion.ts`.

- [ ] **Step 7: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "refactor(motion): centraliza revealUp en lib/motion.ts"
```

---

### Task 3: Componente `HorizontalIntroPanels`

**Files:**
- Create: `components/estudiante/dashboard/HorizontalIntroPanels.tsx`
- Create: `components/estudiante/dashboard/HorizontalIntroPanels.test.tsx`

- [ ] **Step 1: Escribir los tests que fallan**

Crear `components/estudiante/dashboard/HorizontalIntroPanels.test.tsx`:

```tsx
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
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/dashboard/HorizontalIntroPanels.test.tsx`
Expected: FAIL — el módulo `HorizontalIntroPanels.tsx` no existe todavía.

- [ ] **Step 3: Implementar `HorizontalIntroPanels.tsx`**

Crear `components/estudiante/dashboard/HorizontalIntroPanels.tsx`:

```tsx
"use client";

import { useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealUp, useIsDesktop, useReducedMotionSafe } from "@/lib/motion";

const VIDEO_SRC = "https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1";
const VIDEO_TITLE = "Video de bienvenida — Team 100% Real Estate";

function VerticalFallback() {
  return (
    <>
      <ScrollReveal variants={revealUp} once={false} className="relative">
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a{" "}
          <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          by Wilmar Sosa y Samuel Oropeza
        </p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </ScrollReveal>

      <ScrollReveal variants={revealUp} once={false}>
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <iframe
            src={VIDEO_SRC}
            title={VIDEO_TITLE}
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </ScrollReveal>
    </>
  );
}

function HorizontalPanels() {
  const runwayRef = useRef<HTMLDivElement>(null);
  const [videoInert, setVideoInert] = useState(true);

  const { scrollYProgress } = useScroll({
    target: runwayRef,
    offset: ["start start", "end end"],
  });

  const trackX = useTransform(scrollYProgress, [0, 1], ["0%", "-50%"]);
  const titleX = useTransform(scrollYProgress, [0, 0.5], [0, -40]);
  const glowOpacity = useTransform(scrollYProgress, [0, 0.5], [0, 1]);
  const glowScale = useTransform(scrollYProgress, [0, 0.5], [0.8, 1.15]);
  const videoScale = useTransform(scrollYProgress, [0.5, 0.75], [0.94, 1]);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setVideoInert(value < 0.5);
  });

  return (
    <div
      ref={runwayRef}
      data-testid="horizontal-intro-runway"
      className="relative h-[200vh]"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x: trackX }} className="flex h-full w-[200vw]">
          {/* Panel 1: Cabecera */}
          <div className="relative flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10">
            <motion.div
              aria-hidden="true"
              style={{ opacity: glowOpacity, scale: glowScale }}
              className="pointer-events-none absolute inset-x-0 bottom-0 h-[60vh] bg-[radial-gradient(circle_at_50%_100%,rgba(217,167,74,0.12),transparent_60%)]"
            />
            <motion.div style={{ x: titleX }} className="relative">
              <h1 className="font-display text-[64px] font-bold leading-[0.95] tracking-tight text-white sm:text-[90px] lg:text-[140px]">
                Bienvenido a{" "}
                <span className="text-gradient-gold">
                  Team 100% Real Estate
                </span>
              </h1>
              <p className="mt-4 text-xl text-mist-400">
                by Wilmar Sosa y Samuel Oropeza
              </p>
              <div className="absolute -left-6 top-1/2 h-20 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
            </motion.div>
          </div>

          {/* Panel 2: Video */}
          <div
            data-testid="horizontal-intro-video-panel"
            className="flex h-full w-screen shrink-0 flex-col justify-center px-6 sm:px-10"
            inert={videoInert}
          >
            <motion.div
              style={{ scale: videoScale }}
              className="relative aspect-video w-full overflow-hidden rounded-xl"
            >
              <iframe
                src={VIDEO_SRC}
                title={VIDEO_TITLE}
                allow="fullscreen"
                allowFullScreen
                className="h-full w-full"
              />
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function HorizontalIntroPanels() {
  const isDesktop = useIsDesktop();
  const reducedMotion = useReducedMotionSafe();

  if (!isDesktop || reducedMotion) {
    return <VerticalFallback />;
  }

  return <HorizontalPanels />;
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/dashboard/HorizontalIntroPanels.test.tsx`
Expected: PASS — los 4 tests.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores nuevos.

- [ ] **Step 6: Commit**

```bash
git add components/estudiante/dashboard/HorizontalIntroPanels.tsx components/estudiante/dashboard/HorizontalIntroPanels.test.tsx
git commit -m "feat(dashboard): agrega HorizontalIntroPanels (Cabecera+Video paneles horizontales)"
```

---

### Task 4: Integrar `HorizontalIntroPanels` en `DashboardContent.tsx`

**Files:**
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

- [ ] **Step 1: Reemplazar las secciones 1 y 2 por el componente nuevo**

En `app/(estudiante)/dashboard/DashboardContent.tsx`, reemplazar el bloque
(secciones "1. Cabecera Principal" y "2. Video de Bienvenida", líneas
160-180 actuales):

```tsx
      {/* 1. Cabecera Principal */}
      <ScrollReveal variants={revealUp} once={false} className="relative">
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </ScrollReveal>

      {/* 2. Video de Bienvenida (sin marco, sin etiqueta) */}
      <ScrollReveal variants={revealUp} once={false}>
        <div className="relative aspect-video overflow-hidden rounded-xl">
          <iframe
            src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
            title="Video de bienvenida — Team 100% Real Estate"
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </ScrollReveal>
```

por:

```tsx
      {/* 1-2. Cabecera + Video: paneles horizontales en desktop, layout vertical en mobile/reduced-motion */}
      <HorizontalIntroPanels />
```

y agregar el import junto al de `TeamLeaderCard`:

```tsx
import { HorizontalIntroPanels } from "@/components/estudiante/dashboard/HorizontalIntroPanels";
```

- [ ] **Step 2: Correr toda la suite de Bienvenida**

Run: `npx vitest run "app/(estudiante)/dashboard" components/estudiante/dashboard`
Expected: PASS — `page.test.tsx` sigue encontrando el H1 y el iframe con
los mismos textos (ahora renderizados por `HorizontalIntroPanels`, en su
rama vertical porque en el entorno de test `useIsDesktop()` devuelve
`false` por el stub de `matchMedia` de la Task 1).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "feat(dashboard): integra HorizontalIntroPanels en Bienvenida"
```

---

### Task 5: Verificación manual en navegador

**Files:** ninguno (solo verificación, sin cambios de código salvo fixes
que surjan).

- [ ] **Step 1: Levantar un entorno de verificación**

Seguir el mismo patrón usado en los 3 ciclos anteriores de Bienvenida:
`.env.local` con credenciales de Supabase placeholder, una ruta temporal
`app/(public)/preview-dashboard-tmp/page.tsx` que renderiza
`DashboardContent` con datos mock (`miembrosEquipo`, `galeriaEquipo`), y
Playwright instalado temporalmente (`npm install --no-save playwright` +
`npx playwright install chromium`) si no está ya disponible.

- [ ] **Step 2: Verificar el comportamiento en desktop**

Con viewport ≥1024px (ej. 1440×900), confirmar con Playwright:
- El scroll vertical se traduce en desplazamiento horizontal fluido entre
  el panel de Cabecera y el panel de Video.
- El título alcanza el tamaño dramático esperado y el glow dorado crece
  desde abajo a medida que avanza el scroll.
- El video hace zoom-in sutil al activarse.
- `document.documentElement.scrollWidth` no excede `clientWidth` en ningún
  punto del scroll (sin overflow horizontal no deseado).

- [ ] **Step 3: Verificar accesibilidad del panel oculto**

Con el panel de Cabecera activo (scroll en la parte superior del runway),
confirmar que el `iframe` del video no es alcanzable con `Tab` (revisar
`document.activeElement` tras simular tabulación, o verificar el atributo
`inert` presente vía `getAttribute`).

- [ ] **Step 4: Verificar el fallback en mobile**

Con viewport <1024px (ej. 375×812), confirmar que el layout es idéntico al
que existía antes de este ciclo — mismo H1, mismo video, sin ningún rastro
de la estructura de paneles (`horizontal-intro-runway` no debe existir en
el DOM).

- [ ] **Step 5: Verificar el fallback con `prefers-reduced-motion`**

Con Playwright, emular `prefers-reduced-motion: reduce`
(`page.emulateMedia({ reducedMotion: "reduce" })`) en un viewport desktop y
confirmar que también cae al layout vertical.

- [ ] **Step 6: Limpiar artefactos temporales**

Eliminar `.env.local`, la ruta `preview-dashboard-tmp`, cualquier script de
verificación, `dev.log`, y revertir cualquier diff accidental en
`next.config.ts`/`package-lock.json` causado por la instalación temporal de
Playwright. Confirmar `git status` limpio salvo los cambios de código
reales del ciclo.

- [ ] **Step 7: Suite completa y typecheck finales**

Run: `npx vitest run`
Expected: mismos resultados que en `main` antes de este ciclo (incluyendo
el flake conocido y ya documentado de `page.test.tsx` "muestra el
encabezado de bienvenida" al correr la suite completa — pasa en
aislamiento).

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 8: Commit de cualquier fix encontrado durante la verificación**

Si la verificación manual revela ajustes necesarios (timing, thresholds,
overflow, etc.), corregir y commitear con un mensaje descriptivo del
hallazgo — mismo patrón que la saga de overflow horizontal documentada en
`docs/superpowers/plans/2026-07-18-bienvenida-entrada-lateral.md`. Si no se
encontró nada que corregir, este paso se omite.

---

## Self-review notes

- **Spec coverage:** arquitectura pin+scrub con `framer-motion` (Task 3),
  contenido y efectos por panel (Task 3, con la corrección del subtítulo
  documentada arriba), fallback desktop/mobile vía `useIsDesktop` (Task 1,
  3), fallback de `prefers-reduced-motion` (Task 3, ya existía
  `useReducedMotionSafe`), `inert` en el panel oculto (Task 3), alcance
  limitado a Cabecera+Video sin tocar el resto de Bienvenida (Task 4 solo
  toca esas 2 secciones) — todo cubierto.
- **Fuera de alcance confirmado sin tocar:** cualquier otra sección de
  Bienvenida, cualquier otra página, nuevas dependencias, transición
  negro→blanco, comportamiento horizontal en mobile.
- **Consistencia de tipos:** `revealUp` (tipado `Variants`, ahora en
  `lib/motion.ts`) se usa igual en `DashboardContent.tsx` y en
  `HorizontalIntroPanels.tsx` — mismo tipo, mismo valor, una sola fuente de
  verdad. `useIsDesktop`/`useReducedMotionSafe` devuelven `boolean` en
  ambos call sites donde se usan (`HorizontalIntroPanels`).
- **Riesgo detectado y mitigado en el plan:** `window.matchMedia` no existe
  en jsdom por defecto — sin el polyfill de la Task 1, todos los tests que
  renderizan `DashboardContent` (incluyendo `page.test.tsx`, ya existente)
  romperían a partir de la Task 4. El polyfill devuelve `matches: false`,
  preservando el comportamiento/aserciones actuales de esos tests sin
  modificarlos.
