# Eventos — línea de tiempo cronológica interactiva Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la grilla estática agrupada por categoría de la página de Eventos por una línea de tiempo vertical cronológica interactiva: cada fecha de cada evento es su propia parada ordenada por fecha, con un marcador de "hoy", filtro por categoría, y dos toques interactivos (scroll automático al marcador de "hoy" al cargar, línea de progreso que se llena con el scroll).

**Architecture:** Una función pura nueva (`construirLineaDeTiempo`) aplana la lista de eventos a una lista de "paradas" (una por cada `fecha` de cada evento), ordenada cronológicamente, decidiendo en qué parada de cada evento va el video. `ParadaEvento.tsx` renderiza una parada individual (con atenuación si ya pasó). `EventosTimeline.tsx` (reemplaza `EventosGrid.tsx`) arma la página completa: filtro por categoría, línea vertical con marcador de "hoy" posicionado por índice, línea de progreso ligada al scroll (mismo patrón `useScroll`/`useTransform` ya usado en `HorizontalIntroPanels.tsx` del dashboard), y scroll automático al marcador de "hoy" al montar.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12, Tailwind CSS, Vitest + Testing Library.

---

## Task 1: `lib/db/eventos.types.ts` — `construirLineaDeTiempo`

**Files:**
- Modify: `lib/db/eventos.types.ts`
- Modify: `lib/db/eventos.types.test.ts`

**Contexto para quien implemente:** Este archivo ya tiene `calcularEstadoFecha`, `extraerIdVideoYoutube`, `formatearRangoFecha`, `hoyIso` — funciones puras reutilizadas por los componentes de Eventos. Se agrega una función más: `construirLineaDeTiempo(eventos, hoy)` toma la lista de eventos (cada uno con posiblemente varias `fechas`) y la aplana a una lista de "paradas" — una por cada `fecha` de cada evento — ordenada cronológicamente por `fechaInicio`, sin importar a qué evento o categoría pertenezca cada una. Si un evento tiene varias fechas y un video de YouTube, el video se marca (`mostrarVideo: true`) solo en la fecha más temprana de ese evento específico.

- [ ] **Paso 1: Escribir los tests que fallan**

Añadir al final de `lib/db/eventos.types.test.ts` (agregar `construirLineaDeTiempo` y `type Evento` al import existente de `"./eventos.types"` al inicio del archivo):

