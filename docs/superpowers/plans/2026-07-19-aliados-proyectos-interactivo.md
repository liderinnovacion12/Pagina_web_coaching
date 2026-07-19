# Aliados y Proyectos Inmobiliarios Aliados — layouts interactivos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar la grilla de tarjetas de Aliados por un layout
maestro-detalle interactivo, y la grilla de Proyectos Inmobiliarios
Aliados por un showcase de scroll horizontal con navegación por flechas.

**Architecture:** Ambos componentes (`AliadosGrid.tsx`,
`ProyectosAliadosGrid.tsx`) se reescriben manteniendo su firma de props
externa (`page.tsx` no cambia). `AliadoCard.tsx` se elimina — su
contenido se integra directamente en el panel de detalle de
`AliadosGrid.tsx`. `ProyectoCard.tsx` se mantiene, solo cambian sus
clases de ancho/posicionamiento. De paso se corrige un bug de
propagación de variantes de framer-motion preexistente en ambos
componentes (las tarjetas no tenían ninguna animación de entrada porque
su contenedor no era un `motion` con `initial`/`animate`).

**Tech Stack:** Next.js 15, React 19, framer-motion 12, Tailwind CSS,
Vitest + Testing Library (`fireEvent`, no `user-event` — no es una
dependencia instalada en este proyecto).

---

### Task 1: Aliados — layout maestro-detalle

**Files:**
- Modify: `components/estudiante/aliados/AliadosGrid.tsx`
- Modify: `components/estudiante/aliados/AliadosGrid.test.tsx`
- Delete: `components/estudiante/aliados/AliadoCard.tsx`
- Delete: `components/estudiante/aliados/AliadoCard.test.tsx`

- [ ] **Step 1: Escribir el nuevo `AliadosGrid.test.tsx` completo (falla)**

