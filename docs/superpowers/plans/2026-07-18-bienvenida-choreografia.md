# Bienvenida Choreography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the video's box/frame, make the welcome page's sections
animate both in AND out as the user scrolls (not just reveal-once), give
each of the 5 section headers its own entrance direction and its own
decorative treatment (a numbered index or a repositioned, oversized,
low-opacity icon — never a small icon glued next to the title text).

**Architecture:** `ScrollReveal` (already shipped) gets an optional `once`
prop so callers can opt into "hide again when scrolled past" instead of the
current "reveal once and stay" behavior. `DashboardContent.tsx` defines 3
new entrance variants (`revealLeft`, `revealRight`, `revealScale`) alongside
the existing `cardVariants`-shaped `revealUp`, assigns one to each of the 5
titled headers (no repeats back-to-back), passes `once={false}` to all 14
`ScrollReveal` usages, strips the video's wrapping card/frame markup, and
replaces each header's small inline icon with a much larger, repositioned,
low-opacity version (or a numeric index) per the design spec.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12 (`useInView`,
`animate`, `variants` — all already used in this codebase), Vitest +
Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-07-18-bienvenida-choreografia-design.md`

---

### Task 1: `ScrollReveal` learns to hide again (`once` prop)

**Files:**
- Modify: `components/motion/ScrollReveal.tsx`
- Modify: `components/motion/ScrollReveal.test.tsx`

- [ ] **Step 1: Write the failing tests**

Replace the entire contents of `components/motion/ScrollReveal.test.tsx`
with:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollReveal } from "./ScrollReveal";

const useInViewMock = vi.fn().mockReturnValue(true);

vi.mock("framer-motion", async () => {
  const actual =
    await vi.importActual<typeof import("framer-motion")>("framer-motion");
  return {
    ...actual,
    useInView: (...args: unknown[]) => useInViewMock(...args),
  };
});

describe("ScrollReveal", () => {
  afterEach(() => {
    useInViewMock.mockClear();
  });

  it("renderiza sus children", () => {
    render(
      <ScrollReveal variants={{}}>
        <p>Contenido de prueba</p>
      </ScrollReveal>
    );
    expect(screen.getByText("Contenido de prueba")).toBeInTheDocument();
  });

  it("aplica el className recibido al contenedor", () => {
    const { container } = render(
      <ScrollReveal variants={{}} className="grid gap-6">
        <span>x</span>
      </ScrollReveal>
    );
    expect(container.firstElementChild).toHaveClass("grid", "gap-6");
  });

  it("no requiere children (uso decorativo, ej. un separador)", () => {
    const { container } = render(
      <ScrollReveal variants={{}} className="my-2 border-t" />
    );
    expect(container.firstElementChild).toHaveClass("my-2", "border-t");
  });

  it("usa once=true por defecto cuando no se especifica", () => {
    render(
      <ScrollReveal variants={{}}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ once: true })
    );
  });

  it("pasa once=false a useInView cuando se especifica", () => {
    render(
      <ScrollReveal variants={{}} once={false}>
        <p>x</p>
      </ScrollReveal>
    );
    expect(useInViewMock).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ once: false })
    );
  });
});
```

- [ ] **Step 2: Run tests to verify the new ones fail**

Run: `npx vitest run "components/motion/ScrollReveal.test.tsx"`
Expected: the 3 pre-existing tests PASS, the 2 new `once`-related tests FAIL
(current implementation doesn't accept/forward a `once` prop, so
`useInViewMock` gets called with the hardcoded `SCROLL_REVEAL_VIEWPORT`
object, whose `once` is always `true` — the `once={false}` test will fail).

- [ ] **Step 3: Add the `once` prop to `ScrollReveal`**

Replace the entire contents of `components/motion/ScrollReveal.tsx` with:

```tsx
"use client";

import { useRef, type ReactNode } from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { SCROLL_REVEAL_VIEWPORT } from "@/lib/motion";

export function ScrollReveal({
  variants,
  className,
  children,
  once = true,
}: {
  variants: Variants;
  className?: string;
  children?: ReactNode;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { ...SCROLL_REVEAL_VIEWPORT, once });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
}
```

- [ ] **Step 4: Run tests to verify they all pass**

