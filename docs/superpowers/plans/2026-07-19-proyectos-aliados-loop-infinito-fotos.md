# Proyectos Aliados — loop infinito + fotos más altas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que el carrusel de Proyectos Inmobiliarios Aliados haga loop infinito también con scroll/swipe manual (no solo con los botones), de forma invisible; y agrandar la tarjeta para que los logos pegados al borde superior de las fotos dejen de recortarse.

**Architecture:** `ProyectosAliadosGrid` pasa de renderizar una copia de `proyectos` a renderizar **tres copias consecutivas** (`antes` / `real` / `despues`) dentro del mismo contenedor de scroll. Solo la copia `real` es interactiva (las copias `antes`/`despues` quedan `inert`, ocultas de teclado/lector de pantalla). Cuando el cálculo de intensidad (que ya corre en cada scroll/resize) detecta que la tarjeta más centrada es un clon, reposiciona `scrollLeft` instantáneamente (sin animación) hacia la tarjeta real equivalente — como el contenido es idéntico pixel por pixel entre copias, el salto no se percibe. Los botones `‹ ›` no cambian: siguen apuntando siempre a la copia real vía `scrollTo`. `ProyectoCard` crece de alto (tarjeta y zona de foto) y ancla el recorte de la foto hacia arriba.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12, Tailwind CSS, Vitest + Testing Library.

---

## Task 1: `ProyectoCard.tsx` — tarjeta más alta, foto anclada arriba, prop `inert`

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`

**Contexto para quien implemente:** Las fotos de los proyectos tienen logos pegados al borde superior que quedan recortados por la altura fija de la zona de imagen (`h-56` = 224px) combinada con `object-cover` centrado. Se agranda la tarjeta completa (no se achica el panel de texto) y se ancla el recorte hacia arriba con `object-top`. Además, `ProyectoCard` necesita una nueva prop opcional `inert` (default `false`): en la Task 2, `ProyectosAliadosGrid` va a renderizar 3 copias de cada tarjeta (para loop infinito) y necesita poder marcar las copias clonadas como `inert` para que queden fuera de la navegación por teclado/lector de pantalla — mismo patrón que ya usa `ScrollReveal.tsx` en este proyecto (`inert={!isInView}` en su `motion.div` raíz).

- [ ] **Paso 1: Escribir los tests que fallan para `inert`**

Añadir al final del `describe("ProyectoCard", ...)` existente en `components/estudiante/proyectos-aliados/ProyectoCard.test.tsx` (después del test "no muestra el precio si precioDesde es null"):

```tsx
  it("no queda inert por defecto", () => {
    const proyecto = crearProyecto({ id: "p3", nombre: "Tercero" });
    const { container } = render(<ProyectoCard proyecto={proyecto} intensidad={0} />);
    expect(container.firstElementChild).not.toHaveAttribute("inert");
  });

  it("queda inert cuando se pasa inert=true (usado para las copias clonadas del loop)", () => {
    const proyecto = crearProyecto({ id: "p4", nombre: "Cuarto" });
    const { container } = render(
      <ProyectoCard proyecto={proyecto} intensidad={0} inert />
    );
    expect(container.firstElementChild).toHaveAttribute("inert");
  });
```

- [ ] **Paso 2: Correr los tests y verificar que los 2 nuevos fallan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: los 6 tests existentes pasan; los 2 nuevos FALLAN (`inert` no existe como prop todavía, TypeScript se quejaría en build real pero en el test en runtime simplemente no se refleja el atributo).

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
  { proyecto: ProyectoAliado; intensidad: number; inert?: boolean }
>(function ProyectoCard({ proyecto, intensidad, inert = false }, ref) {
  const reducedMotion = useReducedMotionSafe();

  return (
    <motion.div
      ref={ref}
      inert={inert}
      animate={calcularEstiloFoco(intensidad, reducedMotion)}
      transition={{ duration: 0.1 }}
      whileHover={{ y: -6 }}
      className="group relative flex h-[504px] w-[320px] shrink-0 snap-center flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
    >
      <div className="relative h-72 shrink-0 overflow-hidden">
        {proyecto.imagenUrl ? (
          <Image
            src={proyecto.imagenUrl}
            alt={proyecto.nombre}
            fill
            sizes="(min-width: 640px) 380px, 320px"
            className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
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

- [ ] **Paso 4: Correr los tests y verificar que todos pasan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectoCard.test.tsx`
Expected: PASS (8 tests: 4 de `calcularEstiloFoco` + 4 de `ProyectoCard`)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectoCard.tsx components/estudiante/proyectos-aliados/ProyectoCard.test.tsx
git commit -m "feat(proyectos-aliados): tarjeta mas alta con foto anclada arriba y prop inert"
```

---

## Task 2: `ProyectosAliadosGrid.tsx` — renderizado triplicado + loop infinito invisible

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`

