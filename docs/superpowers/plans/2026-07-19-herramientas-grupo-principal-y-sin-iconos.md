# Herramientas — tarjeta de grupo principal renovada + sin iconos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quitar los iconos de las tarjetas de grupo de Herramientas (el acento de color por canal pasa a una franja lateral), renovar por completo la tarjeta del grupo principal del equipo para que no se vea genérica, y eliminar el panel de estadísticas que está a su lado.

**Architecture:** `GrupoCard.tsx` pierde el icono/insignia; el acento de color por canal (verde WhatsApp / dorado Dropbox) se mueve a un borde izquierdo grueso en la tarjeta completa. `GrupoPrincipalCard.tsx` se reescribe por completo: pasa de un patrón idéntico a `GrupoCard` (icono+título+descripción+link) a una banda de ancho completo con degradado verde WhatsApp, tipografía grande, badges "Oficial"/"100% Privado" (dato que hoy vive en `IndicadoresPanel`), y un botón sólido de acción. `IndicadoresPanel.tsx` se elimina del proyecto (sin otros usos); `HerramientasHub.tsx` deja que `GrupoPrincipalCard` ocupe el ancho completo en su lugar.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12, Tailwind CSS, Vitest + Testing Library.

---

## Task 1: `GrupoCard.tsx` — sin icono, acento en franja lateral

**Files:**
- Modify: `components/estudiante/herramientas/GrupoCard.tsx`
- Modify: `components/estudiante/herramientas/GrupoCard.test.tsx`

**Contexto para quien implemente:** Hoy cada tarjeta de grupo muestra un icono (WhatsApp o Dropbox) dentro de una insignia con fondo/borde de color — ese color es el acento por canal agregado en el ciclo anterior. Se quita el icono por completo; el acento de color pasa a un borde izquierdo grueso (`border-l-4`) en la tarjeta completa, que sigue diferenciando el canal de un vistazo sin necesitar el icono.

- [ ] **Paso 1: Reemplazar `GrupoCard.test.tsx` completo**