Run: `npx vitest run "components/motion/ScrollReveal.test.tsx"`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add "components/motion/ScrollReveal.tsx" "components/motion/ScrollReveal.test.tsx"
git commit -m "feat(motion): ScrollReveal soporta once=false para animar tambien al salir"
```

---

### Task 2: Rewrite `DashboardContent.tsx` — choreography, headers, video

**Files:**
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of
`app/(estudiante)/dashboard/DashboardContent.tsx` with:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, type Variants } from "framer-motion";
import {
  ArrowRight,
  Check,
  Eye,
  Lightbulb,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";
import { ScrollReveal } from "@/components/motion/ScrollReveal";
import { TeamLeaderCard } from "@/components/estudiante/dashboard/TeamLeaderCard";

const PASOS_USO = [
  "Usa el menú lateral para navegar entre módulos.",
  "Revisa el calendario de clases y eventos.",
  "Descarga los recursos disponibles.",
  "Contacta a soporte si tienes dudas.",
];

const ACCESOS_RAPIDOS = [
  { label: "Grupos de WhatsApp", href: "/herramientas" },
  { label: "Calendario de Clases", href: "/calendario" },
  { label: "Recursos de Ventas", href: "/marketing" },
  { label: "Soporte", href: "/soporte" },
];

const VALORES = [
  {
    nombre: "Integridad",
    descripcion: "Actuamos con honestidad y transparencia en cada transacción.",
  },
  {
    nombre: "Compromiso",
    descripcion: "Cumplimos nuestras promesas con clientes y compañeros.",
  },
  {
    nombre: "Colaboración",
    descripcion: "El éxito de uno es el éxito de todos.",
  },
  {
    nombre: "Excelencia",
    descripcion: "Buscamos la mejora continua en todo lo que hacemos.",
  },
];

// Contenedor de grilla con stagger para los hijos, disparado cuando la
// grilla entra en el viewport (no al montar la página).
const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as const, // Ease Out Quad/Quart premium
    },
  },
};

// Variant "protagonista" para Team Leaders: más recorrido, más blur, más
// duración que cardVariants — se siente más pesada al revelarse.
const teamLeaderCardVariants: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.9,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
};

// ── Coreografía de encabezados: 4 direcciones de entrada/salida ──────────
const EASE = [0.16, 1, 0.3, 1] as const;

const revealUp: Variants = {
  hidden: { opacity: 0, y: 25, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const revealLeft: Variants = {
  hidden: { opacity: 0, x: -40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const revealRight: Variants = {
  hidden: { opacity: 0, x: 40, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

const revealScale: Variants = {
  hidden: { opacity: 0, scale: 0.92, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    scale: 1,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
  },
};

interface DashboardContentProps {
  miembrosEquipo: MiembroEquipo[];
  galeriaEquipo: FotoGaleria[];
}

export function DashboardContent({
  miembrosEquipo,
  galeriaEquipo,
}: DashboardContentProps) {
  return (
    <div className="flex flex-col gap-12">
      {/* 1. Cabecera Principal */}
      <ScrollReveal variants={revealUp} once={false} className="relative">
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </ScrollReveal>

      {/* 2. Video de Bienvenida (sin marco) */}
      <ScrollReveal variants={revealUp} once={false}>
        <div className="flex items-center gap-2 px-1 pb-4">
          <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-wider text-mist-400">
            Video de inducción
          </p>
        </div>
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

      {/* 3. Banner de Comunidad WhatsApp */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-r from-whatsapp/10 via-transparent to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-whatsapp/30 hover:shadow-[0_0_40px_rgba(37,211,102,0.05)]"
      >
        {/* Glow de fondo */}
        <div className="absolute right-0 top-0 -z-10 h-72 w-72 rounded-full bg-whatsapp/5 blur-[80px]" />

        <p className="font-mono text-xs uppercase tracking-wider text-whatsapp">
          Comunidad activa
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold text-white sm:text-3xl">
          Únete a la comunidad de Team 100% Real Estate
        </h2>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-mist-300">
          Súmate a los grupos y comunidades de WhatsApp para conectar con otros
          agentes, resolver dudas y enterarte de las próximas clases en vivo de inmediato.
        </p>
        <Link
          href="/herramientas"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-whatsapp px-8 font-semibold text-white transition-all duration-200 hover:scale-[1.02] hover:bg-whatsapp-dark hover:shadow-[0_0_24px_rgba(37,211,102,0.25)] active:scale-[0.98]"
        >
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
          Únete a los Grupos y Comunidades de WhatsApp
        </Link>
      </ScrollReveal>

      {/* 4. Dos Columnas: Inducción & Accesos */}
      <ScrollReveal
        variants={containerVariants}
        once={false}
        className="grid gap-6 sm:grid-cols-2"
      >
        {/* Cómo Usar */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-lg font-bold text-white">
            Cómo Usar la Plataforma
          </h3>
          <ol className="mt-6 flex flex-col gap-5">
            {PASOS_USO.map((paso, indice) => (
              <motion.li
                key={paso}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2 }}
                className="flex gap-4 group"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 font-mono text-xs font-bold text-gold-300 border border-gold-500/20 group-hover:bg-gold-500/20 transition-all duration-200">
                  {indice + 1}
                </span>
                <span className="text-sm leading-relaxed text-mist-300 group-hover:text-white transition-colors duration-200">
                  {paso}
                </span>
              </motion.li>
            ))}
          </ol>
        </motion.div>

        {/* Accesos Rápidos */}
        <motion.div
          variants={cardVariants}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-white/[0.12] hover:bg-white/[0.03]"
        >
          <h3 className="font-display text-lg font-bold text-white">
            Enlaces de Interés
          </h3>
          <ul className="mt-5 flex flex-col gap-1.5">
            {ACCESOS_RAPIDOS.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3.5 text-sm text-mist-300 transition-all duration-200 hover:border-white/5 hover:bg-white/[0.02] hover:text-gold-300"
                >
                  <span className="font-medium">{acceso.label}</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform duration-200 group-hover:translate-x-1 text-mist-500 group-hover:text-gold-300" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </motion.div>
      </ScrollReveal>

      {/* Separador de Sección */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="my-2 border-t border-white/[0.06]"
      />

      {/* 5. Cabecera Cultura */}
      <ScrollReveal variants={revealLeft} once={false} className="relative">
        <span
          aria-hidden="true"
          className="absolute -left-2 -top-6 font-mono text-7xl font-bold text-gold-500/10 sm:text-8xl"
        >
          01
        </span>
        <h2 className="relative font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cultura y Equipo
        </h2>
        <p className="relative mt-2.5 text-lg text-mist-400">
          Conoce a los líderes y los principios que nos guían.
        </p>
      </ScrollReveal>

      {/* 6. Team Leaders */}
      <div className="flex flex-col gap-6">
        <ScrollReveal
          variants={revealScale}
          once={false}
          className="relative flex items-center px-1"
        >
          <Users
            aria-hidden="true"
            className="absolute -left-3 -top-2 h-16 w-16 text-gold-500/10 sm:h-20 sm:w-20"
          />
          <h3 className="relative font-display text-xl font-bold text-white">Team Leaders</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid gap-6 sm:grid-cols-2"
        >
          {miembrosEquipo.map((miembro) => (
            <TeamLeaderCard
              key={miembro.id}
              miembro={miembro}
              variants={teamLeaderCardVariants}
            />
          ))}
        </ScrollReveal>
      </div>

      {/* 7. Misión & Visión */}
      <ScrollReveal
        variants={containerVariants}
        once={false}
        className="grid gap-6 sm:grid-cols-2"
      >
        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300">
            <Target className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4.5 font-display text-xl font-bold text-white">Nuestra Misión</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            Empoderar a cada agente para que alcance su máximo potencial, brindándole las
            herramientas, el acompañamiento y el entorno correcto para crecer de manera
            profesional y personal.
          </p>
        </motion.div>

        <motion.div
          variants={cardVariants}
          whileHover={{ y: -4 }}
          className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8 transition-all duration-300 hover:border-gold-500/20"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-500/10 border border-gold-500/20 text-gold-300">
            <Eye className="h-5 w-5" aria-hidden="true" />
          </div>
          <h3 className="mt-4.5 font-display text-xl font-bold text-white">Nuestra Visión</h3>
          <p className="mt-3 text-sm leading-relaxed text-mist-300">
            Construir un equipo sólido, colaborativo y en constante crecimiento, donde cada
            agente opere su negocio con claridad, estructura y mentalidad de liderazgo.
          </p>
        </motion.div>
      </ScrollReveal>

      {/* 8. Nuestros Valores */}
      <div className="flex flex-col gap-6">
        <ScrollReveal
          variants={revealRight}
          once={false}
          className="relative flex items-center gap-3 px-1"
        >
          <h3 className="font-display text-xl font-bold text-white">Nuestros Valores</h3>
          <span aria-hidden="true" className="font-mono text-4xl font-bold text-gold-500/15">
            02
          </span>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid gap-4 sm:grid-cols-2"
        >
          {VALORES.map((valor) => (
            <motion.div
              key={valor.nombre}
              variants={cardVariants}
              whileHover={{ scale: 1.01 }}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-300 hover:border-white/[0.12]"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 border border-gold-500/20">
                <Check className="h-4.5 w-4.5 text-gold-300" aria-hidden="true" />
              </div>
              <h4 className="mt-3 font-display font-bold text-white">{valor.nombre}</h4>
              <p className="mt-1.5 text-sm leading-relaxed text-mist-300">{valor.descripcion}</p>
            </motion.div>
          ))}
        </ScrollReveal>
      </div>

      {/* 9. Filosofía de Equipo */}
      <ScrollReveal
        variants={revealUp}
        once={false}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-gold-500/25"
      >
        {/* Adorno visual existente */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-500/5 blur-[50px] -z-10" />

        <Lightbulb
          aria-hidden="true"
          className="absolute right-6 top-6 h-20 w-20 text-gold-500/10"
        />
        <h2 className="relative mt-3.5 font-display text-2xl font-bold text-white">
          Filosofía de Equipo
        </h2>
        <p className="relative mt-3.5 text-base leading-relaxed text-mist-300">
          Creemos firmemente en el trabajo en equipo, la transformación continua y la dedicación
          diaria. Somos una comunidad colaborativa donde nos apoyamos unos a otros, compartimos
          conocimiento y buscamos crecer juntos.
        </p>
        <div className="relative mt-5 border-l-2 border-gold-500/60 pl-4">
          <p className="text-base font-semibold text-white">
            Aquí no estamos solo para recibir información. Estamos para dar, aportar y sumar valor al equipo.
          </p>
        </div>
      </ScrollReveal>

      {/* 10. Galería de Equipo */}
      <div className="flex flex-col gap-6">
        <ScrollReveal
          variants={revealLeft}
          once={false}
          className="relative flex flex-col items-center gap-1 px-1 text-center"
        >
          <span aria-hidden="true" className="font-mono text-2xl font-bold text-gold-500/20">
            03
          </span>
          <h3 className="font-display text-xl font-bold text-white">Galería del Equipo</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {galeriaEquipo.map((foto) => (
            <motion.div
              key={foto.id}
              variants={cardVariants}
              whileHover={{ scale: 1.03, y: -2 }}
              transition={{ duration: 0.2 }}
              className="group relative aspect-square overflow-hidden rounded-xl border border-white/[0.06] bg-ink-900 cursor-pointer shadow-lg"
            >
              <Image
                src={foto.url}
                alt="Foto del equipo Team 100% Real Estate"
                fill
                sizes="(min-width: 640px) 25vw, 50vw"
                className="object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </motion.div>
          ))}
        </ScrollReveal>
      </div>
    </div>
  );
}
```

