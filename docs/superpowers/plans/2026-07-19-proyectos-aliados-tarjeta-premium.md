# Proyectos Inmobiliarios Aliados — tarjeta premium con foco de scroll Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rediseñar `ProyectoCard.tsx` para que la imagen se vea a brillo
completo (sin texto superpuesto que pueda cubrir rostros) y el precio se
lea con contraste total, y agregar un efecto de "foco" donde la tarjeta
centrada en el showcase horizontal se agranda/resalta en vivo mientras
se desliza.

**Architecture:** Cambio contenido a un solo componente
(`ProyectoCard.tsx`) más una prop nueva pasada desde su único padre
(`ProyectosAliadosGrid.tsx`). El efecto de foco usa `useInView` de
framer-motion (mismo hook que ya usa `ScrollReveal.tsx`) con el
contenedor de scroll como `root` — sin refs manuales ni cálculos de
posición a mano.

**Tech Stack:** Next.js 15, React 19, framer-motion 12, Tailwind CSS,
Vitest + Testing Library.

---

### Task 1: Rediseñar `ProyectoCard.tsx` + foco de scroll

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.tsx`
- Create: `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`

- [ ] **Step 1: Escribir el nuevo `ProyectoCard.test.tsx` (falla)**

Crear `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
con este contenido exacto:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { createRef } from "react";
import { render, screen } from "@testing-library/react";
import { ProyectoCard } from "./ProyectoCard";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

const useInViewMock = vi.fn().mockReturnValue(false);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: (...args: unknown[]) => useInViewMock(...args),
  };
});

function crearProyecto(
  overrides: Partial<ProyectoAliado> & { id: string; nombre: string }
): ProyectoAliado {
  return {
    descripcion: "Descripción de prueba.",
    precioDesde: "Desde $500K",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    whatsappUrl: "https://chat.whatsapp.com/prueba",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("ProyectoCard", () => {
  afterEach(() => {
    useInViewMock.mockClear();
    useInViewMock.mockReturnValue(false);
  });

  it("muestra título, precio, descripción, contacto y el link de WhatsApp", () => {
    const proyecto = crearProyecto({ id: "p1", nombre: "Domus" });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(screen.getByText("Domus")).toBeInTheDocument();
    expect(screen.getByText("Desde $500K")).toBeInTheDocument();
    expect(screen.getByText("Descripción de prueba.")).toBeInTheDocument();
    expect(screen.getByText(/Contacto Prueba/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /unirse al grupo de whatsapp/i })
    ).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
  });

  it("no muestra el precio si precioDesde es null", () => {
    const proyecto = crearProyecto({
      id: "p2",
      nombre: "Elle Residences",
      precioDesde: null,
    });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(screen.queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });

  it("usa el contenedor de scroll como root y angosta la zona de medición al centro", () => {
    const proyecto = crearProyecto({ id: "p3", nombre: "Cualquiera" });
    const containerRef = createRef<HTMLDivElement>();

    render(<ProyectoCard proyecto={proyecto} containerRef={containerRef} />);

    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        root: containerRef,
        margin: "0px -35% 0px -35%",
        amount: 0.6,
      })
    );
  });
});
```

Nota: se verifica que `useInView` se llame con las opciones correctas
(`root`, `margin`, `amount`) en vez de aserciones sobre los valores
animados de `scale`/`opacity` — framer-motion no necesariamente refleja
el valor final de una animación de forma síncrona en jsdom sin que
transcurran frames reales (mismo motivo por el que
`ScrollReveal.test.tsx` verifica argumentos de `useInView` en vez de
estilos computados). El efecto visual de foco se verifica en el
navegador real en la Task 2, no acá.

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: FAIL — `ProyectoCard` no acepta todavía un prop `containerRef`,
y su contenido actual (precio como badge sobre la imagen, sin panel de
texto sólido) no coincide con las aserciones nuevas de layout.

- [ ] **Step 3: Implementar el nuevo `ProyectoCard.tsx`**

Reemplazar el contenido completo de
`components/estudiante/proyectos-aliados/ProyectoCard.tsx`:

```tsx
"use client";