Reemplazar el contenido completo de
`components/estudiante/aliados/AliadosGrid.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AliadosGrid } from "./AliadosGrid";
import type { Aliado } from "@/lib/db/aliados.types";

function crearAliado(overrides: Partial<Aliado> & { id: string; servicio: string }): Aliado {
  return {
    descripcion: "Descripción de prueba.",
    contactoNombre: "Contacto Prueba",
    contactoTelefono: "+1 (000) 000-0000",
    contactoCorreo: "contacto@prueba.com",
    imagenUrl: null,
    orden: 0,
    activo: true,
    creadoEn: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

const ALIADOS: Aliado[] = [
  crearAliado({ id: "a1", servicio: "Tributaria LLC", descripcion: "Descripción de Tributaria." }),
  crearAliado({ id: "a2", servicio: "Grow Marketing", descripcion: "Descripción de Grow Marketing." }),
];

describe("AliadosGrid", () => {
  it("muestra el título y subtítulo de la página", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    expect(screen.getByText("Aliados Estratégicos del Equipo")).toBeInTheDocument();
    expect(screen.getByText(/Contactos y aliados/)).toBeInTheDocument();
  });

  it("lista los nombres de todos los aliados, con el primero seleccionado por defecto", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    // "Tributaria LLC" aparece dos veces: el botón de la lista y el
    // título del panel de detalle (es el primero, seleccionado por defecto).
    expect(screen.getAllByText("Tributaria LLC")).toHaveLength(2);
    // "Grow Marketing" solo aparece una vez: el botón de la lista (no
    // está seleccionado todavía).
    expect(screen.getByText("Grow Marketing")).toBeInTheDocument();
  });

  it("el primer aliado tiene aria-current, y cambia al hacer click en otro", () => {
    render(<AliadosGrid aliados={ALIADOS} />);

    const botonTributaria = screen.getByRole("button", { name: "Tributaria LLC" });
    const botonGrow = screen.getByRole("button", { name: "Grow Marketing" });
    expect(botonTributaria).toHaveAttribute("aria-current", "true");
    expect(botonGrow).toHaveAttribute("aria-current", "false");

    fireEvent.click(botonGrow);

    expect(screen.getByText("Descripción de Grow Marketing.")).toBeInTheDocument();
    expect(botonGrow).toHaveAttribute("aria-current", "true");
    expect(botonTributaria).toHaveAttribute("aria-current", "false");
  });

  it("con un solo contacto, no repite el nombre en el panel de detalle", () => {
    const aliado = crearAliado({
      id: "a1",
      servicio: "Tributaria LLC",
      contactoNombre: "Ricardo Fernandez de Cordoba Martos",
      contactoTelefono: "+1 (305) 458-6559",
      contactoCorreo: "ricardo.fernandez@firstglobalfinanceus.com",
    });

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.getAllByText("Ricardo Fernandez de Cordoba Martos")).toHaveLength(1);
    expect(screen.getByRole("link", { name: /\+1 \(305\) 458-6559/ })).toHaveAttribute(
      "href",
      "tel:+1 (305) 458-6559"
    );
  });

  it("con dos contactos, el nombre precede cada teléfono/correo", () => {
    const aliado = crearAliado({
      id: "a3",
      servicio: "Keep It Simple - Transaction Coordinator",
      contactoNombre: "Anahis\nAntonio",
      contactoTelefono: "+1 (478) 412-5213\n+1 (832) 299-5129",
      contactoCorreo: "Anahis@keepitsimple.properties\nAntonio@keepitsimple.properties",
    });

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.getByText("Anahis")).toBeInTheDocument();
    expect(screen.getByText("Antonio")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /\+1 \(478\) 412-5213/ })).toHaveAttribute(
      "href",
      "tel:+1 (478) 412-5213"
    );
    expect(screen.getByRole("link", { name: /\+1 \(832\) 299-5129/ })).toHaveAttribute(
      "href",
      "tel:+1 (832) 299-5129"
    );
  });

  it("sin imagenUrl, muestra el ícono de respaldo en vez de una imagen", () => {
    const aliado = crearAliado({ id: "a4", servicio: "Nuevo Aliado", imagenUrl: null });

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("con imagenUrl, muestra la imagen en vez del ícono de respaldo", () => {
    const aliado = crearAliado({
      id: "a6",
      servicio: "Aliado Con Foto",
      imagenUrl: "https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/prueba.jpeg",
    });

    render(<AliadosGrid aliados={[aliado]} />);

    expect(screen.getByRole("img", { name: "Aliado Con Foto" })).toBeInTheDocument();
  });

  it("cuando faltan líneas de teléfono/correo para un contacto, no renderiza un link vacío", () => {
    const aliado = crearAliado({
      id: "a5",
      servicio: "Aliado Incompleto",
      contactoNombre: "Primero\nSegundo",
      // Solo una línea de teléfono para dos contactos: al segundo le falta.
      contactoTelefono: "+1 (111) 111-1111",
      contactoCorreo: "primero@prueba.com\nsegundo@prueba.com",
    });

    render(<AliadosGrid aliados={[aliado]} />);

    // Solo debe existir un link tel: (el del primer contacto) y dos links mailto:.
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links.every((link) => link.textContent && link.textContent.trim() !== "")).toBe(true);
    expect(screen.getByRole("link", { name: /\+1 \(111\) 111-1111/ })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Correr los tests y verificar que fallan**

Run: `npx vitest run components/estudiante/aliados/AliadosGrid.test.tsx`
Expected: FAIL — `AliadosGrid` actual no tiene lista maestro, panel de
detalle, `aria-current`, ni usa `imagenUrl`/ícono condicional.

- [ ] **Step 3: Implementar el nuevo `AliadosGrid.tsx`**

Reemplazar el contenido completo de
`components/estudiante/aliados/AliadosGrid.tsx`:

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Mail, Phone } from "lucide-react";
import type { Aliado } from "@/lib/db/aliados.types";
import { parsearContactos } from "@/lib/db/aliados.types";
import { blurFadeUp, staggerContainer, useReducedMotionSafe } from "@/lib/motion";

export function AliadosGrid({ aliados }: { aliados: Aliado[] }) {
  const [seleccionadoId, setSeleccionadoId] = useState(aliados[0]?.id);
  const reducedMotion = useReducedMotionSafe();
  const seleccionado = aliados.find((a) => a.id === seleccionadoId) ?? aliados[0];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer(0.08)}
      className="flex flex-col gap-10"
    >
      <motion.div variants={blurFadeUp}>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Aliados Estratégicos del Equipo
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Contactos y aliados que trabajan con el Team Wilmar & Samuel.
        </p>
      </motion.div>

      <motion.div
        variants={blurFadeUp}
        className="flex flex-col gap-8 lg:flex-row"
      >
        {/* Lista maestro */}
        <div className="flex shrink-0 flex-row gap-2 overflow-x-auto lg:w-72 lg:flex-col lg:overflow-visible">
          {aliados.map((aliado) => {
            const activo = aliado.id === seleccionado?.id;
            return (
              <button
                key={aliado.id}
                type="button"
                aria-current={activo}
                onClick={() => setSeleccionadoId(aliado.id)}
                className={`shrink-0 rounded-xl border px-5 py-4 text-left font-display font-semibold transition-colors duration-200 ${
                  activo
                    ? "border-gold-500/30 bg-gold-500/10 text-gold-200"
                    : "border-white/[0.06] bg-white/[0.02] text-white hover:border-white/15"
                }`}
              >
                {aliado.servicio}
              </button>
            );
          })}
        </div>

        {/* Panel de detalle */}
        <div className="min-w-0 flex-1 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8">
          <AnimatePresence mode="wait">
            {seleccionado && (
              <motion.div
                key={seleccionado.id}
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reducedMotion ? undefined : { opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-4">
                  {seleccionado.imagenUrl ? (
                    <Image
                      src={seleccionado.imagenUrl}
                      alt={seleccionado.servicio}
                      width={56}
                      height={56}
                      className="h-14 w-14 shrink-0 rounded-full border border-white/10 object-cover"
                    />
                  ) : (
                    <span
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-gold-500/20 bg-gold-500/10 text-gold-300"
                      aria-hidden="true"
                    >
                      <Building2 className="h-6 w-6" />
                    </span>
                  )}
                  <h2 className="font-display text-xl font-bold text-white">
                    {seleccionado.servicio}
                  </h2>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-mist-300">
                  {seleccionado.descripcion}
                </p>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/[0.06] pt-5">
                  {parsearContactos(seleccionado).map((contacto, indice) => (
                    <div
                      key={`${contacto.nombre}-${indice}`}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm"
                    >
                      {parsearContactos(seleccionado).length > 1 && (
                        <span className="font-medium text-mist-300">{contacto.nombre}</span>
                      )}
                      {contacto.telefono && (
                        <a
                          href={`tel:${contacto.telefono}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.telefono}
                        </a>
                      )}
                      {contacto.correo && (
                        <a
                          href={`mailto:${contacto.correo}`}
                          className="inline-flex items-center gap-1.5 text-gold-300 transition hover:text-gold-200"
                        >
                          <Mail className="h-3.5 w-3.5" aria-hidden="true" />
                          {contacto.correo}
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
```

- [ ] **Step 4: Eliminar `AliadoCard.tsx` y `AliadoCard.test.tsx`**

```bash
rm components/estudiante/aliados/AliadoCard.tsx
rm components/estudiante/aliados/AliadoCard.test.tsx
```

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/aliados/`
Expected: PASS — todos los tests de `AliadosGrid.test.tsx` (8 tests).
Confirmar que no queden referencias rotas a `AliadoCard` en ningún otro
archivo:

Run: `grep -rn "AliadoCard" --include="*.tsx" --include="*.ts" .`
Expected: sin resultados (o solo coincidencias dentro de
`node_modules`/`.next`, que se ignoran).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add components/estudiante/aliados/
git commit -m "feat(aliados): layout maestro-detalle en vez de grilla de tarjetas"
```

---

### Task 2: Proyectos Inmobiliarios Aliados — showcase horizontal

**Files:**
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
- Modify: `components/estudiante/proyectos-aliados/ProyectoCard.tsx`

- [ ] **Step 1: Escribir los tests que fallan para las flechas de navegación**

Agregar a
`components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`,
dentro del `describe("ProyectosAliadosGrid", ...)` existente (después
del último test):

```tsx
  it("tiene botones de navegación con su aria-label", () => {
    render(<ProyectosAliadosGrid proyectos={PROYECTOS} />);

    expect(screen.getByRole("button", { name: "Proyecto anterior" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Proyecto siguiente" })).toBeInTheDocument();
  });
```

- [ ] **Step 2: Correr los tests y verificar que falla el nuevo**

Run: `npx vitest run components/estudiante/proyectos-aliados/ProyectosAliadosGrid.test.tsx`
Expected: el test nuevo FALLA (los botones no existen todavía); los 4
tests existentes siguen pasando (no se tocan, el componente actual sigue
renderizando ambos proyectos simultáneamente).

- [ ] **Step 3: Implementar el nuevo `ProyectosAliadosGrid.tsx`**

Reemplazar el contenido completo de
`components/estudiante/proyectos-aliados/ProyectosAliadosGrid.tsx`:

```tsx
"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProyectoAliado } from "@/lib/db/proyectos-aliados.types";
import { staggerContainer, blurFadeUp, useReducedMotionSafe } from "@/lib/motion";
import { ProyectoCard } from "./ProyectoCard";

const SCROLL_AMOUNT_PX = 400;

export function ProyectosAliadosGrid({ proyectos }: { proyectos: ProyectoAliado[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  function desplazar(direccion: 1 | -1) {
    scrollRef.current?.scrollBy({
      left: SCROLL_AMOUNT_PX * direccion,
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
          className="flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4"
        >
          {proyectos.map((proyecto) => (
            <ProyectoCard key={proyecto.id} proyecto={proyecto} />
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

- [ ] **Step 4: Ajustar las clases de `ProyectoCard.tsx`**

En `components/estudiante/proyectos-aliados/ProyectoCard.tsx`, cambiar
la línea de `className` del `motion.div` raíz (busca
`"group relative h-[440px] overflow-hidden..."`):

```tsx
// antes:
className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"

// después:
className="group relative h-[440px] w-[320px] shrink-0 snap-center overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950 sm:w-[380px]"
```

Adicionalmente, eliminar la prop `variants={blurFadeUp}` de ese mismo
`motion.div` (y el import de `blurFadeUp` si queda sin uso en el
archivo) — ya no tiene efecto útil dentro de un contenedor de scroll
horizontal (la entrada de todo el showcase se anima como una sola
unidad desde `ProyectosAliadosGrid.tsx`, no tarjeta por tarjeta). El
resto del archivo (imagen, degradado, badge de precio, footer con
WhatsApp) no cambia.

- [ ] **Step 5: Correr los tests y verificar que pasan**

Run: `npx vitest run components/estudiante/proyectos-aliados/`
Expected: PASS — los 4 tests existentes de
`ProyectosAliadosGrid.test.tsx` más el nuevo (5 en total).

- [ ] **Step 6: Typecheck**

Run: `npx tsc --noEmit`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add components/estudiante/proyectos-aliados/
git commit -m "feat(proyectos-aliados): showcase de scroll horizontal en vez de grilla"
```

---

### Task 3: Verificación manual en navegador

**Files:** ninguno (solo verificación, salvo fixes que surjan).

- [ ] **Step 1: Levantar un entorno de verificación**

Mismo patrón usado en ciclos anteriores: `.env.local` con credenciales
de Supabase placeholder, `npm run dev`, y una ruta temporal
`app/(public)/preview-aliados-proyectos-tmp/page.tsx` que renderiza
`<AliadosGrid aliados={...datos mock, 3+ aliados...} />` y
`<ProyectosAliadosGrid proyectos={...datos mock, 5+ proyectos, algunos
con imagenUrl real de Unsplash y otros sin...} />` directamente (evita
depender de una conexión real a Supabase). Recordar agregar
`images.unsplash.com` a `next.config.ts` temporalmente si se usan
imágenes de Unsplash en los datos mock (revertir en el Step 6).

- [ ] **Step 2: Verificar el maestro-detalle de Aliados**

Con Playwright: confirmar que el primer aliado se muestra seleccionado
al cargar, que hacer click en otro ítem de la lista cambia el contenido
del panel de detalle con una transición suave (no un salto brusco), que
`aria-current` se actualiza correctamente, y que navegar con Tab +
Enter/Espacio también permite seleccionar un aliado distinto (sin mouse).

- [ ] **Step 3: Verificar el showcase de Proyectos**

Confirmar que las tarjetas se deslizan horizontalmente con scroll-snap
(arrastre táctil/trackpad), que las flechas ◀ ▶ avanzan/retroceden una
tarjeta aproximadamente por click, y que en viewport mobile (<640px) las
flechas están ocultas (el scroll táctil nativo es el mecanismo
principal ahí).

- [ ] **Step 4: Verificar accesibilidad y overflow**

Con `page.emulateMedia({ reducedMotion: "reduce" })`: confirmar que la
transición del panel de detalle de Aliados no anima (cambia de
inmediato) y que el scroll de las flechas de Proyectos es instantáneo
(no suave). Confirmar con
`document.documentElement.scrollWidth`/`clientWidth` en 375/768/1024/1440px
que el scroll horizontal del showcase de Proyectos queda contenido
dentro de su propio contenedor y no genera overflow a nivel de página.

- [ ] **Step 5: Verificar que las tarjetas ahora sí animan al montar**

Confirmar (recarga de página) que el showcase de Proyectos y el panel
maestro-detalle de Aliados tienen una entrada visible (fade+blur) al
cargar la página, corrigiendo el bug de animación faltante descrito en
el spec — antes de este ciclo, las tarjetas no tenían ninguna animación
de entrada.

- [ ] **Step 6: Limpiar artefactos temporales**

Eliminar `.env.local`, la ruta de preview temporal, scripts de
verificación, `dev.log`, y revertir cualquier diff accidental en
`next.config.ts`/`package-lock.json`. Confirmar `git status` limpio
salvo los cambios de código reales del ciclo.

- [ ] **Step 7: Suite completa, typecheck, y build de producción finales**

Run: `npx vitest run`
Expected: mismos resultados que en `main` antes de este ciclo (incluyendo
el flake conocido y ya documentado de
`app/(estudiante)/dashboard/page.test.tsx` "muestra el encabezado de
bienvenida" al correr la suite completa — pasa en aislamiento).

Run: `npx tsc --noEmit`
Expected: sin errores.

Run: `npm run build`
Expected: build exitoso — este paso es obligatorio en este proyecto
desde que un ciclo anterior rompió el build de producción en Vercel de
una forma que `next dev`/`vitest`/`tsc` no detectaban (un Server
Component importando `lib/motion.ts`, que mezcla data pura con hooks de
cliente). Confirmar específicamente que ninguno de los archivos tocados
en este ciclo es un Server Component importando algo de `lib/motion.ts`
directamente (no debería serlo — `AliadosGrid.tsx` y
`ProyectosAliadosGrid.tsx` ya son `"use client"`).

- [ ] **Step 8: Commit de cualquier fix encontrado durante la verificación**

Si la verificación manual revela ajustes necesarios, corregir y
commitear con un mensaje descriptivo del hallazgo. Si no se encontró
nada que corregir, este paso se omite.

---

## Self-review notes

- **Spec coverage:** layout maestro-detalle de Aliados con transición
  animada (Task 1), showcase horizontal de Proyectos con flechas de
  navegación (Task 2), corrección del bug de animación faltante en
  ambos (Tasks 1-2, ya que se reescriben de todas formas), accesibilidad
  (`aria-current`, botones reales, reduced motion) — todo cubierto.
- **Corrección encontrada durante la escritura de este plan:** el spec
  afirmaba que el test existente `AliadosGrid.test.tsx` ("renderiza una
  tarjeta por cada aliado") seguiría pasando sin cambios. Al escribir
  este plan se detectó que es incorrecto: como el primer aliado de
  prueba ("Tributaria LLC") queda seleccionado por defecto, su nombre
  aparece DOS veces (botón de la lista + título del panel de detalle),
  y `screen.getByText("Tributaria LLC")` lanzaría un error por
  encontrar múltiples coincidencias. El Task 1 de este plan corrige
  esto usando `getAllByText(...).toHaveLength(2)` para ese caso
  específico. `ProyectosAliadosGrid.test.tsx` no tiene este problema
  (todas las tarjetas se siguen renderizando simultáneamente, ninguna
  queda "seleccionada" de forma exclusiva).
- **Fuera de alcance confirmado sin tocar:** modelo de datos, páginas de
  admin, cualquier otra página de la plataforma, nuevas dependencias.
- **Consistencia de tipos:** `AliadosGrid`/`ProyectosAliadosGrid`
  mantienen exactamente la misma firma de props que hoy
  (`{ aliados: Aliado[] }` / `{ proyectos: ProyectoAliado[] }`), así que
  `page.tsx` de ambas rutas no necesita ningún cambio.