Key differences from the previous version:
- `Heart` and `ImageIcon` are no longer imported from `lucide-react` (no
  longer used — the Valores and Galería headers no longer have an inline
  icon). `Users` and `Lightbulb` are still imported and still used, just
  bigger/repositioned. `Target`, `Eye`, `Check` are unchanged (individual
  card icons, untouched).
- `type Variants` is imported from `framer-motion` alongside `motion`.
- Four new variants (`revealUp`, `revealLeft`, `revealRight`,
  `revealScale`) are defined; `cardVariants`/`containerVariants`/
  `teamLeaderCardVariants` are unchanged in value, only now explicitly
  typed as `Variants`.
- All 14 `ScrollReveal` usages gain `once={false}`.
- The video section (`2. Video de Bienvenida`) loses its outer card
  wrapper's classes entirely and the inner frame's `border`/`bg-ink-950`/
  `shadow-2xl` — only `rounded-xl overflow-hidden` remains on the video's
  own wrapper div. The `group`/hover-opacity behavior on the iframe is
  removed along with the card that drove it.
- The 5 section headers (Cultura y Equipo, Team Leaders, Nuestros Valores,
  Filosofía de Equipo, Galería del Equipo) each get one of the 4 variants
  (see table in the spec) and a redesigned decorative element (numbered
  index or oversized repositioned icon) instead of the old small
  icon-next-to-heading row.