**Contexto para quien implemente:** Hoy `ProyectosAliadosGrid` renderiza una tarjeta `ProyectoCard` por cada proyecto, indexadas por `proyecto.id` en `cardRefs`/`intensidad`. Los botones `‹ ›` ya hacen loop correctamente (módulo sobre el índice), pero el scroll/swipe manual se detiene en los extremos. Vamos a renderizar **tres copias consecutivas** de la lista completa (`antes`, `real`, `despues`) para que siempre haya contenido más allá de cualquier extremo visible, y detectar+corregir silenciosamente cuando el usuario cruza hacia una copia clonada.

**Cambio de indexación importante:** como el mismo `proyecto.id` ahora aparece 3 veces en el DOM, `cardRefs` e `intensidad` dejan de indexarse por `proyecto.id` puro y pasan a indexarse por una `clave` compuesta `"segmento:id"` (ej. `"real:abc123"`, `"antes:abc123"`, `"despues:abc123"`). Los botones (`indiceCentrado`/`desplazar`), que deben seguir apuntando siempre a la copia real, ahora buscan explícitamente `` `real:${proyecto.id}` ``.

**Nota sobre testing:** como ahora el mismo texto/link de cada proyecto aparece 3 veces en el DOM (una por copia), varios tests existentes que usaban queries singulares (`getByText`) necesitan filtrar explícitamente a la copia "real" (identificable por no tener el atributo `inert`, ya que las copias clonadas sí lo tienen). Los tests que solo verifican el *valor* de un atributo (ej. el `href` del link de WhatsApp) no necesitan cambiar, porque las 3 copias de una misma tarjeta tienen contenido idéntico.

- [ ] **Paso 1: Reemplazar `ProyectosAliadosGrid.test.tsx` completo**

Reemplazar el contenido completo de `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx` por:

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import { ProyectosAliadosGrid } from "./ProyectosAliadosGrid";
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

const PROYECTOS: ProyectoAliado[] = [
  crearProyecto({ id: "p1", nombre: "Domus" }),
  crearProyecto({ id: "p2", nombre: "Elle Residences", precioDesde: null }),
];

function tarjetasReales(container: HTMLElement): HTMLElement[] {
  const scrollContainer = container.querySelector(".overflow-x-auto");
  if (!scrollContainer) throw new Error("scroll container no encontrado");
  return Array.from(scrollContainer.children).filter(
    (card): card is HTMLElement => !card.hasAttribute("inert")
  );
}

function mockearGeometria(
  scrollContainer: HTMLElement,
  anchoTarjeta: number,
  gap: number
): HTMLElement[] {
  const todasLasTarjetas = Array.from(scrollContainer.children) as HTMLElement[];
  Object.defineProperty(scrollContainer, "clientWidth", {
    configurable: true,
    value: anchoTarjeta,
  });
  todasLasTarjetas.forEach((card, i) => {
    Object.defineProperty(card, "offsetLeft", {
      configurable: true,
      value: i * (anchoTarjeta + gap),
    });
    Object.defineProperty(card, "offsetWidth", {
      configurable: true,
      value: anchoTarjeta,
    });
  });
  return todasLasTarjetas;
}

function mockearScrollLeft(scrollContainer: HTMLElement, valorInicial: number): () => number {
  let actual = valorInicial;
  Object.defineProperty(scrollContainer, "scrollLeft", {
    configurable: true,
    get: () => actual,
    set: (v: number) => {
      actual = v;
    },
  });
  return () => actual;
}

