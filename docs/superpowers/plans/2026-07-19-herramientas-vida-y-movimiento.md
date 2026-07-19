# Herramientas — más vida y movimiento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Hacer que la página de Herramientas y Comunicación se sienta menos genérica: tarjetas de grupo diferenciadas por color según el tipo de canal, revelado al hacer scroll en vez de una sola animación al cargar, hover más rico en vista grid, y un banner superior que comunica "comunicación en vivo" con una métrica real en vez de un elemento puramente decorativo.

**Architecture:** `GrupoCard.tsx` gana un mapa `ACENTO_CANAL` que determina color de icono/borde/link según `grupo.tipoCanal`, y en vista grid gana un resplandor + reacción de icono en hover (patrón `group`/`group-hover` ya usado en `ProyectoCard.tsx`). `HerramientasHub.tsx` reemplaza el `staggerContainer` que animaba toda la grilla de una vez al montar por `ScrollReveal` (ya usado en otras páginas del sitio) envolviendo cada tarjeta individualmente, con un pequeño delay creciente por posición para mantener el efecto cascada. El banner gana un indicador "en vivo" (`animate-ping`, utilidad ya incluida por Tailwind) y reemplaza el círculo decorativo por el conteo real de grupos activos.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12, Tailwind CSS, Vitest + Testing Library.

---

## Task 1: `lib/motion.ts` — variante `blurFadeUpConDelay`

**Files:**
- Modify: `lib/motion.ts`
- Modify: `lib/motion.test.ts`

**Contexto para quien implemente:** `blurFadeUp` ya existe en este archivo (variant de entrada con blur usada en varias páginas). Para el efecto cascada de las tarjetas de Herramientas (Task 3), cada tarjeta necesita el mismo `blurFadeUp` pero con un `transition.delay` distinto según su posición en la grilla. En vez de duplicar el objeto en cada lugar que lo necesite, se agrega una función que genera esa variante con el delay pedido.

- [ ] **Paso 1: Escribir el test que falla**

Añadir al `describe("variantes de motion", ...)` existente en `lib/motion.test.ts`, después del test de `revealSlideRight` (y agregar `blurFadeUp` y `blurFadeUpConDelay` al import de `"./motion"` al inicio del archivo):

```tsx
  it("blurFadeUpConDelay aplica el delay solicitado sin alterar el resto de blurFadeUp", () => {
    const variant = blurFadeUpConDelay(0.25);
    expect(variant.hidden).toEqual(blurFadeUp.hidden);
    expect(variant.visible).toMatchObject({
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.85, ease: EASE_OUT, delay: 0.25 },
    });
  });
```

- [ ] **Paso 2: Correr el test y verificar que falla**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `blurFadeUpConDelay` no existe todavía (import error).

- [ ] **Paso 3: Agregar `blurFadeUpConDelay` a `lib/motion.ts`**

Justo después de la definición de `blurFadeUp` (antes de `export const revealUp`), agregar:

```tsx
export function blurFadeUpConDelay(delay: number): Variants {
  return {
    hidden: blurFadeUp.hidden,
    visible: {
      ...blurFadeUp.visible,
      transition: { ...blurFadeUp.visible.transition, delay },
    },
  };
}
```

- [ ] **Paso 4: Correr el test y verificar que pasa**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS (todos los tests del archivo, incluido el nuevo)

- [ ] **Paso 5: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts
git commit -m "feat(motion): agrega blurFadeUpConDelay para cascadas de revelado por scroll"
```

---

## Task 2: `GrupoCard.tsx` — acento por canal + hover más rico

**Files:**
- Modify: `components/estudiante/herramientas/GrupoCard.tsx`
- Create: `components/estudiante/herramientas/GrupoCard.test.tsx` (nuevo — no existe hoy)

**Contexto para quien implemente:** Hoy todas las tarjetas de grupo usan el mismo acento dorado (icono, borde en hover, link) sin importar si el canal es WhatsApp o Dropbox. Se agrega un mapa `ACENTO_CANAL` que aplica verde WhatsApp (color `whatsapp`, ya definido en `tailwind.config.ts` y usado en otras partes del sitio) para grupos de WhatsApp, y mantiene el dorado actual para Dropbox. En vista grid, además se agrega un resplandor de fondo del color del canal que aparece en hover, y el icono reacciona con una leve escala — mismo patrón `group`/`group-hover` que ya usa `components/estudiante/proyectos-aliados/ProyectoCard.tsx`.

**Nota importante:** la animación de entrada (`variants={blurFadeUp}`) se **elimina** de este componente — en la Task 3, cada `GrupoCard` se envuelve en `ScrollReveal` desde `HerramientasHub.tsx`, que ya aplica esa animación. Si `GrupoCard` mantuviera su propio `variants={blurFadeUp}` además del `ScrollReveal` que lo envuelve, framer-motion propagaría el estado de animación del padre al hijo (ambos comparten las claves "hidden"/"visible"), duplicando el efecto: el desplazamiento vertical se sumaría (22px + 22px) y la opacidad se aplicaría dos veces — un bug visual real, no cosmético. Por eso la vista `lista` deja de usar `motion.div` (ya no necesita ninguna animación propia) y pasa a ser un `div` normal; la vista `grid` mantiene `motion.div` únicamente por el `whileHover`.

- [ ] **Paso 1: Escribir los tests que fallan**

Crear `components/estudiante/herramientas/GrupoCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GrupoCard } from "./GrupoCard";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