Reemplazar el contenido completo de `components/estudiante/herramientas/GrupoCard.test.tsx` por:

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
  it("vista grid: acento verde WhatsApp en la franja lateral y el link", () => {
    const grupo = crearGrupo({ id: "g1", nombre: "Domus", tipoCanal: "whatsapp" });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.firstElementChild).toHaveClass("border-l-whatsapp");
    expect(screen.getByRole("link", { name: /unirse/i })).toHaveClass("text-whatsapp");
  });

  it("vista grid: acento dorado Dropbox en la franja lateral y el link", () => {
    const grupo = crearGrupo({
      id: "g2",
      nombre: "Carpeta Compartida",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.firstElementChild).toHaveClass("border-l-gold-500");
    expect(screen.getByRole("link", { name: /abrir carpeta/i })).toHaveClass("text-gold-300");
  });

  it("vista lista: tambien aplica el acento verde WhatsApp en la franja lateral", () => {
    const grupo = crearGrupo({ id: "g3", nombre: "Domus", tipoCanal: "whatsapp" });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    expect(container.firstElementChild).toHaveClass("border-l-whatsapp");
  });

  it("vista lista: tambien aplica el acento dorado Dropbox en la franja lateral", () => {
    const grupo = crearGrupo({
      id: "g4",
      nombre: "Carpeta",
      tipoCanal: "dropbox",
      enlaceUrl: "https://dropbox.com/prueba",
    });
    const { container } = render(<GrupoCard grupo={grupo} vista="lista" />);

    expect(container.firstElementChild).toHaveClass("border-l-gold-500");
  });

  it("no renderiza ningun icono", () => {
    const grupo = crearGrupo({ id: "g5", nombre: "Sin Icono" });
    const { container } = render(<GrupoCard grupo={grupo} vista="grid" />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/herramientas/GrupoCard.test.tsx`
Expected: FAIL — el componente actual todavía usa un icono con badge, no una franja lateral (`border-l-whatsapp`/`border-l-gold-500` no existen en el `className` del contenedor raíz todavía).

- [ ] **Paso 3: Reemplazar `GrupoCard.tsx`**

Reemplazar el contenido completo de `components/estudiante/herramientas/GrupoCard.tsx` por:

```tsx
"use client";

import { motion } from "framer-motion";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";
import { ETIQUETA_CATEGORIA } from "@/lib/db/grupos-comunidad.types";

const ETIQUETA_ACCION: Record<GrupoComunidad["tipoCanal"], string> = {
  whatsapp: "Unirse",
  dropbox: "Abrir carpeta",
};

const ACENTO_CANAL: Record<
  GrupoComunidad["tipoCanal"],
  { franja: string; hoverBorde: string; link: string; glow: string }
> = {
  whatsapp: {
    franja: "border-l-4 border-l-whatsapp",
    hoverBorde: "hover:border-whatsapp/40",
    link: "text-whatsapp hover:text-whatsapp-dark",
    glow: "bg-whatsapp/20",
  },
  dropbox: {
    franja: "border-l-4 border-l-gold-500",
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
        className={`flex items-center justify-between gap-4 rounded-xl border border-white/[0.08] bg-white/[0.03] px-5 py-4 transition ${acento.franja} ${acento.hoverBorde}`}
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-white">{grupo.nombre}</p>
          <p className="truncate text-xs text-mist-400">
            {ETIQUETA_CATEGORIA[grupo.categoria]}
            {grupo.detalle ? ` · ${grupo.detalle}` : ""}
          </p>
        </div>
        {accion}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className={`group relative flex flex-col justify-between gap-4 overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 transition-colors ${acento.franja} ${acento.hoverBorde}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100 ${acento.glow}`}
      />
      <div className="relative">
        <h3 className="font-display font-semibold text-white">{grupo.nombre}</h3>
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
Expected: PASS (5 tests)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/herramientas/GrupoCard.tsx components/estudiante/herramientas/GrupoCard.test.tsx
git commit -m "feat(herramientas): quita el icono de GrupoCard, el acento de canal pasa a una franja lateral"
```

---

## Task 2: `GrupoPrincipalCard.tsx` — rediseño completo

**Files:**
- Modify: `components/estudiante/herramientas/GrupoPrincipalCard.tsx`
- Create: `components/estudiante/herramientas/GrupoPrincipalCard.test.tsx` (nuevo — no existe hoy)

**Contexto para quien implemente:** Hoy esta tarjeta usa el mismo patrón genérico que `GrupoCard` (icono+título+descripción+link sutil), por eso "se ve genérica como el resto". Se rediseña por completo: banda con degradado verde WhatsApp, tipografía más grande, badges "Oficial"/"100% Privado" (dato que hoy vive en `IndicadoresPanel`, componente que se elimina en la Task 3), y un botón sólido de acción en vez de un link de texto. El componente sigue sin necesitar `"use client"` — no usa hooks ni manejadores de evento propios, solo renderiza un `<a>`/`<span>` condicional, igual que la versión actual.

- [ ] **Paso 1: Escribir los tests que fallan**

Crear `components/estudiante/herramientas/GrupoPrincipalCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { GrupoPrincipalCard } from "./GrupoPrincipalCard";
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

function crearGrupo(
  overrides: Partial<GrupoComunidad> & { id: string; nombre: string }
): GrupoComunidad {
  return {
    categoria: "grupo_principal",
    detalle: null,
    tipoCanal: "whatsapp",
    enlaceUrl: "https://chat.whatsapp.com/prueba",
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("GrupoPrincipalCard", () => {
  it("no renderiza nada si no hay grupo principal", () => {
    const { container } = render(<GrupoPrincipalCard grupo={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("muestra el nombre y los badges 'Oficial' y '100% Privado'", () => {
    const grupo = crearGrupo({ id: "principal", nombre: "Grupo Principal del Equipo" });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(screen.getByText("Grupo Principal del Equipo")).toBeInTheDocument();
    expect(screen.getByText("Oficial")).toBeInTheDocument();
    expect(screen.getByText("100% Privado")).toBeInTheDocument();
  });

  it("muestra un boton 'Unirse al grupo' con el enlace correcto cuando hay enlaceUrl", () => {
    const grupo = crearGrupo({
      id: "principal",
      nombre: "Grupo Principal del Equipo",
      enlaceUrl: "https://chat.whatsapp.com/prueba",
    });
    render(<GrupoPrincipalCard grupo={grupo} />);

    const boton = screen.getByRole("link", { name: /unirse al grupo/i });
    expect(boton).toHaveAttribute("href", "https://chat.whatsapp.com/prueba");
    expect(boton).toHaveAttribute("target", "_blank");
  });

  it("muestra 'Enlace pendiente' cuando no hay enlaceUrl", () => {
    const grupo = crearGrupo({
      id: "principal",
      nombre: "Grupo Principal del Equipo",
      enlaceUrl: null,
    });
    render(<GrupoPrincipalCard grupo={grupo} />);

    expect(screen.getByText("Enlace pendiente")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /unirse al grupo/i })).not.toBeInTheDocument();
  });
});
```

- [ ] **Paso 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/herramientas/GrupoPrincipalCard.test.tsx`
Expected: FAIL — el componente actual no muestra badges "Oficial"/"100% Privado" ni un botón con el texto "Unirse al grupo".

- [ ] **Paso 3: Reemplazar `GrupoPrincipalCard.tsx`**

Reemplazar el contenido completo de `components/estudiante/herramientas/GrupoPrincipalCard.tsx` por:

```tsx
import type { GrupoComunidad } from "@/lib/db/grupos-comunidad.types";

const BADGES = ["Oficial", "100% Privado"];

export function GrupoPrincipalCard({ grupo }: { grupo: GrupoComunidad | undefined }) {
  if (!grupo) {
    return null;
  }

  const tieneEnlace = Boolean(grupo.enlaceUrl);

  return (
    <div className="flex flex-col gap-6 rounded-[24px] border border-whatsapp/20 bg-gradient-to-r from-whatsapp/15 via-whatsapp/5 to-transparent p-8 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex flex-wrap gap-2">
          {BADGES.map((badge) => (
            <span
              key={badge}
              className="rounded-full border border-whatsapp/30 bg-whatsapp/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-whatsapp"
            >
              {badge}
            </span>
          ))}
        </div>
        <h3 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          {grupo.nombre}
        </h3>
        <p className="mt-1.5 text-sm text-mist-300">
          Canal maestro de comunicación general del equipo.
        </p>
      </div>
      {tieneEnlace ? (
        <a
          href={grupo.enlaceUrl!}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 py-3.5 font-semibold text-ink-950 transition hover:scale-[1.02] hover:bg-whatsapp-dark active:scale-[0.98]"
        >
          Unirse al grupo ↗
        </a>
      ) : (
        <span
          title="Este grupo todavía no tiene enlace cargado"
          className="shrink-0 text-sm font-medium text-mist-500 opacity-50 cursor-not-allowed"
        >
          Enlace pendiente
        </span>
      )}
    </div>
  );
}
```

- [ ] **Paso 4: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/herramientas/GrupoPrincipalCard.test.tsx`
Expected: PASS (4 tests)

- [ ] **Paso 5: Commit**

```bash
git add components/estudiante/herramientas/GrupoPrincipalCard.tsx components/estudiante/herramientas/GrupoPrincipalCard.test.tsx
git commit -m "feat(herramientas): renueva GrupoPrincipalCard con banda destacada y badges"
```

---

## Task 3: eliminar `IndicadoresPanel` + ajustar layout de `HerramientasHub.tsx`

**Files:**
- Delete: `components/estudiante/herramientas/IndicadoresPanel.tsx`
- Modify: `components/estudiante/herramientas/HerramientasHub.tsx`
- Modify: `components/estudiante/herramientas/HerramientasHub.test.tsx`

**Contexto para quien implemente:** `IndicadoresPanel` no tiene otros usos en el proyecto fuera de `HerramientasHub.tsx` (confirmado por búsqueda en todo el repositorio) — se elimina el archivo por completo, no solo se deja de importar. `HerramientasHub.tsx` hoy renderiza `GrupoPrincipalCard` e `IndicadoresPanel` uno al lado del otro en una fila `grid-cols-2`; al eliminar el panel, `GrupoPrincipalCard` pasa a ocupar el ancho completo por sí sola (ya no necesita el contenedor `grid`).

- [ ] **Paso 1: Escribir el test que falla**

Añadir al `describe("HerramientasHub", ...)` existente en `HerramientasHub.test.tsx`, después del test "muestra el conteo real de grupos activos en el banner":

```tsx
  it("ya no muestra el panel de estadisticas junto a la tarjeta principal", () => {
    render(<HerramientasHub grupos={GRUPOS} />);
    expect(screen.queryByText("Grupos")).not.toBeInTheDocument();
  });
```

(Nota: se usa `queryByText("Grupos")` con coincidencia exacta a propósito — el banner sigue mostrando "Grupos activos" como texto propio, que no coincide con "Grupos" a secas, así que este test no choca con eso.)

- [ ] **Paso 2: Correr el test y verificar que falla**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: los 7 tests existentes pasan; el nuevo FALLA (`IndicadoresPanel` todavía se renderiza, con su etiqueta "Grupos").

- [ ] **Paso 3: Eliminar `IndicadoresPanel.tsx`**

```bash
git rm components/estudiante/herramientas/IndicadoresPanel.tsx
```

- [ ] **Paso 4: Editar `HerramientasHub.tsx`**

Quitar la línea de import de `IndicadoresPanel`:

```tsx
import { IndicadoresPanel } from "./IndicadoresPanel";
```

Reemplazar:

```tsx
      <div className="grid gap-6 sm:grid-cols-2">
        <GrupoPrincipalCard grupo={grupoPrincipal} />
        <IndicadoresPanel totalGrupos={gruposDeProyecto.length} />
      </div>
```

por:

```tsx
      <GrupoPrincipalCard grupo={grupoPrincipal} />
```

- [ ] **Paso 5: Correr los tests y verificar que todos pasan**

Run: `npx vitest run components/estudiante/herramientas/HerramientasHub.test.tsx`
Expected: PASS (8 tests: 7 existentes + 1 nuevo)

- [ ] **Paso 6: Correr el tsc para confirmar que no hay errores de tipos**

Run: `npx tsc --noEmit`
Expected: sin salida (limpio) — confirma que no queda ninguna referencia rota a `IndicadoresPanel` en el proyecto.

- [ ] **Paso 7: Commit**

```bash
git add components/estudiante/herramientas/HerramientasHub.tsx components/estudiante/herramientas/HerramientasHub.test.tsx
git commit -m "feat(herramientas): elimina IndicadoresPanel, GrupoPrincipalCard ocupa el ancho completo"
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

- La tarjeta del grupo principal ocupa todo el ancho, con la banda de
  degradado verde, los badges "Oficial"/"100% Privado", y el botón
  sólido "Unirse al grupo".
- No queda espacio vacío ni un salto de layout donde antes estaba el
  panel de estadísticas.
- Las tarjetas de la grilla/lista no muestran ningún icono, pero sí una
  franja de color a la izquierda (verde para WhatsApp, dorada para
  Dropbox).
- El resplandor en hover (vista grid) sigue funcionando igual que antes.

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

- **Cobertura del spec:** icono quitado + franja lateral en `GrupoCard`
  (Task 1), rediseño completo de `GrupoPrincipalCard` con badges
  "Oficial"/"100% Privado" y botón sólido (Task 2), eliminación de
  `IndicadoresPanel` sin dejar código muerto (Task 3, `git rm` en vez de
  solo dejar de importarlo), `GrupoPrincipalCard` a ancho completo (Task
  3), testing (Tasks 1-3), verificación manual + build obligatorio con
  manejo explícito de la falta de herramienta de navegador (Task 4),
  fuera de alcance respetado (sin tocar banner/toolbar/chips/paginación).
- **Corrección de un test propuesto en el spec:** el spec original
  sugería verificar la ausencia del panel de estadísticas buscando que
  el texto "Privado" no esté presente — pero `GrupoPrincipalCard` (Task
  2) también muestra "100% Privado" como badge, así que ese texto SÍ
  sigue apareciendo en la página (por una razón distinta). El test real
  en la Task 3 usa `queryByText("Grupos")` (coincidencia exacta, no
  "Grupos activos") para verificar específicamente que la etiqueta
  propia de `IndicadoresPanel` desapareció, sin chocar con el badge ni
  con el banner.
- **Consistencia de tipos:** `ACENTO_CANAL` en `GrupoCard.tsx` (Task 1)
  cambia su forma de `{ badge, hoverBorde, link, glow }` a `{ franja,
  hoverBorde, link, glow }` de forma completa y consistente en todos sus
  usos dentro del mismo archivo — no queda ninguna referencia a `badge`.
- **Sin placeholders:** todos los pasos incluyen código completo,
  comandos exactos y resultados esperados concretos.