```tsx
describe("construirLineaDeTiempo", () => {
  it("crea una parada por cada fecha de un evento", () => {
    const evento: Evento = {
      id: "e1",
      categoria: "internacional",
      titulo: "Evento Multi-Fecha",
      subtitulo: "Sub",
      youtubeUrl: null,
      orden: 0,
      activo: true,
      fechas: [
        { id: "f1", fechaInicio: "2026-03-01", fechaFin: "2026-03-02", ubicacion: "Miami" },
        { id: "f2", fechaInicio: "2026-05-01", fechaFin: "2026-05-02", ubicacion: "Orlando" },
      ],
    };

    const paradas = construirLineaDeTiempo([evento], "2026-01-01");

    expect(paradas).toHaveLength(2);
    expect(paradas.map((p) => p.claveParada)).toEqual(["e1:f1", "e1:f2"]);
  });

  it("ordena las paradas cronologicamente mezclando distintos eventos", () => {
    const eventoA: Evento = {
      id: "a",
      categoria: "internacional",
      titulo: "Evento A",
      subtitulo: "Sub",
      youtubeUrl: null,
      orden: 0,
      activo: true,
      fechas: [{ id: "fa", fechaInicio: "2026-06-01", fechaFin: "2026-06-01", ubicacion: "X" }],
    };
    const eventoB: Evento = {
      id: "b",
      categoria: "nacional_eeuu",
      titulo: "Evento B",
      subtitulo: "Sub",
      youtubeUrl: null,
      orden: 0,
      activo: true,
      fechas: [{ id: "fb", fechaInicio: "2026-02-01", fechaFin: "2026-02-01", ubicacion: "Y" }],
    };

    const paradas = construirLineaDeTiempo([eventoA, eventoB], "2026-01-01");

    expect(paradas.map((p) => p.evento.id)).toEqual(["b", "a"]);
  });

  it("muestra el video solo en la fecha mas temprana del evento", () => {
    const evento: Evento = {
      id: "e1",
      categoria: "internacional",
      titulo: "Evento con Video",
      subtitulo: "Sub",
      youtubeUrl: "https://www.youtube.com/watch?v=abc123",
      orden: 0,
      activo: true,
      fechas: [
        { id: "f1", fechaInicio: "2026-05-01", fechaFin: "2026-05-02", ubicacion: "Orlando" },
        { id: "f2", fechaInicio: "2026-03-01", fechaFin: "2026-03-02", ubicacion: "Miami" },
      ],
    };

    const paradas = construirLineaDeTiempo([evento], "2026-01-01");
    const paradaMarzo = paradas.find((p) => p.fecha.id === "f2")!;
    const paradaMayo = paradas.find((p) => p.fecha.id === "f1")!;

    expect(paradaMarzo.mostrarVideo).toBe(true);
    expect(paradaMayo.mostrarVideo).toBe(false);
  });

  it("mostrarVideo es false cuando el evento no tiene youtubeUrl", () => {
    const evento: Evento = {
      id: "e1",
      categoria: "internacional",
      titulo: "Sin Video",
      subtitulo: "Sub",
      youtubeUrl: null,
      orden: 0,
      activo: true,
      fechas: [{ id: "f1", fechaInicio: "2026-03-01", fechaFin: "2026-03-02", ubicacion: "Miami" }],
    };

    const paradas = construirLineaDeTiempo([evento], "2026-01-01");

    expect(paradas[0].mostrarVideo).toBe(false);
  });

  it("calcula el estado de cada parada segun la fecha 'hoy' recibida", () => {
    const evento: Evento = {
      id: "e1",
      categoria: "internacional",
      titulo: "Evento",
      subtitulo: "Sub",
      youtubeUrl: null,
      orden: 0,
      activo: true,
      fechas: [{ id: "f1", fechaInicio: "2026-03-01", fechaFin: "2026-03-02", ubicacion: "Miami" }],
    };

    const paradas = construirLineaDeTiempo([evento], "2099-01-01");

    expect(paradas[0].estado).toBe("realizado");
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run lib/db/eventos.types.test.ts`
Expected: los tests existentes pasan; los 5 nuevos FALLAN (`construirLineaDeTiempo` no existe todavía).

- [ ] **Paso 3: Agregar `construirLineaDeTiempo` a `eventos.types.ts`**

Al final del archivo (después de `formatearRangoFecha`), agregar:

```tsx
export type ParadaLineaDeTiempo = {
  claveParada: string;
  evento: Evento;
  fecha: FechaEvento;
  estado: EstadoFecha;
  mostrarVideo: boolean;
};

export function construirLineaDeTiempo(eventos: Evento[], hoy: string): ParadaLineaDeTiempo[] {
  const paradas: ParadaLineaDeTiempo[] = [];

  for (const evento of eventos) {
    const fechasOrdenadas = [...evento.fechas].sort((a, b) =>
      a.fechaInicio.localeCompare(b.fechaInicio)
    );

    fechasOrdenadas.forEach((fecha, indice) => {
      paradas.push({
        claveParada: `${evento.id}:${fecha.id}`,
        evento,
        fecha,
        estado: calcularEstadoFecha(fecha.fechaInicio, fecha.fechaFin, hoy),
        mostrarVideo: Boolean(evento.youtubeUrl) && indice === 0,
      });
    });
  }

  return paradas.sort((a, b) => a.fecha.fechaInicio.localeCompare(b.fecha.fechaInicio));
}
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run lib/db/eventos.types.test.ts`
Expected: PASS (todos los tests del archivo, incluidos los 5 nuevos)

