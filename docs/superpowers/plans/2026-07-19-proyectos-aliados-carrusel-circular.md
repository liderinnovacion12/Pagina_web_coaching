# Proyectos Aliados — carrusel circular con foco progresivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el efecto de foco binario (on/off) de las tarjetas de Proyectos Inmobiliarios Aliados por un efecto de foco progresivo por distancia (tipo Coverflow) y agregar navegación circular (loop) a los botones de flecha.

**Architecture:** `ProyectoCard` pasa de recibir `enFoco: boolean` a recibir `intensidad: number` (0 a 1) y usa una función pura exportada para mapear esa intensidad a `scale`/`opacity`. `ProyectosAliadosGrid` calcula un mapa de intensidades continuas (una por tarjeta) en cada evento de scroll/resize, en vez de un solo id "enfocado", y sus botones de navegación calculan el índice de la tarjeta centrada + salto circular con aritmética de módulo, centrando la tarjeta destino con `scrollTo` en vez de un `scrollBy` de píxeles fijos.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12, Tailwind CSS, Vitest + Testing Library.

---

## Task 1: `ProyectoCard.tsx` — intensidad continua en vez de `enFoco` booleano

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`

**Contexto para quien implemente:** Hoy `ProyectoCard` recibe una prop `enFoco: boolean` y anima `scale`/`opacity` entre dos valores fijos. La vamos a reemplazar por una prop `intensidad: number` (0 = tarjeta lejos del centro, 1 = tarjeta perfectamente centrada) que se interpola linealmente entre un extremo "lejano" y uno "centrado". Para poder testear esa interpolación sin pelear con los tiempos de animación de Framer Motion en jsdom (lección aprendida en el ciclo anterior: no se puede confiar en leer valores de `scale`/`opacity` computados sincrónicamente en tests), la función de interpolación se extrae como una función pura exportada (`calcularEstiloFoco`) que se testea directamente con aritmética simple, sin renderizar nada.

- [ ] **Paso 1: Escribir los tests que fallan para `calcularEstiloFoco`**

Reemplazar el contenido completo de `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx` por:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProyectoCard, calcularEstiloFoco } from "./ProyectoCard";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";

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

describe("calcularEstiloFoco", () => {
  it("en intensidad 0 devuelve la escala/opacidad más lejanas", () => {
    expect(calcularEstiloFoco(0, false)).toEqual({ scale: 0.82, opacity: 0.45 });
  });

  it("en intensidad 1 devuelve la escala/opacidad más centradas", () => {
    expect(calcularEstiloFoco(1, false)).toEqual({ scale: 1.12, opacity: 1 });
  });

  it("en intensidad 0.5 interpola a mitad de camino", () => {
    const resultado = calcularEstiloFoco(0.5, false);
    expect(resultado.scale).toBeCloseTo(0.97);
    expect(resultado.opacity).toBeCloseTo(0.725);
  });

  it("con reducedMotion=true ignora la intensidad y devuelve escala/opacidad neutras", () => {
    expect(calcularEstiloFoco(1, true)).toEqual({ scale: 1, opacity: 1 });
    expect(calcularEstiloFoco(0, true)).toEqual({ scale: 1, opacity: 1 });
  });
});

describe("ProyectoCard", () => {
  it("muestra título, precio, descripción, contacto y el link de WhatsApp", () => {
    const proyecto = crearProyecto({ id: "p1", nombre: "Domus" });

    render(<ProyectoCard proyecto={proyecto} intensidad={0} />);

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

    render(<ProyectoCard proyecto={proyecto} intensidad={1} />);

    expect(screen.queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: FAIL — `calcularEstiloFoco` no existe todavía (import error) y `ProyectoCard` no acepta `intensidad`.

- [ ] **Paso 3: Reemplazar `ProyectoCard.tsx`**

Reemplazar el contenido completo de `components/estudiante/proyectos-aliados/ProyectoCard.tsx` por:

```tsx
"use client";

import { forwardRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { useReducedMotionSafe } from "@/lib/motion";

const SCALE_LEJANA = 0.82;
const SCALE_CENTRO = 1.12;
const OPACITY_LEJANA = 0.45;
const OPACITY_CENTRO = 1;

function interpolar(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

export function calcularEstiloFoco(intensidad: number, reducedMotion: boolean) {
  if (reducedMotion) {
    return { scale: 1, opacity: 1 };
  }
  return {
    scale: interpolar(SCALE_LEJANA, SCALE_CENTRO, intensidad),
    opacity: interpolar(OPACITY_LEJANA, OPACITY_CENTRO, intensidad),
  };
}

export const ProyectoCard = forwardRef<
  HTMLDivElement,
  { proyecto: ProyectoAliado; intensidad: number }
>(function ProyectoCard({ proyecto, intensidad }, ref) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      ref={ref}
      animate={calcularEstiloFoco(intensidad, reducedMotion)}
      transition={{ duration: 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-[440px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
    >
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

      <div className="flex flex-1 flex-col gap-2 p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-1 font-display text-lg font-bold text-white">
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
        <p className="truncate text-xs text-mist-400">
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
});
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: PASS (7 tests: 4 de `calcularEstiloFoco` + 3 de `ProyectoCard`)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectoCard.tsx components/estudiante/proyectos-aliados/ProyectoCard.test.tsx
git commit -m "feat(proyectos-aliados): foco progresivo por intensidad en vez de booleano"
```

---

## Task 2: `ProyectosAliadosGrid.tsx` — intensidades continuas + navegación circular

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`

**Contexto para quien implemente:** Este componente ya recalcula, en cada evento de scroll y resize, qué tarjeta está más cerca del centro visible del contenedor (usando `offsetLeft`/`offsetWidth`/`scrollLeft`/`clientWidth` — matemática de posición, no `useInView`, porque `useInView` resultó matemáticamente inviable en anchos móviles/tablet en el ciclo anterior). Hoy ese cálculo produce un solo id booleano (`enFocoId`). Lo vamos a cambiar para que produzca un mapa `Map<string, number>` con la intensidad (0 a 1) de **cada** tarjeta. Los botones de flecha (`desplazar`) hoy hacen un `scrollBy` de una cantidad fija de píxeles (400px) sin saber qué tarjeta está centrada; los vamos a cambiar para que calculen el índice de la tarjeta centrada (a partir de qué id tiene mayor intensidad), salten al índice siguiente/anterior con aritmética de módulo (dando la vuelta en los extremos), y centren esa tarjeta exactamente con `scrollTo`.

**Nota sobre testing de geometría en jsdom:** jsdom no calcula layout real, así que `offsetLeft`/`offsetWidth`/`clientWidth` son 0 por defecto. Para testear la lógica de índice/loop, los tests van a sobreescribir esas propiedades directamente en los nodos DOM ya renderizados con `Object.defineProperty(..., { configurable: true, value: N })`, y van a forzar un recálculo disparando un evento `resize` en `window` (que ya está cableado a través de `window.addEventListener("resize", actualizarIntensidad)` desde el ciclo anterior) — evitar depender de que `fireEvent.scroll` dispare el handler `onScroll` de React, que es menos confiable en jsdom para eventos que no hacen bubble.

- [ ] **Paso 1: Escribir los tests que fallan para el loop circular**

Añadir al final de `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx` (dentro del `describe("ProyectosAliadosGrid", ...)` existente, después del último `it(...)` actual), y actualizar los imports al inicio del archivo:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
```

(reemplaza la línea de import de `"vitest"` y la de `"@testing-library/react"` existentes al inicio del archivo por estas dos líneas).

Nuevos tests (agregar dentro del mismo `describe`, después del último test actual "tiene botones de navegación con su aria-label"):

```tsx
  it("el botón 'Proyecto anterior' en la primera tarjeta centra la última (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const cards = Array.from(scrollContainer.children) as HTMLDivElement[];
    expect(cards).toHaveLength(3);

    const CARD_WIDTH = 320;
    const GAP = 24;
    Object.defineProperty(scrollContainer, "clientWidth", {
      configurable: true,
      value: CARD_WIDTH,
    });
    Object.defineProperty(scrollContainer, "scrollLeft", {
      configurable: true,
      value: 0,
      writable: true,
    });
    cards.forEach((card, i) => {
      Object.defineProperty(card, "offsetLeft", {
        configurable: true,
        value: i * (CARD_WIDTH + GAP),
      });
      Object.defineProperty(card, "offsetWidth", {
        configurable: true,
        value: CARD_WIDTH,
      });
    });
    scrollContainer.scrollTo = vi.fn();

    // Fuerza el recálculo de intensidades con la geometría mockeada de arriba.
    // La tarjeta centrada resultante (scrollLeft=0) es la primera (índice 0).
    fireEvent(window, new Event("resize"));

    fireEvent.click(screen.getByRole("button", { name: "Proyecto anterior" }));

    const centroUltima = cards[2].offsetLeft + cards[2].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroUltima - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("el botón 'Proyecto siguiente' en la última tarjeta centra la primera (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const cards = Array.from(scrollContainer.children) as HTMLDivElement[];

    const CARD_WIDTH = 320;
    const GAP = 24;
    Object.defineProperty(scrollContainer, "clientWidth", {
      configurable: true,
      value: CARD_WIDTH,
    });
    cards.forEach((card, i) => {
      Object.defineProperty(card, "offsetLeft", {
        configurable: true,
        value: i * (CARD_WIDTH + GAP),
      });
      Object.defineProperty(card, "offsetWidth", {
        configurable: true,
        value: CARD_WIDTH,
      });
    });
    const centroUltima = cards[2].offsetLeft + cards[2].offsetWidth / 2;
    Object.defineProperty(scrollContainer, "scrollLeft", {
      configurable: true,
      value: centroUltima - CARD_WIDTH / 2,
      writable: true,
    });
    scrollContainer.scrollTo = vi.fn();

    // Fuerza el recálculo: con scrollLeft alineado al centro de la última
    // tarjeta, la tarjeta centrada resultante es la última (índice 2).
    fireEvent(window, new Event("resize"));

    fireEvent.click(screen.getByRole("button", { name: "Proyecto siguiente" }));

    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: 0,
      behavior: "smooth",
    });
  });
```

- [ ] **Paso 2: Correr los tests y verificar que los nuevos fallan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: los 5 tests existentes siguen pasando; los 2 tests nuevos FALLAN (el componente todavía hace `scrollBy` de píxeles fijos, no `scrollTo` centrado, y no expone loop).

- [ ] **Paso 3: Reemplazar `ProyectosAliadosGrid.tsx`**

Reemplazar el contenido completo de `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` por:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const FALLOFF_FACTOR = 1.5;

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const [intensidad, setIntensidad] = useState<Map<string, number>>(
    () => new Map(proyectos.length > 0 ? [[proyectos[0].id, 1]] : [])
  );
  const reducedMotion = useReducedMotionSafe();

  const actualizarIntensidad = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const entradas = proyectos
      .map((p) => cardRefs.current.get(p.id))
      .filter((el): el is HTMLDivElement => !!el);
    if (entradas.length === 0) return;

    const centros = entradas.map((el) => el.offsetLeft + el.offsetWidth / 2);
    const espaciado =
      centros.length > 1 ? centros[1] - centros[0] : container.clientWidth;
    const distanciaCaida = espaciado * FALLOFF_FACTOR;

    const centroContenedor = container.scrollLeft + container.clientWidth / 2;
    const nuevaIntensidad = new Map<string, number>();

    proyectos.forEach((proyecto, i) => {
      const centroTarjeta = centros[i];
      if (centroTarjeta === undefined) return;
      const distancia = Math.abs(centroTarjeta - centroContenedor);
      const normalizada =
        distanciaCaida > 0 ? Math.min(distancia / distanciaCaida, 1) : 0;
      nuevaIntensidad.set(proyecto.id, 1 - normalizada);
    });

    setIntensidad(nuevaIntensidad);
  }, [proyectos]);

  useEffect(() => {
    actualizarIntensidad();

    window.addEventListener("resize", actualizarIntensidad);
    return () => window.removeEventListener("resize", actualizarIntensidad);
  }, [actualizarIntensidad, proyectos]);

  function indiceCentrado(): number {
    let mejorIndice = 0;
    let mejorIntensidad = -Infinity;
    proyectos.forEach((proyecto, i) => {
      const valor = intensidad.get(proyecto.id) ?? 0;
      if (valor > mejorIntensidad) {
        mejorIntensidad = valor;
        mejorIndice = i;
      }
    });
    return mejorIndice;
  }

  function desplazar(direccion: 1 | -1) {
    const container = scrollRef.current;
    if (!container || proyectos.length === 0) return;

    const actual = indiceCentrado();
    const siguiente = (actual + direccion + proyectos.length) % proyectos.length;
    const card = cardRefs.current.get(proyectos[siguiente].id);
    if (!card) return;

    const centroTarjeta = card.offsetLeft + card.offsetWidth / 2;
    const scrollObjetivo = centroTarjeta - container.clientWidth / 2;

    container.scrollTo({
      left: scrollObjetivo,
      behavior: reducedMotion ? "auto" : "smooth",
    });
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Proyectos Inmobiliarios Aliados
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Desarrollos y proyectos con los que trabajamos junto al Team Wilmar & Samuel.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <span className="rounded-full border border-white/10 px-4 py-1.5 text-sm text-mist-300">
            Comisión regular: <span className="font-semibold text-white">6%</span>
          </span>
          <span className="rounded-full border border-gold-500/30 bg-gold-500/10 px-4 py-1.5 text-sm text-gold-200">
            Comisión para el equipo: <span className="font-semibold">7%</span>
          </span>
        </div>
      </motion.div>

      <motion.div variants={blurFadeUp} className="relative">
        <div
          ref={scrollRef}
          onScroll={actualizarIntensidad}
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {proyectos.map((proyecto) => (
            <ProyectoCard
              key={proyecto.id}
              proyecto={proyecto}
              intensidad={intensidad.get(proyecto.id) ?? 0}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(proyecto.id, el);
                } else {
                  cardRefs.current.delete(proyecto.id);
                }
              }}
            />
          ))}
        </div>

        <button
          type="button"
          aria-label="Proyecto anterior"
          onClick={() => desplazar(-1)}
          className="absolute -left-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label="Proyecto siguiente"
          onClick={() => desplazar(1)}
          className="absolute -right-4 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-ink-950/90 text-white backdrop-blur-md transition hover:border-gold-500/40 hover:text-gold-300 sm:flex"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que todos pasan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: PASS (7 tests: 5 existentes + 2 nuevos de loop)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx
git commit -m "feat(proyectos-aliados): navegacion circular por indice en botones de flecha"
```

---

## Task 3: Verificación manual en navegador

**Files:** ninguno (verificación, sin cambios de código salvo hallazgos a corregir)

- [ ] **Paso 1: Preparar entorno temporal**

Crear `.env.local` temporal (si no existe ya) con credenciales placeholder de Supabase, y una ruta de previsualización temporal `app/(public)/preview-carrusel-tmp/page.tsx` que renderice `ProyectosAliadosGrid` con 5-6 proyectos mock (algunos con `imagenUrl` de `images.unsplash.com` — agregar ese hostname a `next.config.ts` temporalmente si se usa, algunos con `precioDesde: null`), siguiendo el mismo patrón de verificación ya usado en el ciclo anterior.

- [ ] **Paso 2: Verificar el efecto de intensidad continua**

Abrir la ruta de previsualización, deslizar el carrusel con mouse/trackpad/touch y confirmar:
- La tarjeta centrada se ve claramente más grande y brillante que las demás.
- Las tarjetas vecinas inmediatas se ven con un tamaño/opacidad intermedios (ni tan grandes como la central ni tan chicas/tenues como las lejanas).
- El cambio de tamaño se siente continuo mientras se desliza, no a saltos.
- No hay overflow horizontal a nivel de página en viewports móvil (375px), tablet (768px) y desktop.

- [ ] **Paso 3: Verificar el loop circular de los botones**

Con el mouse, hacer clic repetido en `‹` desde la primera tarjeta y confirmar que centra la última: y en `›` desde la última tarjeta y confirmar que centra la primera. Confirmar que el scroll queda visualmente centrado en la tarjeta correcta (sin desalineación).

- [ ] **Paso 4: Verificar `prefers-reduced-motion`**

Con la emulación de "reduce motion" activada en las DevTools del navegador, confirmar que todas las tarjetas quedan a escala/opacidad normales (sin importar su posición) y que los botones de flecha centran la tarjeta destino sin scroll suave (salto instantáneo).

- [ ] **Paso 5: Build de producción**

Run: `npm run build`
Expected: build exitoso sin errores. (Recordatorio: los hooks de cliente como `useReducedMotionSafe` dentro de un módulo importado desde un Server Component han roto builds de producción en ciclos anteriores aunque `next dev`/`vitest`/`tsc` no lo detecten — este paso es obligatorio, no opcional.)

- [ ] **Paso 6: Limpieza**

Eliminar la ruta de previsualización temporal, revertir cualquier cambio temporal a `next.config.ts` y `.env.local` si no existían antes. Confirmar con `git status --short` que el working tree queda limpio (sin rastros de archivos temporales).

- [ ] **Paso 7: Commit (si hubo que corregir algo durante la verificación)**

Si la verificación manual no encontró problemas, no hay nada que commitear en este paso. Si se encontró y corrigió algo, commitear ese fix con un mensaje descriptivo del problema encontrado.

---

## Self-Review Notes

- **Cobertura del spec:** intensidad continua (Task 1 + 2), navegación circular solo por botones (Task 2), animación continua durante scroll vía `transition={{ duration: 0.1 }}` (Task 1) y recálculo en cada `onScroll`/`resize` ya existente (Task 2), accesibilidad/reduced-motion (Task 1 `calcularEstiloFoco` + Task 2 `behavior: reducedMotion ? "auto" : "smooth"`), testing (Tasks 1-2), verificación manual + build obligatorio (Task 3), fuera de alcance respetado (no se toca el scroll/swipe manual para loop, no hay cambios de datos ni nuevas dependencias).
- **Consistencia de tipos:** `intensidad: number` es el mismo nombre y tipo en `ProyectoCard.tsx` (Task 1) y en cómo `ProyectosAliadosGrid.tsx` se lo pasa (Task 2, `intensidad={intensidad.get(proyecto.id) ?? 0}`). `calcularEstiloFoco(intensidad: number, reducedMotion: boolean)` se usa igual en su definición y en su único call site dentro de `ProyectoCard`.
- **Sin placeholders:** todos los pasos incluyen código completo, comandos exactos y resultados esperados concretos.
