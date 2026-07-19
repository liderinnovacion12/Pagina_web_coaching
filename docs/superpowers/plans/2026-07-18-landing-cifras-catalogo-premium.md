# Landing — cifras premium, indicador de scroll y catálogo rediseñado Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agrandar las cifras del Hero de la landing pública con un
tratamiento de glow (sin 3D), agregar un indicador de scroll que invite a
ver los cursos, y rediseñar la sección de Catálogo (encabezado dramático +
tarjetas más grandes con entrada lateral alternada).

**Architecture:** Restyle de componentes existentes (`HeroContent.tsx`,
`page.tsx`, `CatalogoList.tsx`, `CatalogoCursoCard.tsx`) reutilizando el
lenguaje de movimiento ya validado en el resto del sitio (`ScrollReveal`,
`revealUp`, glow radial). `revealSlideLeft`/`revealSlideRight` (hoy locales
en `DashboardContent.tsx`) se centralizan en `lib/motion.ts` para
reutilizarlas en la landing sin duplicar código.

**Tech Stack:** Next.js 15, React 19, framer-motion 12, Tailwind CSS,
Vitest + Testing Library.

---

### Task 1: Centralizar `revealSlideLeft`/`revealSlideRight` en `lib/motion.ts`

**Files:**
- Modify: `lib/motion.ts`
- Modify: `lib/motion.test.ts`
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

Mismo refactor que ya se hizo con `revealUp` (commit `04c7254`) — se mueve
la definición, se actualiza el único call site existente para importarla
en vez de definirla localmente.

- [ ] **Step 1: Escribir los tests que fallan**

Agregar a `lib/motion.test.ts`, dentro del `describe("variantes de
motion", ...)` existente (después del test de `revealUp`):

```ts
  it("revealSlideLeft entra desde la izquierda con blur pronunciado, sin rotación", () => {
    expect(revealSlideLeft.hidden).toEqual({
      opacity: 0,
      x: -130,
      filter: "blur(10px)",
    });
    expect(revealSlideLeft.visible).toMatchObject({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });

  it("revealSlideRight entra desde la derecha con blur pronunciado, sin rotación", () => {
    expect(revealSlideRight.hidden).toEqual({
      opacity: 0,
      x: 130,
      filter: "blur(10px)",
    });
    expect(revealSlideRight.visible).toMatchObject({
      opacity: 1,
      x: 0,
      filter: "blur(0px)",
      transition: { duration: 0.5, ease: EASE_OUT },
    });
  });
```

Agregar `revealSlideLeft, revealSlideRight` al import existente de
`"./motion"` en la parte superior del archivo.

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run lib/motion.test.ts`
Expected: FAIL — `revealSlideLeft`/`revealSlideRight` no existen todavía
en `lib/motion.ts`.

- [ ] **Step 3: Agregar las variantes a `lib/motion.ts`**

Agregar al final de `lib/motion.ts` (después de `revealUp`, antes de
`fadeIn`):

```ts
// Deslizamiento horizontal limpio, sin rotación — el blur pronunciado
// (10px) hace que el elemento se sienta "materializándose" en vez de un
// objeto ya formado que todavía está deslizando a los tirones.
export const revealSlideLeft: Variants = {
  hidden: { opacity: 0, x: -130, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};

export const revealSlideRight: Variants = {
  hidden: { opacity: 0, x: 130, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE_OUT },
  },
};
```

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run lib/motion.test.ts`
Expected: PASS — todos los tests, viejos y nuevos.

- [ ] **Step 5: Actualizar `DashboardContent.tsx` para importar las variantes**

En `app/(estudiante)/dashboard/DashboardContent.tsx`, eliminar la
definición local completa (líneas 139-163 actuales, el bloque de
comentario + `revealSlideLeft` + `revealSlideRight`):

```tsx
// Deslizamiento horizontal limpio, sin rotación — a diferencia de
// revealFromLeftFar/revealFromRightFar (que sí rotan), esta variante evita
// que el desplazamiento se lea como un "tambaleo/caída" en vez de un
// deslizamiento lateral fluido. Usada en Dos Columnas y Nuestros Valores.
// El blur más pronunciado (10px, igual que blurFadeUp del resto del sitio)
// hace que la tarjeta se sienta "materializándose" en vez de un objeto ya
// formado que todavía está deslizando a los tirones.
const revealSlideLeft: Variants = {
  hidden: { opacity: 0, x: -130, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};

const revealSlideRight: Variants = {
  hidden: { opacity: 0, x: 130, filter: "blur(10px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: EASE },
  },
};
```