- [ ] **Paso 5: Commit**

```bash
git add lib/db/eventos.types.ts lib/db/eventos.types.test.ts
git commit -m "feat(eventos): agrega construirLineaDeTiempo para aplanar eventos a paradas por fecha"
```

---

## Task 2: `ParadaEvento.tsx` — una parada individual de la línea de tiempo

**Files:**
- Create: `components/estudiante/eventos/ParadaEvento.tsx` (nuevo)
- Create: `components/estudiante/eventos/ParadaEvento.test.tsx` (nuevo)

**Contexto para quien implemente:** Este componente reemplaza a `EventoCard.tsx` (que en la Task 3 se elimina). En vez de recibir un `Evento` completo, recibe una `ParadaLineaDeTiempo` (de la Task 1, ya mergeada en este worktree) — una sola fecha de un evento, con su estado ya calculado (`proximo` | `en_ejecucion` | `realizado`) y si debe mostrar el video (`mostrarVideo`). Reutiliza las funciones puras ya existentes en `eventos.types.ts` (`extraerIdVideoYoutube`, `formatearRangoFecha`, `CATEGORIA_EVENTO_INFO`) — no se agrega lógica de fechas nueva acá, todo el cálculo ya viene resuelto en la `parada` recibida.

- [ ] **Paso 1: Escribir los tests que fallan**

Crear `components/estudiante/eventos/ParadaEvento.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ParadaEvento } from "./ParadaEvento";
import type { Evento, ParadaLineaDeTiempo } from "@/lib/db/eventos.types";

function crearEvento(overrides: Partial<Evento> & { id: string; titulo: string }): Evento {
  return {
    categoria: "internacional",
    subtitulo: "Subtítulo de prueba",
    youtubeUrl: null,
    orden: 0,
    activo: true,
    fechas: [],
    ...overrides,
  };
}

function crearParada(
  overrides: Partial<ParadaLineaDeTiempo> & { evento: Evento }
): ParadaLineaDeTiempo {
  return {
    claveParada: `${overrides.evento.id}:f1`,
    fecha: { id: "f1", fechaInicio: "2026-01-01", fechaFin: "2026-01-01", ubicacion: "Miami" },
    estado: "proximo",
    mostrarVideo: false,
    ...overrides,
  };
}

describe("ParadaEvento", () => {
  it("muestra el título, subtítulo, fecha, ubicación y categoría", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento de Prueba" });
    const parada = crearParada({ evento });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByText("Evento de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo de prueba")).toBeInTheDocument();
    expect(screen.getByText("Miami")).toBeInTheDocument();
    expect(screen.getByText("Eventos Internacionales")).toBeInTheDocument();
  });

  it("muestra el video cuando mostrarVideo es true y el evento tiene youtubeUrl", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Video",
      youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
    });
    const parada = crearParada({ evento, mostrarVideo: true });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByTitle("Video de Evento con Video")).toHaveAttribute(
      "src",
      "https://www.youtube.com/embed/jV468IGkYtg"
    );
  });

  it("no muestra el video cuando mostrarVideo es false, aunque el evento tenga youtubeUrl", () => {
    const evento = crearEvento({
      id: "e1",
      titulo: "Evento con Video",
      youtubeUrl: "https://www.youtube.com/watch?v=jV468IGkYtg",
    });
    const parada = crearParada({ evento, mostrarVideo: false });

    const { container } = render(<ParadaEvento parada={parada} />);

    expect(container.querySelector("iframe")).not.toBeInTheDocument();
  });

  it("muestra el badge 'En ejecución' cuando el estado es en_ejecucion", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento en Curso" });
    const parada = crearParada({ evento, estado: "en_ejecucion" });

    render(<ParadaEvento parada={parada} />);

    expect(screen.getByText("En ejecución")).toBeInTheDocument();
  });

  it("no muestra ningún badge de estado cuando el evento es proximo", () => {
    const evento = crearEvento({ id: "e1", titulo: "Evento Proximo" });
    const parada = crearParada({ evento, estado: "proximo" });

    render(<ParadaEvento parada={parada} />);

    expect(screen.queryByText("En ejecución")).not.toBeInTheDocument();
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/eventos/ParadaEvento.test.tsx`
Expected: FAIL — `ParadaEvento.tsx` no existe todavía (import error).