import { useRef, type RefObject } from "react";
import Image from "next/image";
import { motion, useInView } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { useReducedMotionSafe } from "@/lib/motion";

export function ProyectoCard({
  proyecto,
  containerRef,
}: {
  proyecto: ProyectoAliado;
  containerRef: RefObject<HTMLDivElement | null>;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();
  const enFoco = useInView(cardRef, {
    root: containerRef,
    margin: "0px -35% 0px -35%",
    amount: 0.6,
  });

  return (
    <motion.div
      ref={cardRef}
      animate={
        reducedMotion
          ? { scale: 1, opacity: 1 }
          : { scale: enFoco ? 1.04 : 0.94, opacity: enFoco ? 1 : 0.75 }
      }
      transition={{ duration: 0.3 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-[440px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
    >
      {/* Zona de imagen: brillo completo, sin degradado ni texto encima */}
      <div className="relative h-56 shrink-0 overflow-hidden">
        {proyecto.imagenUrl ? (
          <Image
            src={proyecto.imagenUrl}
            alt={proyecto.nombre}
            fill
            sizes="(min-width: 640px) 380px, 320px"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
        )}
      </div>

      {/* Panel de texto: fondo sólido, nunca se superpone a la imagen */}
      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-lg font-bold text-white">
            {proyecto.nombre}
          </h3>
          {proyecto.precioDesde && (
            <span className="shrink-0 font-mono text-sm font-semibold text-gold-300">
              {proyecto.precioDesde}
            </span>
          )}
        </div>
        <p className="line-clamp-2 text-sm leading-relaxed text-mist-300">
          {proyecto.descripcion}
        </p>
        <p className="text-xs text-mist-400">
          {proyecto.contactoNombre} · {proyecto.contactoTelefono}
        </p>
        <a
          href={proyecto.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-auto inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition hover:text-gold-200"
        >
          Unirse al grupo de WhatsApp ↗
        </a>
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: PASS — los 3 tests nuevos.

- [ ] **Step 5: Pasar `containerRef` desde `ProyectosAliadosGrid.tsx`**

En `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`,
cambiar la línea (busca `<ProyectoCard key={proyecto.id} proyecto={proyecto} />`):

```tsx
// antes:
<ProyectoCard key={proyecto.id} proyecto={proyecto} />

// después:
<ProyectoCard key={proyecto.id} proyecto={proyecto} containerRef={scrollRef} />
```

Ningún otro cambio en este archivo — `scrollRef` ya existe (línea 13
actual, `const scrollRef = useRef<HTMLDivElement>(null);`).

- [ ] **Step 6: Correr toda la suite de Proyectos y verificar que pasa**

Run: `npx vitest run components/estudiante/proyectos-aliados/`
Expected: PASS — los 5 tests existentes de `ProyectosAliadosGrid.test.tsx`
(sin cambios de comportamiento esperado, ya que solo verifican
contenido/links, no el layout interno de la tarjeta) más los 3 nuevos de
`ProyectoCard.test.tsx` (8 en total).

- [ ] **Step 7: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 8: Commit**

```bash
git add components/estudiante/proyectos-aliados/
git commit -m "feat(proyectos-aliados): tarjeta con imagen a brillo completo y foco de scroll"
```

---

### Task 2: Verificación manual en navegador

**Files:** ninguno (solo verificación, salvo fixes que surjan).

- [ ] **Step 1: Levantar un entorno de verificación**

Mismo patrón que ciclos anteriores: `.env.local` con credenciales de
Supabase placeholder, y una ruta temporal
`app/(public)/preview-proyectos-tmp/page.tsx` que renderiza
`<ProyectosAliadosGrid proyectos={...datos mock, 6+ proyectos con
imagenUrl real de Unsplash...} />` directamente. Agregar
`images.unsplash.com` a `next.config.ts` temporalmente si se usan
imágenes de Unsplash (revertir en el Step 5).

- [ ] **Step 2: Verificar el layout de la tarjeta**

Con Playwright: confirmar que la imagen se ve a brillo completo (sin
degradado ni texto encima), que el precio se lee con contraste total
junto al título, y que ninguna foto queda con texto superpuesto sobre
ella.

- [ ] **Step 3: Verificar el efecto de foco al deslizar**

Confirmar que la tarjeta centrada en el showcase se agranda/resalta en
vivo mientras se desliza (mouse, flechas de navegación, y drag/touch),
que la transición entre "en foco"/"no en foco" es suave (no un salto
brusco), y que con `page.emulateMedia({ reducedMotion: "reduce" })`
todas las tarjetas quedan a escala/opacidad normal sin el efecto de
foco.

- [ ] **Step 4: Verificar overflow y accesibilidad**

Con `document.documentElement.scrollWidth`/`clientWidth` en
375/768/1024/1440/1920px: confirmar que no hay overflow horizontal a
nivel de página. Confirmar que todas las tarjetas (en foco o no) siguen
siendo alcanzables con teclado y que sus links/botones funcionan
normalmente sin importar su escala/opacidad visual.

- [ ] **Step 5: Limpiar artefactos temporales**

Eliminar `.env.local`, la ruta de preview temporal, scripts de
verificación, `dev.log`, y revertir cualquier diff accidental en
`next.config.ts`/`package-lock.json`. Confirmar `git status` limpio
salvo los cambios de código reales del ciclo.

- [ ] **Step 6: Suite completa, typecheck, y build de producción finales**

Run: `npx vitest run`
Expected: mismos resultados que en `main` antes de este ciclo (incluyendo
el flake conocido y ya documentado de
`app/(estudiante)/dashboard/page.test.tsx` "muestra el encabezado de
bienvenida" al correr la suite completa — pasa en aislamiento).

Run: `npx tsc --noEmit`
Expected: sin errores.

Run: `npm run build`
Expected: build exitoso — paso obligatorio en este proyecto desde el
incidente de build roto en Vercel de un ciclo anterior. Ninguno de los
archivos de este ciclo es un Server Component ni importa `lib/motion.ts`
desde uno (`ProyectoCard.tsx`/`ProyectosAliadosGrid.tsx` ya son
`"use client"`), así que no debería repetirse ese problema — confirmar
igual con el build real, no asumir.

- [ ] **Step 7: Commit de cualquier fix encontrado durante la verificación**

Si la verificación manual revela ajustes necesarios (por ejemplo, que el
margen/umbral de `useInView` no da un resultado natural en algún ancho de
viewport, o que la transición de escala se siente brusca), corregir y
commitear con un mensaje descriptivo del hallazgo. Si no se encontró
nada que corregir, este paso se omite.

---

## Self-review notes

- **Spec coverage:** imagen a brillo completo sin texto superpuesto
  (Task 1), precio con contraste total en el panel de texto (Task 1),
  efecto de foco vía `useInView` con `root`/`margin`/`amount` (Task 1),
  bypass de `prefers-reduced-motion` (Task 1, verificado en navegador en
  Task 2) — todo cubierto.
- **Fuera de alcance confirmado sin tocar:** modelo de datos, página de
  admin de proyectos, el master-detalle de Aliados (ciclo anterior, ya
  cerrado y sin relación con este), cualquier otra página, nuevas
  dependencias.
- **Consistencia de tipos:** `containerRef: RefObject<HTMLDivElement |
  null>` en `ProyectoCard` coincide exactamente con el tipo de
  `scrollRef` ya declarado en `ProyectosAliadosGrid.tsx`
  (`useRef<HTMLDivElement>(null)`) y con lo que `useInView`'s opción
  `root` espera (`RefObject<Element | null>`, verificado contra los
  tipos de framer-motion instalados en este proyecto).
- **Riesgo de testing de animaciones identificado y evitado:** en vez de
  aserciones sobre valores de `scale`/`opacity` computados (que
  framer-motion no necesariamente refleja de forma síncrona en jsdom sin
  frames reales — ya se vio un problema análogo con
  `AnimatePresence mode="wait"` en el ciclo anterior de Aliados), los
  tests de Task 1 verifican que `useInView` se invoca con las opciones
  correctas; el efecto visual en sí se confirma empíricamente en el
  navegador en la Task 2.