- [ ] **Step 2: Run the dashboard page test to verify no regression**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS (10 tests — none assert on decorative classes, icons, or
animation state).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (confirms `Heart`/`ImageIcon` removal left no orphaned
references, and the new `Variants`-typed constants are compatible with
`ScrollReveal`'s `variants` prop).

- [ ] **Step 4: Commit**

```bash
git add "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "feat(dashboard): coreografia de titulos y video sin marco"
```

---

### Task 3: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests passing (a pre-existing, unrelated flaky test in
`app/(estudiante)/dashboard/page.test.tsx` — "muestra el encabezado de
bienvenida" — is known to occasionally fail only when run as part of the
full suite and pass in isolation; if it's the *only* failure, rerun it in
isolation to confirm it's that known flake before treating the suite as
green).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (if run from a nested git worktree under the main
repo directory, this may fail with an unrelated `@next/next` plugin
config-conflict error — a pre-existing worktree-location artifact; rerun
from a plain checkout to get a real signal if that happens).

- [ ] **Step 3: Manual verification in the browser**

Start the dev server (`npm run dev`) with valid Supabase credentials in
`.env.local`, or use a temporary preview route bypassing data fetching (same
technique used for the previous dashboard verification cycles) if no
credentials are available in this environment.

- Visit `/dashboard` and confirm the video has no border/box/shadow around
  it — it sits directly on the page background.