describe("ProyectosAliadosGrid", () => {
  it("renderiza una tarjeta real por cada proyecto (mas las copias clonadas para el loop)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    expect(scrollContainer.children).toHaveLength(6); // 3 segmentos x 2 proyectos

    const reales = tarjetasReales(container);
    expect(reales).toHaveLength(2);
    expect(reales[0]).toHaveTextContent("Domus");
    expect(reales[1]).toHaveTextContent("Elle Residences");
  });

  it("muestra el precio solo si precioDesde no es null (en la copia real)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const reales = tarjetasReales(container);
    expect(within(reales[0]).getByText(/^Desde \$/)).toBeInTheDocument();
    expect(within(reales[1]).queryByText(/^Desde \$/)).not.toBeInTheDocument();
  });

  it("el link de WhatsApp usa la URL correcta y abre en una pestaña nueva", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const links = screen.getAllByRole("link", { name: /unirse al grupo de whatsapp/i });
    expect(links[0]).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(links[0]).toHaveAttribute("target", "_blank");
  });

  it("muestra la comisión regular y la del equipo", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByText(/comisión regular/i)).toBeInTheDocument();
    expect(screen.getByText(/comisión para el equipo/i)).toBeInTheDocument();
  });

  it("tiene botones de navegación con su aria-label", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByRole("button", { name: "Proyecto anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proyecto siguiente" })).toBeInTheDocument();
  });

  it("las copias clonadas quedan inert (fuera del teclado/lector de pantalla)", () => {
    const { container } = render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    const scrollContainer = container.querySelector(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const todas = Array.from(scrollContainer.children) as HTMLElement[];
    const inert = todas.filter((el) => el.hasAttribute("inert"));
    const noInert = todas.filter((el) => !el.hasAttribute("inert"));
    expect(inert).toHaveLength(4); // 2 segmentos clon x 2 proyectos
    expect(noInert).toHaveLength(2); // segmento real x 2 proyectos
  });

  it("el botón 'Proyecto anterior' en la primera tarjeta real centra la última tarjeta real (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    expect(reales).toHaveLength(3);

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    mockearScrollLeft(scrollContainer, centroPrimeraReal - CARD_WIDTH / 2);
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));
    fireEvent.click(screen.getByRole("button", { name: "Proyecto anterior" }));

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroUltimaReal - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("el botón 'Proyecto siguiente' en la última tarjeta real centra la primera tarjeta real (loop)", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    mockearScrollLeft(scrollContainer, centroUltimaReal - CARD_WIDTH / 2);
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));
    fireEvent.click(screen.getByRole("button", { name: "Proyecto siguiente" }));

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    expect(scrollContainer.scrollTo).toHaveBeenCalledWith({
      left: centroPrimeraReal - CARD_WIDTH / 2,
      behavior: "smooth",
    });
  });

  it("si la tarjeta centrada cae en un clon 'después', el scroll se reposiciona silenciosamente a la copia real equivalente", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    const todas = mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    // El primer clon "después" es la tarjeta inmediatamente siguiente a las 3 reales.
    const indiceUltimaReal = todas.indexOf(reales[2]);
    const primerClonDespues = todas[indiceUltimaReal + 1];

    const centroClonDespues = primerClonDespues.offsetLeft + primerClonDespues.offsetWidth / 2;
    const leerScrollLeft = mockearScrollLeft(
      scrollContainer,
      centroClonDespues - CARD_WIDTH / 2
    );
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));

    const centroPrimeraReal = reales[0].offsetLeft + reales[0].offsetWidth / 2;
    expect(leerScrollLeft()).toBeCloseTo(centroPrimeraReal - CARD_WIDTH / 2);
  });

  it("si la tarjeta centrada cae en un clon 'antes', el scroll se reposiciona silenciosamente a la copia real equivalente", () => {
    const proyectos = [
      crearProyecto({ id: "p1", nombre: "Uno" }),
      crearProyecto({ id: "p2", nombre: "Dos" }),
      crearProyecto({ id: "p3", nombre: "Tres" }),
    ];
    const { container } = render(<ProyectosAliadosGrid proyectos={proyectos} />);

    const scrollContainer = container.querySelector<HTMLDivElement>(".overflow-x-auto");
    if (!scrollContainer) throw new Error("scroll container no encontrado");
    const CARD_WIDTH = 320;
    const GAP = 24;
    const todas = mockearGeometria(scrollContainer, CARD_WIDTH, GAP);
    const reales = tarjetasReales(container);
    // El último clon "antes" (el de p3) es la tarjeta inmediatamente previa a las 3 reales.
    const indicePrimeraReal = todas.indexOf(reales[0]);
    const ultimoClonAntes = todas[indicePrimeraReal - 1];

    const centroClonAntes = ultimoClonAntes.offsetLeft + ultimoClonAntes.offsetWidth / 2;
    const leerScrollLeft = mockearScrollLeft(
      scrollContainer,
      centroClonAntes - CARD_WIDTH / 2
    );
    scrollContainer.scrollTo = vi.fn();

    fireEvent(window, new Event("resize"));

    const centroUltimaReal = reales[2].offsetLeft + reales[2].offsetWidth / 2;
    expect(leerScrollLeft()).toBeCloseTo(centroUltimaReal - CARD_WIDTH / 2);
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar cuáles fallan**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: FAIL en la mayoría de los tests (el componente todavía renderiza solo 1 copia por proyecto, no tiene `inert`, y no reposiciona el scroll).

- [ ] **Paso 3: Reemplazar `ProyectosAliadosGrid.tsx`**

Reemplazar el contenido completo de `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx` por:

```tsx
"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const FALLOFF_FACTOR = 1.5;

type Segmento = "antes" | "real" | "despues";
const SEGMENTOS: Segmento[] = ["antes", "real", "despues"];

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef(new Map<string, HTMLDivElement>());
  const posicionInicialAplicada = useRef(false);
  const [intensidad, setIntensidad] = useState<Map<string, number>>(
    () => new Map(proyectos.length > 0 ? [[`real:${proyectos[0].id}`, 1]] : [])
  );
  const reducedMotion = useReducedMotionSafe();

  const tarjetas = useMemo(
    () =>
      SEGMENTOS.flatMap((segmento) =>
        proyectos.map((proyecto) => ({
          clave: `${segmento}:${proyecto.id}`,
          segmento,
          proyecto,
        }))
      ),
    [proyectos]
  );

  const actualizarIntensidad = useCallback(() => {
    const container = scrollRef.current;
    if (!container) return;

    const medidas = tarjetas
      .map((t) => {
        const el = cardRefs.current.get(t.clave);
        return el ? { ...t, centro: el.offsetLeft + el.offsetWidth / 2 } : null;
      })
      .filter((m): m is NonNullable<typeof m> => m !== null);
    if (medidas.length < 2) return;

    const espaciado = medidas[1].centro - medidas[0].centro;
    const distanciaCaida = espaciado * FALLOFF_FACTOR;
    if (distanciaCaida <= 0) return;

    function calcularIntensidades(centroContenedor: number) {
      let masCercana = medidas[0];
      let menorDistancia = Infinity;
      const mapa = new Map<string, number>();
      for (const m of medidas) {
        const distancia = Math.abs(m.centro - centroContenedor);
        const normalizada = Math.min(distancia / distanciaCaida, 1);
        mapa.set(m.clave, 1 - normalizada);
        if (distancia < menorDistancia) {
          menorDistancia = distancia;
          masCercana = m;
        }
      }
      return { mapa, masCercana };
    }

    const centroContenedor = container.scrollLeft + container.clientWidth / 2;
    const { mapa, masCercana } = calcularIntensidades(centroContenedor);

    if (masCercana.segmento === "real") {
      setIntensidad(mapa);
      return;
    }

    const centroReal = cardRefs.current.get(`real:${masCercana.proyecto.id}`)?.offsetLeft;
    const centroClon = cardRefs.current.get(
      `${masCercana.segmento}:${masCercana.proyecto.id}`
    )?.offsetLeft;
    if (centroReal === undefined || centroClon === undefined) {
      setIntensidad(mapa);
      return;
    }

    const ajuste = centroReal - centroClon;
    container.scrollLeft = container.scrollLeft + ajuste;

    const { mapa: mapaCorregido } = calcularIntensidades(
      container.scrollLeft + container.clientWidth / 2
    );
    setIntensidad(mapaCorregido);
  }, [tarjetas]);

  useEffect(() => {
    actualizarIntensidad();

    window.addEventListener("resize", actualizarIntensidad);
    return () => window.removeEventListener("resize", actualizarIntensidad);
  }, [actualizarIntensidad]);

  useLayoutEffect(() => {
    if (posicionInicialAplicada.current || proyectos.length === 0) return;
    const container = scrollRef.current;
    const primeraReal = cardRefs.current.get(`real:${proyectos[0].id}`);
    if (!container || !primeraReal) return;

    container.scrollLeft = primeraReal.offsetLeft;
    posicionInicialAplicada.current = true;
  });

  function indiceCentrado(): number {
    let mejorIndice = 0;
    let mejorIntensidad = -Infinity;
    proyectos.forEach((proyecto, i) => {
      const valor = intensidad.get(`real:${proyecto.id}`) ?? 0;
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
    const card = cardRefs.current.get(`real:${proyectos[siguiente].id}`);
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
          {tarjetas.map(({ clave, segmento, proyecto }) => (
            <ProyectoCard
              key={clave}
              proyecto={proyecto}
              intensidad={intensidad.get(clave) ?? 0}
              inert={segmento !== "real"}
              ref={(el) => {
                if (el) {
                  cardRefs.current.set(clave, el);
                } else {
                  cardRefs.current.delete(clave);
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
Expected: PASS (10 tests)

- [ ] **Paso 5: Correr el tsc para confirmar que no hay errores de tipos**

Run: `npx tsc --noEmit`
Expected: sin salida (limpio).

- [ ] **Paso 6: Commit**

```bash
git add components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx
git commit -m "feat(proyectos-aliados): loop infinito invisible en scroll manual via renderizado triplicado"
```

---

## Task 3: Verificación

**Files:** ninguno (verificación, sin cambios de código salvo hallazgos a corregir)

- [ ] **Paso 1: Build de producción**

Crear un `.env.local` temporal si no existe ya (con `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` como valores
placeholder), luego:

Run: `npm run build`
Expected: build exitoso sin errores (33/33 rutas, exit code 0). Limpiar el
`.env.local` temporal después si no existía antes.

- [ ] **Paso 2: Verificación visual en navegador**

Esta verificación requiere un navegador real y esta sesión, al momento de
escribir este plan, no cuenta con herramienta de navegador disponible. Si
quien ejecuta este plan SÍ tiene una herramienta de navegador disponible,
debe usarla para confirmar en `app/(estudiante)/proyectos-inmobiliarios-aliados/page.tsx`
(con datos mock si es necesario):

- Las fotos muestran los logos completos, sin recortar el borde superior.
- Deslizar manualmente (mouse/touch) más allá del último proyecto continúa
  sin corte visible hacia el primero, y viceversa deslizando hacia atrás
  antes del primero.
- El salto de reposicionamiento del scroll **no se nota** — este es el
  punto más importante a confirmar, ya que es el mayor riesgo de esta
  implementación.
- Los botones `‹ ›` se siguen comportando igual que antes del loop
  infinito manual (siguen centrando la tarjeta real correspondiente).
- Tabular con teclado nunca llega a una tarjeta clon — el foco salta
  directo entre las tarjetas reales solamente.
- `prefers-reduced-motion` sigue desactivando el efecto de intensidad.
- No hay overflow horizontal a nivel de página en ningún viewport.

Si NO hay herramienta de navegador disponible en la sesión que ejecuta este
plan: preguntar explícitamente al usuario cómo prefiere proceder (mismo
patrón ya usado en el ciclo anterior de este proyecto) — no asumir que
está bien saltarse esta verificación ni reportarla como hecha sin haberla
hecho.

- [ ] **Paso 3: Commit (si hubo que corregir algo durante la verificación)**

Si la verificación no encontró problemas, no hay nada que commitear en
este paso. Si se encontró y corrigió algo, commitear ese fix con un
mensaje descriptivo del problema encontrado.

---

## Self-Review Notes

- **Cobertura del spec:** fotos más altas + `object-top` (Task 1), prop
  `inert` para clones (Task 1), renderizado triplicado (Task 2), efecto de
  intensidad sobre las 3 copias (Task 2, `tarjetas`/`medidas` cubren las
  3×N tarjetas), reposicionamiento silencioso en ambas direcciones (Task 2,
  fórmula `ajuste = centroReal - centroClon` sin necesidad de rama
  condicional por dirección — verificado a mano con números concretos para
  ambos casos "antes" y "despues" antes de escribir este plan), posición
  inicial en la copia real (Task 2, `useLayoutEffect`), botones sin cambio
  de comportamiento (Task 2, siguen usando `real:${id}`), accesibilidad
  (Task 1 + 2, `inert`), testing (Tasks 1-2), verificación manual + build
  obligatorio con manejo explícito de la falta de herramienta de navegador
  (Task 3), fuera de alcance respetado (sin clonado parcial, sin cambios
  de datos, sin nuevas dependencias).
- **Corrección verificada a mano:** la fórmula de reposicionamiento
  (`ajuste = centroReal - centroClon`) se verificó con valores numéricos
  concretos para 3 proyectos (ancho 320px, gap 24px) en ambas direcciones
  antes de incluirla en este plan, porque una primera versión con rama
  condicional (`segmento === "antes" ? anchoSegmento : -anchoSegmento`)
  resultó tener signo incorrecto en el caso "despues" al verificarla a
  mano — la fórmula sin rama condicional (usando siempre el clon
  específicamente centrado y su gemelo real) es la que quedó en el código
  final de este plan.
- **Consistencia de tipos:** `clave: string` (formato `"segmento:id"`) es
  consistente entre `tarjetas` (Task 2), `cardRefs`, `intensidad`, y las
  claves usadas por `indiceCentrado`/`desplazar` (`` `real:${id}` ``).
  `inert?: boolean` en `ProyectoCard` (Task 1) es el mismo nombre y tipo
  usado en su único call site dentro de `ProyectosAliadosGrid` (Task 2,
  `inert={segmento !== "real"}`).
- **Sin placeholders:** todos los pasos incluyen código completo, comandos
  exactos y resultados esperados concretos.