- [ ] **Paso 3: Crear `ParadaEvento.tsx`**

```tsx
import { Calendar, MapPin } from "lucide-react";
import type { ParadaLineaDeTiempo } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO, extraerIdVideoYoutube, formatearRangoFecha } from "@/lib/db/eventos.types";

export function ParadaEvento({ parada }: { parada: ParadaLineaDeTiempo }) {
  const { evento, fecha, estado, mostrarVideo } = parada;
  const idVideo = mostrarVideo && evento.youtubeUrl ? extraerIdVideoYoutube(evento.youtubeUrl) : null;
  const esPasado = estado === "realizado";

  return (
    <div className={`relative pb-10 pl-6 ${esPasado ? "opacity-40" : ""}`}>
      <span
        className="absolute -left-[27px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-ink-950 bg-white/30"
        aria-hidden="true"
      />
      <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] font-medium text-mist-400">
        {CATEGORIA_EVENTO_INFO[evento.categoria].titulo}
      </span>
      <h3 className="mt-2 font-display text-lg font-bold text-white">{evento.titulo}</h3>
      <p className="mt-1 text-sm text-mist-400">{evento.subtitulo}</p>
      {idVideo && (
        <div className="mt-3 aspect-video max-w-sm overflow-hidden rounded-xl border border-white/[0.08]">
          <iframe
            src={`https://www.youtube.com/embed/${idVideo}`}
            title={`Video de ${evento.titulo}`}
            className="h-full w-full"
            loading="lazy"
            allowFullScreen
          />
        </div>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-mist-300">
        <span className="inline-flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {formatearRangoFecha(fecha.fechaInicio, fecha.fechaFin)}
        </span>
        <span className="inline-flex items-center gap-1.5 text-mist-400">
          <MapPin className="h-3.5 w-3.5 text-mist-500" aria-hidden="true" />
          {fecha.ubicacion}
        </span>
        {estado === "en_ejecucion" && (
          <span className="rounded-full border border-gold-500/20 bg-gold-500/10 px-2 py-0.5 text-[11px] font-semibold text-gold-300">
            En ejecución
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/eventos/ParadaEvento.test.tsx`
Expected: PASS (5 tests)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/eventos/ParadaEvento.tsx components/estudiante/eventos/ParadaEvento.test.tsx
git commit -m "feat(eventos): agrega ParadaEvento, una parada individual de la linea de tiempo"
```

---

## Task 3: `EventosTimeline.tsx` — línea de tiempo completa + limpieza

**Files:**
- Create: `components/estudiante/eventos/EventosTimeline.tsx` (nuevo)
- Create: `components/estudiante/eventos/EventosTimeline.test.tsx` (nuevo)
- Delete: `components/estudiante/eventos/EventoCard.tsx`
- Delete: `components/estudiante/eventos/EventoCard.test.tsx`
- Delete: `components/estudiante/eventos/EventosGrid.tsx`
- Delete: `components/estudiante/eventos/EventosGrid.test.tsx`
- Modify: `app/(estudiante)/eventos/page.tsx`

**Contexto para quien implemente:** Este es el componente principal de la página de Eventos, arma todo: filtro por categoría (chips, mismo patrón visual que `CategoriaChips.tsx` de Herramientas), la línea de tiempo vertical con el marcador de "hoy" posicionado en el índice correcto dentro de la lista ya ordenada/filtrada, una línea de progreso dorada que se llena a medida que se hace scroll (usando `useScroll`/`useTransform` de framer-motion — mismo patrón ya probado y en uso en `components/estudiante/dashboard/HorizontalIntroPanels.tsx`), y scroll automático al marcador de "hoy" al montar. `EventoCard.tsx`/`EventosGrid.tsx` (y sus tests) quedan completamente reemplazados — sin otros usos en el proyecto fuera de sus propios tests y `page.tsx` (confirmado por búsqueda en todo el repositorio) — se eliminan por completo, no solo se dejan de importar.

**Nota sobre `scrollIntoView` en tests:** igual que en un ciclo anterior de este proyecto (fix de paginación en Herramientas), jsdom no implementa `Element.prototype.scrollIntoView` — se debe usar encadenamiento opcional también sobre el método, no solo sobre la ref: `marcadorHoyRef.current?.scrollIntoView?.(...)`, para que no lance error en el entorno de tests.

**Nota sobre el patrón `reducedMotion ? valorPlano : motionValue`:** ya está probado y en uso en este proyecto — `TeamLeaderCard.tsx` (dashboard) hace exactamente esto (`const parallaxY = reducedMotion ? 0 : parallaxYRaw;` y luego `style={{ y: parallaxY }}`). Este plan usa el mismo patrón para la altura de la línea de progreso.

- [ ] **Paso 1: Escribir los tests que fallan**

Crear `components/estudiante/eventos/EventosTimeline.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { EventosTimeline } from "./EventosTimeline";
import type { Evento } from "@/lib/db/eventos.types";

function crearEvento(
  overrides: Partial<Evento> & { id: string; titulo: string; categoria: Evento["categoria"] }
): Evento {
  return {
    subtitulo: "Subtítulo",
    youtubeUrl: null,
    orden: 0,
    activo: true,
    fechas: [],
    ...overrides,
  };
}

describe("EventosTimeline", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<EventosTimeline eventos={[]} />);

    expect(screen.getByText("Eventos")).toBeInTheDocument();
    expect(
      screen.getByText("Mantente informado sobre próximos eventos del equipo")
    ).toBeInTheDocument();
  });

  it("ordena las paradas cronologicamente sin importar la categoria", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Tardio",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2099-06-01", fechaFin: "2099-06-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Temprano",
        categoria: "nacional_eeuu",
        fechas: [{ id: "f2", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "Y" }],
      }),
    ];

    render(<EventosTimeline eventos={eventos} />);

    const titulos = screen.getAllByRole("heading", { level: 3 }).map((el) => el.textContent);
    expect(titulos).toEqual(["Evento Temprano", "Evento Tardio"]);
  });

  it("filtra por categoria con los chips", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Internacional",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Nacional",
        categoria: "nacional_eeuu",
        fechas: [{ id: "f2", fechaInicio: "2099-02-01", fechaFin: "2099-02-01", ubicacion: "Y" }],
      }),
    ];

    render(<EventosTimeline eventos={eventos} />);

    fireEvent.click(screen.getByRole("button", { name: "Eventos Internacionales" }));

    expect(screen.getByText("Evento Internacional")).toBeInTheDocument();
    expect(screen.queryByText("Evento Nacional")).not.toBeInTheDocument();
  });

  it("muestra el marcador 'Hoy' entre lo pasado y lo proximo", () => {
    const eventos: Evento[] = [
      crearEvento({
        id: "e1",
        titulo: "Evento Pasado",
        categoria: "internacional",
        fechas: [{ id: "f1", fechaInicio: "2000-01-01", fechaFin: "2000-01-01", ubicacion: "X" }],
      }),
      crearEvento({
        id: "e2",
        titulo: "Evento Futuro",
        categoria: "internacional",
        fechas: [{ id: "f2", fechaInicio: "2099-01-01", fechaFin: "2099-01-01", ubicacion: "Y" }],
      }),
    ];

    const { container } = render(<EventosTimeline eventos={eventos} />);

    const texto = container.textContent ?? "";
    const posPasado = texto.indexOf("Evento Pasado");
    const posHoy = texto.indexOf("Hoy");
    const posFuturo = texto.indexOf("Evento Futuro");

    expect(posPasado).toBeGreaterThanOrEqual(0);
    expect(posHoy).toBeGreaterThan(posPasado);
    expect(posFuturo).toBeGreaterThan(posHoy);
  });

  it("muestra un mensaje cuando no hay eventos", () => {
    render(<EventosTimeline eventos={[]} />);
    expect(screen.getByText("No hay eventos en esta categoría.")).toBeInTheDocument();
  });

  it("el botón de más información enlaza a WhatsApp en una pestaña nueva", () => {
    render(<EventosTimeline eventos={[]} />);

    const boton = screen.getByRole("link", { name: "Solicitar más Información" });
    expect(boton).toHaveAttribute("href", "https://wa.link/o926ih");
    expect(boton).toHaveAttribute("target", "_blank");
    expect(boton).toHaveAttribute("rel", "noopener noreferrer");
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/eventos/EventosTimeline.test.tsx`
Expected: FAIL — `EventosTimeline.tsx` no existe todavía (import error).

- [ ] **Paso 3: Crear `EventosTimeline.tsx`**

```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import type { CategoriaEvento, Evento, ParadaLineaDeTiempo } from "@/lib/db/eventos.types";
import { CATEGORIA_EVENTO_INFO, construirLineaDeTiempo, hoyIso } from "@/lib/db/eventos.types";
import { useReducedMotionSafe } from "@/lib/motion";
import { ParadaEvento } from "./ParadaEvento";

const URL_WHATSAPP = "https://wa.link/o926ih";

type FiltroCategoria = CategoriaEvento | "todos";

const OPCIONES_FILTRO: { valor: FiltroCategoria; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "internacional", etiqueta: CATEGORIA_EVENTO_INFO.internacional.titulo },
  { valor: "nacional_eeuu", etiqueta: CATEGORIA_EVENTO_INFO.nacional_eeuu.titulo },
];

type ItemLineaDeTiempo =
  | { tipo: "marcador"; clave: string }
  | { tipo: "parada"; clave: string; parada: ParadaLineaDeTiempo };

export function EventosTimeline({ eventos }: { eventos: Evento[] }) {
  const [filtro, setFiltro] = useState<FiltroCategoria>("todos");
  const contenedorRef = useRef<HTMLDivElement>(null);
  const marcadorHoyRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const hoy = hoyIso();
  const paradas = useMemo(() => construirLineaDeTiempo(eventos, hoy), [eventos, hoy]);
  const paradasFiltradas = useMemo(
    () =>
      filtro === "todos" ? paradas : paradas.filter((parada) => parada.evento.categoria === filtro),
    [paradas, filtro]
  );

  const indicePrimeraFutura = paradasFiltradas.findIndex(
    (parada) => parada.fecha.fechaInicio >= hoy
  );
  const posicionMarcador =
    indicePrimeraFutura === -1 ? paradasFiltradas.length : indicePrimeraFutura;

  const itemsLinea: ItemLineaDeTiempo[] = [];
  paradasFiltradas.forEach((parada, indice) => {
    if (indice === posicionMarcador) {
      itemsLinea.push({ tipo: "marcador", clave: "marcador-hoy" });
    }
    itemsLinea.push({ tipo: "parada", clave: parada.claveParada, parada });
  });
  if (posicionMarcador === paradasFiltradas.length) {
    itemsLinea.push({ tipo: "marcador", clave: "marcador-hoy" });
  }

  useEffect(() => {
    marcadorHoyRef.current?.scrollIntoView?.({
      behavior: reducedMotion ? "auto" : "smooth",
      block: "center",
    });
  }, [reducedMotion, filtro]);

  const { scrollYProgress } = useScroll({
    target: contenedorRef,
    offset: ["start center", "end center"],
  });
  const alturaLineaRaw = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);
  const alturaLinea = reducedMotion ? "100%" : alturaLineaRaw;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">Eventos</h1>
        <p className="mt-2 text-lg text-mist-400">
          Mantente informado sobre próximos eventos del equipo
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {OPCIONES_FILTRO.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            onClick={() => setFiltro(opcion.valor)}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              filtro === opcion.valor
                ? "border-gold-500/60 bg-gold-500/10 text-gold-300"
                : "border-white/10 text-mist-400 hover:border-white/20"
            }`}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>

      {paradasFiltradas.length === 0 ? (
        <p className="text-mist-400">No hay eventos en esta categoría.</p>
      ) : (
        <div ref={contenedorRef} className="relative pl-8">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-white/10" aria-hidden="true" />
          <motion.div
            className="absolute left-3 top-0 w-px bg-gold-500"
            style={{ height: alturaLinea }}
            aria-hidden="true"
          />

          {itemsLinea.map((item) =>
            item.tipo === "marcador" ? (
              <div
                key={item.clave}
                ref={marcadorHoyRef}
                className="relative -ml-8 mb-6 flex items-center gap-3"
              >
                <span className="h-3 w-3 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                <span className="font-mono text-xs font-bold uppercase tracking-widest text-gold-400">
                  Hoy
                </span>
                <span className="h-px flex-1 bg-gold-500/40" aria-hidden="true" />
              </div>
            ) : (
              <ParadaEvento key={item.clave} parada={item.parada} />
            )
          )}
        </div>
      )}

      <a
        href={URL_WHATSAPP}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-[54px] w-fit items-center justify-center gap-2.5 self-center rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
      >
        Solicitar más Información
      </a>
    </div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/eventos/EventosTimeline.test.tsx`
Expected: PASS (6 tests)

- [ ] **Paso 5: Eliminar los archivos reemplazados**

```bash
git rm components/estudiante/eventos/EventoCard.tsx
git rm components/estudiante/eventos/EventoCard.test.tsx
git rm components/estudiante/eventos/EventosGrid.tsx
git rm components/estudiante/eventos/EventosGrid.test.tsx
```

- [ ] **Paso 6: Actualizar `app/(estudiante)/eventos/page.tsx`**

Reemplazar el contenido completo por:

```tsx
import { getEventos } from "@/lib/db/eventos";
import { EventosTimeline } from "@/components/estudiante/eventos/EventosTimeline";

export default async function EventosPage() {
  const eventos = await getEventos();

  return <EventosTimeline eventos={eventos} />;
}
```

- [ ] **Paso 7: Correr todos los tests de Eventos y verificar que pasan**

Run: `npx vitest run components/estudiante/eventos lib/db/eventos.types.test.ts`
Expected: PASS (33 tests: 22 en `eventos.types.test.ts` — los 17 que ya existían más los 5 de `construirLineaDeTiempo` agregados en la Task 1 — más 5 en `ParadaEvento.test.tsx` y 6 en `EventosTimeline.test.tsx`; sin rastro de `EventoCard`/`EventosGrid`)

- [ ] **Paso 8: Correr el tsc para confirmar que no hay errores de tipos**

Run: `npx tsc --noEmit`
Expected: sin salida (limpio) — confirma que no queda ninguna referencia rota a `EventoCard`/`EventosGrid` en el proyecto (ej. en `page.tsx`).

- [ ] **Paso 9: Commit**

```bash
git add components/estudiante/eventos/EventosTimeline.tsx components/estudiante/eventos/EventosTimeline.test.tsx "app/(estudiante)/eventos/page.tsx"
git commit -m "feat(eventos): reemplaza la grilla por categoria con una linea de tiempo cronologica interactiva"
```

---

## Task 4: Verificación

**Files:** ninguno (verificación, sin cambios de código salvo hallazgos a corregir)

- [ ] **Paso 1: Build de producción**

Crear un `.env.local` temporal si no existe ya (con `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` como valores
placeholder), luego:

Run: `npm run build`
Expected: build exitoso sin errores (33/33 rutas, exit code 0). Limpiar el
`.env.local` temporal después si no existía antes.

- [ ] **Paso 2: Verificación visual en navegador**

Esta verificación requiere un navegador real. Si quien ejecuta este plan
tiene una herramienta de navegador disponible, debe usarla para confirmar
en `/eventos` (con datos mock si hace falta, incluyendo al menos un
evento con 2+ fechas y video, uno pasado, uno en curso, y uno futuro):

- Al cargar la página, hace scroll automático hasta el marcador "Hoy".
- La línea vertical se llena de dorado progresivamente al hacer scroll.
- Las paradas pasadas se ven atenuadas; las próximas/en curso, con
  brillo normal.
- El video de un evento con varias fechas aparece solo en la parada
  más temprana, no se repite.
- Los chips de filtro por categoría funcionan y no dejan la página en
  un estado vacío inesperado.
- `prefers-reduced-motion` desactiva el scroll suave automático (salto
  instantáneo) y la animación de la línea de progreso (se ve siempre
  completa).
- No hay overflow horizontal ni saltos de layout raros en mobile.

Si NO hay herramienta de navegador disponible en la sesión que ejecuta
este plan: preguntar explícitamente al usuario cómo prefiere proceder
(mismo patrón ya usado en ciclos anteriores de este proyecto) — no asumir
que está bien saltarse esta verificación ni reportarla como hecha sin
haberla hecho.

- [ ] **Paso 3: Commit (si hubo que corregir algo durante la verificación)**

Si la verificación no encontró problemas, no hay nada que commitear en
este paso. Si se encontró y corrigió algo, commitear ese fix con un
mensaje descriptivo del problema encontrado.

---

## Self-Review Notes

- **Cobertura del spec:** aplanado de eventos a paradas por fecha con
  orden cronológico y video solo en la fecha más temprana (Task 1),
  parada individual con atenuación de lo pasado (Task 2), línea de
  tiempo completa con filtro por categoría, marcador de "hoy",
  scroll automático inicial, y línea de progreso ligada al scroll
  (Task 3), limpieza de `EventoCard`/`EventosGrid` sin dejar código
  muerto (Task 3, `git rm`), testing (Tasks 1-3), verificación manual +
  build obligatorio con manejo explícito de la falta de herramienta de
  navegador (Task 4), fuera de alcance respetado (sin tocar
  `EventoForm.tsx` ni el modelo de datos).
- **Patrones reutilizados, no inventados:** `useScroll`/`useTransform`
  para la línea de progreso y el patrón `reducedMotion ? valorPlano :
  motionValue` ya están probados en `HorizontalIntroPanels.tsx` y
  `TeamLeaderCard.tsx` respectivamente — este plan no introduce
  técnicas nuevas de animación, solo las reutiliza en un contexto
  nuevo. El `scrollIntoView?.()` con encadenamiento opcional en el
  método (no solo la ref) ya se usó y se probó necesario en el ciclo
  anterior de Herramientas (fix de paginación) — se aplica el mismo
  patrón acá desde el principio en vez de descubrirlo de nuevo.
- **Consistencia de tipos:** `ParadaLineaDeTiempo` se define en la Task
  1 y se usa con el mismo shape exacto (`claveParada`, `evento`,
  `fecha`, `estado`, `mostrarVideo`) en `ParadaEvento.tsx` (Task 2) y
  `EventosTimeline.tsx` (Task 3). `FiltroCategoria` en
  `EventosTimeline.tsx` es un tipo local (no exportado, no colisiona
  con el `FiltroCategoria` de Herramientas que vive en otro archivo).
- **Sin placeholders:** todos los pasos incluyen código completo,
  comandos exactos y resultados esperados concretos.