- Scroll down slowly through all 10 sections: confirm each of the 5 titled
  headers (Cultura y Equipo, Team Leaders, Nuestros Valores, Filosofía de
  Equipo, Galería del Equipo) enters with a visibly different movement
  (left slide, scale-in, right slide, up-fade, left slide again) and that
  none of them show a small icon glued directly next to the heading text —
  instead each shows either a large tenue number or a large tenue
  repositioned icon behind/beside the text.
- Confirm the Galería del Equipo header is centered while the other 4
  headers are left-aligned.
- Scroll back UP past a section that already revealed, then scroll back
  down to it again: confirm it hides and re-reveals (this is the new
  `once={false}` behavior — previously it would have stayed visible
  permanently after the first reveal).
- Toggle `prefers-reduced-motion: reduce` in DevTools and reload: confirm
  everything renders fully visible immediately with no animation, exactly
  as before this change.

- [ ] **Step 4: Final commit (only if Steps 1-2 required fixes)**

If lint or the full suite required any fix, commit it separately:

```bash
git add -A
git commit -m "fix(dashboard): ajustes tras verificacion de coreografia"
```

If no fixes were needed, skip this step — Tasks 1-2 already committed
everything.

---

## Self-review notes

- **Spec coverage:** video frame removal (Task 2), `ScrollReveal`'s `once`
  prop (Task 1), 4 entrance/exit variants distributed across the 5 headers
  per the spec's table with no back-to-back repeats (Task 2), icon-as-bullet
  removal replaced by numbered indices / oversized repositioned icons per
  section (Task 2), centered alignment for Galería vs. left-aligned for the
  other 4 headers (Task 2), accessibility (`aria-hidden` on all decorative
  elements, no DOM removal, reduced-motion unaffected) — all covered.
- **Out of scope confirmed not touched:** no other Fase A/B page, no changes
  to `Target`/`Eye`/`Check` card-level icons, no new dependencies.
- **Type consistency:** `ScrollReveal`'s `once?: boolean` prop (Task 1) is
  used identically at all 14 call sites in `DashboardContent.tsx` (Task 2)
  as `once={false}`; the 4 new `Variants`-typed constants match the
  `variants: Variants` prop `ScrollReveal` already expects — no mismatch.
- **Corrected an internal inconsistency found while writing this plan:**
  the design spec's prose listed "Dos Columnas" as both an example of a
  content block that should use the new `revealUp` variant AND as a grid
  that keeps `containerVariants` for its internal stagger. Since "Dos
  Columnas"'s `ScrollReveal` root has always used `containerVariants` (not
  `cardVariants`) to orchestrate its 2 children, this plan keeps
  `containerVariants` there (only adding `once={false}`) — consistent with
  the same grid-wrapper treatment given to Team Leaders/Misión & Visión/
  Valores/Galería's grid wrappers. This doesn't change anything visually
  from what was demonstrated during brainstorming; it only clarifies which
  named constant applies where.

## Post-implementation addendum

During code review of the executed plan, two real accessibility bugs were
found in `ScrollReveal` (not anticipated by this plan or its spec) and
fixed in two follow-up commits before merge:

1. Hidden/exited content (`once={false}`) stayed focusable and clickable —
   fixed by adding `inert={!isInView}` to `ScrollReveal`'s root element.
2. `ScrollReveal` never checked `prefers-reduced-motion` at all — fixed by
   adding a `useReducedMotionSafe()` check that forces content to be
   immediately visible and non-`inert` regardless of scroll position when
   reduced motion is active.

Both fixes live entirely in `components/motion/ScrollReveal.tsx` (no
changes to `DashboardContent.tsx`). See the "Accesibilidad" section of
`docs/superpowers/specs/2026-07-18-bienvenida-choreografia-design.md` for
full detail, including a documented (non-bug) caveat about focus being
dropped when a focused element's section becomes `inert` mid-scroll.