function crearGrupo(
  overrides: Partial<GrupoComunidad> & { id: string; nombre: string }
): GrupoComunidad {
  return {
    categoria: "miami",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: "https://chat.whatsapp.com/prueba",
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("GrupoCard", () => {
  it("vista grid: acento verde WhatsApp en icono y link", () => {
    const grupo = crearGrupo({ id: "g1", nombre: "Domus", tipoCanal: "whatsapp" });
    render(<GrupoCard grupo={grupo} vista="grid" />);

    const icono = screen.getByText("Domus").parentElement?.querySelector("span");
    expect(icono).toHaveClass("border-whatsapp/20", "bg-whatsapp/10", "text-whatsapp");
    expect(screen.getByRole("link", { name: /unirse/i })).toHaveClass("text-whatsapp");
  });

  it("vista grid: acento dorado Dropbox en icono y link", () => {
    const grupo = crearGrupo({
      id: "g2",
      nombre: "Carpeta Compartida",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    render(<GrupoCard grupo={grupo} vista="grid" />);

    const icono = screen.getByText("Carpeta Compartida").parentElement?.querySelector("span");
    expect(icono).toHaveClass("border-gold-500/20", "bg-gold-500/10", "text-gold-300");
    expect(screen.getByRole("link", { name: /abrir carpeta/i })).toHaveClass("text-gold-300");
  });

  it("vista lista: tambien aplica el acento verde WhatsApp", () => {
    const grupo = crearGrupo({ id: "g3", nombre: "Domus", tipoCanal: "whatsapp" });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    const icono = container.querySelector("span");
    expect(icono).toHaveClass("border-whatsapp/20", "bg-whatsapp/10", "text-whatsapp");
  });

  it("vista lista: tambien aplica el acento dorado Dropbox", () => {
    const grupo = crearGrupo({
      id: "g4",
      nombre: "Carpeta",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    const icono = container.querySelector("span");
    expect(icono).toHaveClass("border-gold-500/20", "bg-gold-500/10", "text-gold-300");
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/herramientas/GrupoCard.test.tsx`
Expected: FAIL — el acento de color no existe todavía, ambos tests de WhatsApp esperan `text-whatsapp`/`border-whatsapp/20` pero el componente actual siempre usa dorado.

- [ ] **Paso 3: Reemplazar `GrupoCard.tsx`**

Reemplazar el contenido completo de `components/estudiante/herramientas/GrupoCard.tsx` por:

```tsx
"use client";

import { Folder, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad.types";

const ETIQUETA_ACCION: Record<GrupoComunidad["tipoCanal"], string> = {
  whatsapp: "Unirse",
  dropbox: "Abrir carpeta",
};

const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { badge: string; hoverBorde: string; link: string; glow: string }
> = {
  whatsapp: {
    badge: "border-whatsapp/20 bg-whatsapp/10 text-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
    glow: "bg-whatsapp/20",
  },
  dropbox: {
    badge: "border-gold-500/20 bg-gold-500/10 text-gold-300",
    hoverBorde: "hover:border-gold-500/40",
    link: "text-gold-300 hover:text-gold-200",
    glow: "bg-gold-500/20",
  },
};

export function GrupoCard({
  grupo,
  vista,
}: {
  grupo: GrupoComunidad;
  vista: "grid" | "lista";
}) {
  const Icono = grupo.tipoCanal === "dropbox" ? Folder : MessageCircle;
  const tieneEnlace = Boolean(grupo.enlaceUrl);
  const etiquetaAccion = ETIQUETA_ACCION[grupo.tipoCanal];
  const acento = ACENTO_CANAL[grupo.tipoCanal];

  const accion = tieneEnlace ? (
    <a
      href={grupo.enlaceUrl!}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-sm font-semibold transition hover:scale-[1.02] active:scale-[0.98] ${acento.link}`}
    >
      {etiquetaAccion} ↗
    </a>
  ) : (
    <span
      aria-disabled="true"
      title="Este grupo todavía no tiene enlace cargado"
      className="text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
    >
      Enlace pendiente
    </span>
  );

  if (vista === "lista") {
    return (
      <div
        className={`flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition ${acento.hoverBorde}`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${acento.badge}`}
          >
            <Icono className="h-4 w-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-white">{grupo.nombre}</p>
            <p className="truncate text-xs text-mist-400">
              {ETIQUETA_CATEGORIA[grupo.categoria]}
              {grupo.detalle ? ` · ${grupo.detalle}` : ""}
            </p>
          </div>
        </div>
        {accion}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors ${acento.hoverBorde}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${acento.glow}`}
      />
      <div className="relative">
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-transform duration-300 group-hover:scale-110 ${acento.badge}`}
        >
          <Icono className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="mt-4 font-display font-semibold text-white">{grupo.nombre}</h3>
        {grupo.detalle && <p className="mt-1 text-sm text-mist-400">{grupo.detalle}</p>}
        <span className="mt-3 inline-block rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-medium text-mist-400">
          {ETIQUETA_CATEGORIA[grupo.categoria]}
        </span>
      </div>
      <div className="relative flex justify-end">{accion}</div>
    </motion.div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/herramientas/GrupoCard.test.tsx`
Expected: PASS (4 tests)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/herramientas/GrupoCard.tsx components/estudiante/herramientas/GrupoCard.test.tsx
git commit -m "feat(herramientas): acento de color por canal y hover mas rico en GrupoCard"
```

---

## Task 3: `HerramientasHub.tsx` — banner "en vivo" + revelado por scroll

**Files:**
- Modify: `components/estudiante/herramientas/HerramientasHub.tsx`
- Modify: `components/estudiante/herramientas/HerramientasHub.test.tsx`

**Contexto para quien implemente:** Este componente arma la página completa: banner superior, tarjetas resumen, filtros, y la grilla/lista de `GrupoCard`. Dos cambios: (1) el banner gana un indicador "en vivo" (punto pulsante con la utilidad `animate-ping` de Tailwind, ya disponible sin configuración adicional) y el círculo decorativo del lado derecho se reemplaza por el conteo real de grupos activos (mismo dato que ya recibe `IndicadoresPanel`); (2) la grilla/lista de tarjetas deja de animarse toda junta al montar (`staggerContainer`) y pasa a envolver cada `GrupoCard` en `ScrollReveal` (componente ya existente en `components/motion/ScrollReveal.tsx`, usado en otras páginas del sitio) con un delay creciente por posición usando `blurFadeUpConDelay` de la Task 1.

- [ ] **Paso 1: Escribir los tests que fallan**

Añadir al `describe("HerramientasHub", ...)` existente en `HerramientasHub.test.tsx`, después del test "pagina los resultados de a 12":

```tsx
  it("muestra el indicador 'En vivo' en el banner", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.getByText("En vivo")).toBeInTheDocument();
  });

  it("muestra el conteo real de grupos activos en el banner", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    const etiqueta = screen.getByText("Grupos activos");
    expect(etiqueta.parentElement).toHaveTextContent("3");
  });
```

- [ ] **Paso 2: Correr los tests y verificar que los 2 nuevos fallan**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: los 5 tests existentes pasan; los 2 nuevos FALLAN (el banner todavía no tiene "En vivo" ni "Grupos activos").

- [ ] **Paso 3: Reemplazar `HerramientasHub.tsx`**

Reemplazar el contenido completo de `components/estudiante/herramientas/HerramientasHub.tsx` por:

```tsx
"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, MessageCircle } from "lucide-react";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { staggerContainer, blurFadeUp, blurFadeUpConDelay } from "@/lib/motion";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { GrupoPrincipalCard } from "./GrupoPrincipalCard";
import { IndicadoresPanel } from "./IndicadoresPanel";
import { HerramientasToolbar, type OrdenGrupos, type VistaGrupos } from "./HerramientasToolbar";
import { CategoriaChips, type FiltroCategoria } from "./CategoriaChips";
import { GrupoCard } from "./GrupoCard";
import { Paginacion } from "./Paginacion";

const POR_PAGINA = 12;

const BENEFICIOS = [
  "Conecta directo con otros agentes del equipo.",
  "Resuelve dudas de proyectos en tiempo real.",
  "Entérate primero de nuevas clases y anuncios.",
];

export function HerramientasHub({ grupos }: { grupos: GrupoComunidad[] }) {
  const [busqueda, setBusqueda] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState<FiltroCategoria>("todos");
  const [orden, setOrden] = useState<OrdenGrupos>("nombre");
  const [vista, setVista] = useState<VistaGrupos>("grid");
  const [pagina, setPagina] = useState(1);

  const grupoPrincipal = useMemo(
    () => grupos.find((grupo) => grupo.categoria === "grupo_principal"),
    [grupos]
  );

  const gruposDeProyecto = useMemo(
    () => grupos.filter((grupo) => grupo.categoria !== "grupo_principal"),
    [grupos]
  );

  const conteos = useMemo(() => {
    const base: Record<FiltroCategoria, number> = {
      todos: gruposDeProyecto.length,
      grupo_principal: 0,
      miami: 0,
      orlando_centro_florida: 0,
      venta_renta: 0,
      otros: 0,
    };
    for (const grupo of gruposDeProyecto) {
      base[grupo.categoria] += 1;
    }
    return base;
  }, [gruposDeProyecto]);

  const gruposFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    const filtrados = gruposDeProyecto.filter((grupo) => {
      const coincideTexto =
        grupo.nombre.toLowerCase().includes(texto) ||
        (grupo.detalle ?? "").toLowerCase().includes(texto);
      const coincideCategoria = filtroCategoria === "todos" || grupo.categoria === filtroCategoria;
      return coincideTexto && coincideCategoria;
    });

    return [...filtrados].sort((a, b) => {
      if (orden === "nombre") {
        return a.nombre.localeCompare(b.nombre);
      }
      return (b.creadoEn ?? "").localeCompare(a.creadoEn ?? "");
    });
  }, [gruposDeProyecto, busqueda, filtroCategoria, orden]);

  const totalPaginas = Math.max(1, Math.ceil(gruposFiltrados.length / POR_PAGINA));
  const paginaSegura = Math.min(pagina, totalPaginas);
  const gruposPagina = gruposFiltrados.slice(
    (paginaSegura - 1) * POR_PAGINA,
    paginaSegura * POR_PAGINA
  );

  function conFiltroNuevo(aplicar: () => void) {
    aplicar();
    setPagina(1);
  }

  return (
    <div className="flex flex-col gap-10">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer(0.1)}
        className="grid gap-8 rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:grid-cols-[1.4fr_1fr] sm:p-10"
      >
        <motion.div variants={blurFadeUp}>
          <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-whatsapp/20 bg-whatsapp/10 text-whatsapp">
            <MessageCircle className="h-6 w-6" aria-hidden="true" />
          </span>
          <p className="mt-4 font-mono text-xs uppercase tracking-wider text-whatsapp">
            Prioridad #1 para nuevos agentes
          </p>
          <div className="mt-4 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-whatsapp opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-whatsapp" />
            </span>
            <span className="font-mono text-xs uppercase tracking-wider text-whatsapp">
              En vivo
            </span>
          </div>
          <h1 className="mt-2 font-display text-[42px] font-bold leading-tight text-white">
            Herramientas y Comunicación
          </h1>
          <p className="mt-3 max-w-xl text-lg text-mist-400">
            Directorio de grupos y comunidades del equipo. Conectarte es uno de los primeros
            pasos para operar dentro de Team 100% Real Estate.
          </p>
          <ul className="mt-6 flex flex-col gap-2.5">
            {BENEFICIOS.map((beneficio) => (
              <li key={beneficio} className="flex items-start gap-2.5 text-sm text-mist-300">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-gold-400" aria-hidden="true" />
                {beneficio}
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          variants={blurFadeUp}
          aria-hidden="true"
          className="hidden flex-col items-center justify-center gap-1 sm:flex"
        >
          <span className="font-display text-6xl font-bold text-white">
            {gruposDeProyecto.length}
          </span>
          <span className="font-mono text-xs uppercase tracking-wider text-mist-400">
            Grupos activos
          </span>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 sm:grid-cols-2">
        <GrupoPrincipalCard grupo={grupoPrincipal} />
        <IndicadoresPanel totalGrupos={gruposDeProyecto.length} />
      </div>

      <HerramientasToolbar
        busqueda={busqueda}
        onBusquedaChange={(valor) => conFiltroNuevo(() => setBusqueda(valor))}
        orden={orden}
        onOrdenChange={setOrden}
        vista={vista}
        onVistaChange={setVista}
      />

      <CategoriaChips
        conteos={conteos}
        filtro={filtroCategoria}
        onFiltroChange={(valor) => conFiltroNuevo(() => setFiltroCategoria(valor))}
      />

      {gruposFiltrados.length === 0 ? (
        <p className="text-mist-400">No encontramos grupos con ese nombre.</p>
      ) : (
        <div
          key={`${vista}-${paginaSegura}`}
          className={vista === "grid" ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3" : "flex flex-col gap-3"}
        >
          {gruposPagina.map((grupo, indice) => (
            <ScrollReveal
              key={grupo.id}
              variants={blurFadeUpConDelay(Math.min(indice, 8) * 0.05)}
            >
              <GrupoCard grupo={grupo} vista={vista} />
            </ScrollReveal>
          ))}
        </div>
      )}

      <Paginacion
        pagina={paginaSegura}
        totalPaginas={totalPaginas}
        totalItems={gruposFiltrados.length}
        porPagina={POR_PAGINA}
        onPaginaChange={setPagina}
      />
    </div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que todos pasan**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: PASS (7 tests: 5 existentes + 2 nuevos)

- [ ] **Paso 5: Correr el tsc para confirmar que no hay errores de tipos**

Run: `npx tsc --noEmit`
Expected: sin salida (limpio).

- [ ] **Paso 6: Commit**

```bash
git add components/estudiante/herramientas/HerramientasHub.tsx components/estudiante/herramientas/HerramientasHub.test.tsx
git commit -m "feat(herramientas): indicador en vivo, metrica real en el banner, y revelado por scroll en las tarjetas"
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
en `/herramientas`:

- El punto "En vivo" pulsa junto al eyebrow text, y el bloque de la
  derecha del banner muestra el conteo real de grupos (no un círculo
  decorativo).
- Las tarjetas de grupo se revelan progresivamente al hacer scroll hacia
  abajo (no todas de golpe al cargar la página).
- En vista grid, el hover de una tarjeta muestra el resplandor de color
  (verde para WhatsApp, dorado para Dropbox) y el icono reacciona con una
  leve escala.
- Vista lista: el icono/borde reflejan el color de canal correcto, sin
  resplandor.
- `prefers-reduced-motion` desactiva el pulso "en vivo" y las animaciones
  de entrada/hover.
- No hay overflow ni saltos de layout extraños al agregar el wrapper de
  `ScrollReveal` alrededor de cada tarjeta de la grilla.

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

- **Cobertura del spec:** indicador "en vivo" + métrica real en el banner
  (Task 3), acento de color por canal en ambas vistas (Task 2), revelado
  por scroll con cascada (Task 1 + 3), hover más rico solo en vista grid
  con hover liviano en vista lista (Task 2), sin cambios en
  `GrupoPrincipalCard`/`IndicadoresPanel`/`HerramientasToolbar`/
  `CategoriaChips`/`Paginacion` (respetado — ningún task los toca),
  testing (Tasks 1-3), verificación manual + build obligatorio con manejo
  explícito de la falta de herramienta de navegador (Task 4).
- **Bug evitado durante la redacción de este plan:** la primera versión
  de `GrupoCard.tsx` mantenía `variants={blurFadeUp}` en el propio
  componente además de envolverlo en `ScrollReveal` desde
  `HerramientasHub.tsx` — esto habría duplicado la animación de entrada
  (framer-motion propaga el estado de animación del padre al hijo cuando
  ambos comparten claves de variants). Se corrigió quitando la animación
  de entrada de `GrupoCard.tsx` por completo (ahora solo `ScrollReveal` la
  controla) y convirtiendo la vista `lista` de `motion.div` a `div` plano,
  ya que dejó de necesitar ningún comportamiento de framer-motion.
- **Consistencia de tipos:** `ACENTO_CANAL` en `GrupoCard.tsx` usa las
  mismas claves `GrupoComunidad["tipoCanal"]` (`whatsapp`/`dropbox`) que
  el `ETIQUETA_ACCION` ya existente. `blurFadeUpConDelay(delay: number):
  Variants` se define en `lib/motion.ts` (Task 1) y se usa con esa misma
  firma en `HerramientasHub.tsx` (Task 3).
- **Riesgo de colisión en tests evitado:** el test del conteo de grupos
  activos en el banner (Task 3) escapa deliberadamente de usar
  `getByText("3")` a secas, porque ese mismo número también aparece en
  `IndicadoresPanel` (mismo dato, `totalGrupos`) — se usa en cambio
  `screen.getByText("Grupos activos").parentElement` para escopar la
  búsqueda al bloque correcto del banner.
- **Sin placeholders:** todos los pasos incluyen código completo, comandos
  exactos y resultados esperados concretos.