Actualizar el import existente de `"@/lib/motion"` (línea 16 actual,
`import { revealUp } from "@/lib/motion";`) para incluir ambas:

```tsx
import { revealSlideLeft, revealSlideRight, revealUp } from "@/lib/motion";
```

No tocar `const EASE = [...]` local — sigue usada por `revealLeft`,
`revealRight`, `revealScale`, `revealFromLeftFar`, `revealFromRightFar`.

- [ ] **Step 6: Correr toda la suite de Bienvenida y verificar que sigue en verde**

Run: `npx vitest run lib/motion.test.ts "app/(estudiante)/dashboard" components/estudiante/dashboard`
Expected: PASS — mismo comportamiento, ahora importado desde
`lib/motion.ts`.

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add lib/motion.ts lib/motion.test.ts "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "refactor(motion): centraliza revealSlideLeft/revealSlideRight en lib/motion.ts"
```

---

### Task 2: Cifras del Hero más grandes + indicador de scroll

**Files:**
- Modify: `app/(public)/HeroContent.tsx`
- Modify: `app/(public)/HeroContent.test.tsx`

- [ ] **Step 1: Escribir el test que falla para el indicador de scroll**

Agregar a `app/(public)/HeroContent.test.tsx`, dentro del `it(...)`
existente (después de las aserciones de estadísticas, antes del cierre):

```tsx
    expect(
      screen.getByRole("link", { name: /descubrí nuestros cursos/i })
    ).toHaveAttribute("href", "#cursos");
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run app/\(public\)/HeroContent.test.tsx`
Expected: FAIL — el link "Descubrí nuestros cursos" no existe todavía.

- [ ] **Step 3: Implementar los cambios en `HeroContent.tsx`**

Agregar el import de `ChevronDown` al inicio del archivo (junto al import
existente de `Link`):

```tsx
import { ChevronDown } from "lucide-react";
```

Reemplazar el bloque del grid de estadísticas (líneas 118-132 actuales):

```tsx
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
```

por:

```tsx
      {/* Grid de Estadísticas con Contadores */}
      <motion.div variants={animVariant} className="relative mt-16 w-full">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.10),transparent_60%)]"
        />
        <dl className="grid gap-10 text-left sm:grid-cols-3 sm:gap-16">
          {estadisticas.map((stat) => (
            <div key={stat.etiqueta} className="border-t border-white/10 pt-5">
              <dt className="sr-only">{stat.etiqueta}</dt>
              <dd className="font-mono text-5xl font-semibold text-gold-400 sm:text-6xl">
                <AnimatedCounter value={stat.valor} />
              </dd>
              <p className="mt-2 text-sm text-mist-500">{stat.etiqueta}</p>
            </div>
          ))}
        </dl>
      </motion.div>

      {/* Indicador de scroll hacia el catálogo */}
      <motion.a
        href="#cursos"
        variants={animVariant}
        className="mt-14 flex flex-col items-center gap-2 text-mist-500 transition-colors duration-200 hover:text-gold-300"
      >
        <span className="font-mono text-xs uppercase tracking-wider">
          Descubrí nuestros cursos
        </span>
        <motion.span
          animate={reducedMotion ? undefined : { y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="h-5 w-5" aria-hidden="true" />
        </motion.span>
      </motion.a>
```

Nota: `reducedMotion` ya existe como variable en este componente (línea
60 actual, `const reducedMotion = useReducedMotionSafe();`) — no hace
falta declararla de nuevo.

- [ ] **Step 4: Correr los tests y verificar que pasan**

Run: `npx vitest run app/\(public\)/HeroContent.test.tsx`
Expected: PASS.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 6: Commit**

```bash
git add "app/(public)/HeroContent.tsx" "app/(public)/HeroContent.test.tsx"
git commit -m "feat(landing): agranda las cifras del hero con glow y agrega indicador de scroll"
```

---

### Task 3: Encabezado de Catálogo con escala dramática + fondo

**Files:**
- Modify: `app/(public)/page.tsx`

No requiere tests nuevos — `page.tsx` no tiene un archivo de test dedicado
hoy (confirmado: no existe `app/(public)/page.test.tsx` ni ningún test que
importe este componente). Se verifica con typecheck y la verificación
manual de la Task 5.

- [ ] **Step 1: Agregar el import de `ScrollReveal` y `revealUp`**

En `app/(public)/page.tsx`, agregar tras el import existente de
`ParticleField`:

```tsx
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { revealUp } from "@/lib/motion";
```

- [ ] **Step 2: Reemplazar la sección de Catálogo**

Reemplazar el bloque completo (líneas 36-46 actuales):

```tsx
      <section id="cursos" className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="font-display text-3xl font-bold text-white">
          Catálogo de cursos
        </h2>
        <p className="mt-2 text-mist-400">
          Programas diseñados por coaches ejecutivos con experiencia real.
        </p>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
```

por:

```tsx
      <section id="cursos" className="relative mx-auto max-w-6xl px-6 py-20">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-[radial-gradient(circle_at_30%_20%,rgba(217,169,78,0.08),transparent_60%)]"
        />
        <ScrollReveal
          variants={revealUp}
          once={false}
          className="border-t border-white/10 pt-10"
        >
          <h2 className="font-display text-4xl font-bold text-gradient-gold sm:text-5xl">
            Catálogo de cursos
          </h2>
          <p className="mt-4 max-w-xl text-mist-400">
            Programas diseñados por coaches ejecutivos con experiencia real.
          </p>
        </ScrollReveal>
        <div className="mt-10">
          <CatalogoList cursos={cursos} />
        </div>
      </section>
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 4: Commit**

```bash
git add "app/(public)/page.tsx"
git commit -m "feat(landing): encabezado de Catalogo con escala dramatica y fondo con glow"
```

---

### Task 4: Tarjetas de curso más grandes con entrada lateral alternada

**Files:**
- Modify: `app/(public)/CatalogoCursoCard.tsx`
- Modify: `app/(public)/CatalogoCursoCard.test.tsx`
- Modify: `app/(public)/CatalogoList.tsx`
- Modify: `app/(public)/CatalogoList.test.tsx`

- [ ] **Step 1: Escribir el test que falla para `CatalogoCursoCard`**

`CatalogoCursoCard.test.tsx` va a necesitar pasar el nuevo prop
`variants` (antes hardcodeado internamente). Reemplazar el contenido
completo de `app/(public)/CatalogoCursoCard.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import { revealSlideLeft } from "@/lib/motion";

describe("CatalogoCursoCard", () => {
  it("muestra el título y el precio formateado del curso", () => {
    render(
      <ul>
        <CatalogoCursoCard
          curso={{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }}
          variants={revealSlideLeft}
        />
      </ul>
    );

    expect(screen.getByText("Ventas B2B")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr el test y verificar que falla**

Run: `npx vitest run app/\(public\)/CatalogoCursoCard.test.tsx`
Expected: FAIL — `CatalogoCursoCard` no acepta todavía un prop
`variants` (error de tipos o prop ignorado sin efecto en el render
actual, pero el objetivo de este paso es confirmar que el componente
actual no tiene el prop antes de agregarlo).

- [ ] **Step 3: Implementar los cambios en `CatalogoCursoCard.tsx`**

Reemplazar el contenido completo de `app/(public)/CatalogoCursoCard.tsx`:

```tsx
"use client";

import { motion, useMotionTemplate, useMotionValue, type Variants } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";

export function CatalogoCursoCard({
  curso,
  variants,
}: {
  curso: CursoPublicado;
  variants: Variants;
}) {
  // Valores de movimiento para la posición del cursor local
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <motion.li
      variants={variants}
      whileHover={{ y: -4 }}
      onMouseMove={handleMouseMove}
      className="group relative rounded-xl border border-white/8 bg-ink-900/60 p-8 transition-[border-color,box-shadow] duration-300 hover:border-gold-500/20 overflow-hidden backdrop-blur-md"
    >
      {/* Spotlight de fondo que sigue al cursor en hover */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: useMotionTemplate`radial-gradient(280px circle at ${mouseX}px ${mouseY}px, rgba(217, 169, 78, 0.07), transparent 80%)`,
        }}
      />

      {/* Spotlight de borde magnético que sigue al cursor en hover */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-px rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 border border-gold-500/40"
        style={{
          maskImage: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
          WebkitMaskImage: useMotionTemplate`radial-gradient(150px circle at ${mouseX}px ${mouseY}px, black, transparent)`,
        }}
      />

      {/* Contenido de la Tarjeta */}
      <div className="relative z-10">
        <h3 className="font-display text-xl font-semibold text-white group-hover:text-gold-200 transition-colors duration-300">
          {curso.titulo}
        </h3>
        <p className="mt-2 font-mono text-gold-400 group-hover:text-gold-300 transition-colors duration-300">
          ${curso.precio.toFixed(2)}
        </p>
      </div>
    </motion.li>
  );
}
```

Cambios respecto al archivo actual: se agrega el prop `variants:
Variants` (reemplaza el import de `fadeUp` que ya no se usa), `p-5` →
`p-8`, y el `h3` gana `text-xl` explícito (antes no tenía tamaño, heredaba
el default). El spotlight (ambos `motion.div` internos) no cambia.

- [ ] **Step 4: Correr el test y verificar que pasa**

Run: `npx vitest run app/\(public\)/CatalogoCursoCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Escribir el test que falla para `CatalogoList`**

`CatalogoList.test.tsx` no necesita cambios en sus aserciones (sigue
verificando título/precio), pero como ahora `CatalogoCursoCard` requiere
el prop `variants`, hay que confirmar que `CatalogoList` se lo pasa
correctamente. Esto ya se cubre por el test existente `"muestra título y
precio de cada curso"` — si `CatalogoList` no le pasa `variants` a
`CatalogoCursoCard`, ese test seguiría pasando en tiempo de ejecución
(JS no valida tipos en runtime), así que el chequeo real de que el prop
se pasa correctamente lo da `npx tsc --noEmit` en el Step 7. No se agrega
un test nuevo en este archivo — no hay una forma de test-driven
significativa de verificar "qué variante alterna por índice" sin
inspeccionar props internos de un componente hijo, y no vale la pena
mockear `CatalogoCursoCard` solo para eso.

- [ ] **Step 6: Implementar los cambios en `CatalogoList.tsx`**

Reemplazar el contenido completo de `app/(public)/CatalogoList.tsx`:

```tsx
"use client";

import { motion } from "framer-motion";
import type { CursoPublicado } from "@/lib/db/cursos";
import { CatalogoCursoCard } from "./CatalogoCursoCard";
import {
  SCROLL_REVEAL_VIEWPORT,
  revealSlideLeft,
  revealSlideRight,
  staggerContainer,
} from "@/lib/motion";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p className="text-mist-400">Próximamente nuevos cursos.</p>;
  }

  return (
    <motion.ul
      initial="hidden"
      whileInView="visible"
      viewport={SCROLL_REVEAL_VIEWPORT}
      variants={staggerContainer(0.07)}
      className="grid gap-4 overflow-x-hidden sm:grid-cols-2"
    >
      {cursos.map((curso, indice) => (
        <CatalogoCursoCard
          key={curso.id}
          curso={curso}
          variants={indice % 2 === 0 ? revealSlideLeft : revealSlideRight}
        />
      ))}
    </motion.ul>
  );
}
```

Cambios respecto al archivo actual: grid pasa de `sm:grid-cols-2
lg:grid-cols-3` a `sm:grid-cols-2` (siempre 2 columnas) + gana
`overflow-x-hidden` (necesario porque los hijos ahora se trasladan hasta
±130px en X — este `<motion.ul>` solo anima opacidad vía
`staggerContainer`, nunca se traslada a sí mismo, así que es seguro poner
el `overflow-x-hidden` acá directamente); el `.map()` ahora recibe el
índice y alterna `revealSlideLeft`/`revealSlideRight` por tarjeta.

- [ ] **Step 7: Correr toda la suite del catálogo y verificar que pasa**

Run: `npx vitest run "app/\(public\)/CatalogoList.test.tsx" "app/\(public\)/CatalogoCursoCard.test.tsx"`
Expected: PASS.

Run: `npx tsc --noEmit`
Expected: sin errores (esto confirma que `CatalogoList` le pasa
`variants` correctamente a `CatalogoCursoCard` según su nuevo tipo).

- [ ] **Step 8: Commit**

```bash
git add "app/(public)/CatalogoCursoCard.tsx" "app/(public)/CatalogoCursoCard.test.tsx" "app/(public)/CatalogoList.tsx"
git commit -m "feat(landing): tarjetas de curso mas grandes con entrada lateral alternada"
```

---

### Task 5: Verificación manual en navegador

**Files:** ninguno (solo verificación, salvo fixes que surjan).

- [ ] **Step 1: Levantar un entorno de verificación**

Mismo patrón usado en los ciclos de Bienvenida: `.env.local` con
credenciales de Supabase placeholder, `npm run dev`. Como las
credenciales placeholder no van a conectar a Supabase de verdad
(`getCursosPublicados()` fallaría o devolvería vacío), crear una ruta
temporal `app/(public)/preview-catalogo-tmp/page.tsx` que renderice
`<HeroContent estadisticas={...} />` y `<CatalogoList cursos={...} />`
directamente con datos mock (al menos 4 cursos, para ver el patrón de
alternancia lateral izquierda/derecha/izquierda/derecha con claridad) —
mismo enfoque que la ruta `preview-dashboard-tmp` ya usada en los ciclos
de Bienvenida.

- [ ] **Step 2: Verificar las cifras del Hero**

Con Playwright, confirmar que las cifras se ven notablemente más grandes
(`text-5xl`/`text-6xl`), que el conteo desde 0 sigue funcionando al cargar
la página, y que el glow de fondo es sutil (no compite visualmente con el
resto del Hero).

- [ ] **Step 3: Verificar el indicador de scroll**

Confirmar que el chevron rebota continuamente, que el texto "Descubrí
nuestros cursos" es legible, que hacer click lleva a la sección
`#cursos`, y que con `page.emulateMedia({ reducedMotion: "reduce" })` el
rebote se detiene (el chevron queda estático) sin desaparecer.

- [ ] **Step 4: Verificar el encabezado del Catálogo**

Confirmar que el título "Catálogo de cursos" se ve en escala dramática
con el degradado dorado, y que el glow de fondo no genera overflow
horizontal.

- [ ] **Step 5: Verificar las tarjetas de curso**

Con datos mock (2+ cursos), confirmar que las tarjetas entran alternando
desde los lados (una desde la izquierda, la siguiente desde la derecha),
que el spotlight que sigue al cursor en hover sigue funcionando, y que
`document.documentElement.scrollWidth` no excede `clientWidth` en
768/1024/1440/1920px (sin overflow horizontal).

- [ ] **Step 6: Limpiar artefactos temporales**

Eliminar `.env.local`, cualquier ruta de preview temporal, scripts de
verificación, `dev.log`, y revertir cualquier diff accidental en
`next.config.ts`/`package-lock.json`. Confirmar `git status` limpio salvo
los cambios de código reales del ciclo.

- [ ] **Step 7: Suite completa y typecheck finales**

Run: `npx vitest run`
Expected: mismos resultados que en `main` antes de este ciclo (incluyendo
el flake conocido y ya documentado de
`app/(estudiante)/dashboard/page.test.tsx` "muestra el encabezado de
bienvenida" al correr la suite completa — pasa en aislamiento).

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 8: Commit de cualquier fix encontrado durante la verificación**

Si la verificación manual revela ajustes necesarios, corregir y
commitear con un mensaje descriptivo del hallazgo. Si no se encontró nada
que corregir, este paso se omite.

---

## Self-review notes

- **Spec coverage:** cifras más grandes + glow sin 3D (Task 2), indicador
  de scroll con chevron animado + link accesible (Task 2), encabezado de
  Catálogo con escala dramática + fondo (Task 3), tarjetas más grandes con
  entrada lateral alternada (Task 4), centralización de
  `revealSlideLeft`/`revealSlideRight` (Task 1) — todo cubierto.
- **Fuera de alcance confirmado sin tocar:** ninguna transformación 3D real,
  sin cambios al modelo de datos de `CursoPublicado`, ninguna otra página,
  sin nuevas dependencias (`ChevronDown` ya es parte de `lucide-react`,
  dependencia ya instalada).
- **Consistencia de tipos:** `revealSlideLeft`/`revealSlideRight` (tipadas
  `Variants`) se usan igual en `DashboardContent.tsx` y en
  `CatalogoList.tsx`/`CatalogoCursoCard.tsx` — mismo tipo, mismo valor, una
  sola fuente de verdad en `lib/motion.ts`. `CatalogoCursoCard`'s nuevo
  prop `variants: Variants` coincide con lo que `motion.li`'s prop
  `variants` ya espera.
- **Riesgo de overflow horizontal identificado y mitigado en el plan:**
  igual que en Bienvenida, `revealSlideLeft`/`revealSlideRight` (±130px)
  requieren `overflow-x-hidden` en un contenedor que no se traslada a sí
  mismo — Task 4 lo aplica directamente en `CatalogoList.tsx`'s
  `<motion.ul>` (seguro, porque solo anima opacidad), evitando repetir la
  saga de 3 commits que costó resolver esto en Bienvenida.
