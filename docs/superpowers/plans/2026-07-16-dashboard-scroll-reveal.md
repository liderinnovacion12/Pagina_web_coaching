# Dashboard Scroll Reveal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the welcome page (`/dashboard`)'s 10 sections reveal
individually as the user scrolls to them (instead of all animating together
on page load), with the "Team Leaders" section as a more prominent moment
via a per-card image parallax — translating alkares.com's scroll-transition
feel into a minimalist, dependency-free mechanism.

**Architecture:** Replace `DashboardContent.tsx`'s single page-load-triggered
stagger wrapper with per-section `whileInView` triggers, reusing
`SCROLL_REVEAL_VIEWPORT` (already defined in `lib/motion.ts`, currently
unused anywhere in the codebase) and the existing `cardVariants`/
`containerVariants` transform family — no new visual language, just a new
trigger mechanism. The Team Leaders cards move into their own component
(`TeamLeaderCard`) so each can independently track its own scroll progress
via `useScroll`/`useTransform` (the same technique already used in
`HeroScrollLayer`) and apply a subtle parallax to its photo, plus a bigger
entrance variant for extra "weight". Also removes the "4 min" duration badge
from the video section (decorative metadata with no value, per user
feedback).

**Tech Stack:** Next.js 15 (App Router), React 19, Framer Motion 12
(`useScroll`, `useTransform`, `motion.div`, `whileInView` — all already used
elsewhere in this codebase), Vitest + Testing Library.

**Reference spec:** `docs/superpowers/specs/2026-07-16-fase-b-bienvenida-scroll-reveal-design.md`

---

### Task 1: Create `TeamLeaderCard`

**Files:**
- Create: `components/estudiante/dashboard/TeamLeaderCard.tsx`
- Test: `components/estudiante/dashboard/TeamLeaderCard.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `components/estudiante/dashboard/TeamLeaderCard.test.tsx`:

```tsx
import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { TeamLeaderCard } from "./TeamLeaderCard";
import type { MiembroEquipo } from "@/lib/db/equipo";

const useReducedMotionSafeMock = vi.fn().mockReturnValue(false);

vi.mock("@/lib/motion", async () => {
  const actual =
    await vi.importActual<typeof import("@/lib/motion")>("@/lib/motion");
  return {
    ...actual,
    useReducedMotionSafe: () => useReducedMotionSafeMock(),
  };
});

const miembro: MiembroEquipo = {
  id: "m1",
  nombre: "Wilmar Sosa",
  cargo: "Ventas y Liderazgo",
  descripcionCargo: "Agente inmobiliario, top producer y coach en liderazgo.",
  telefono: "+10000000000",
  correo: "wilmar@example.com",
  fotoUrl: "/images/cultura/wilmar-sosa.jpg",
};

describe("TeamLeaderCard", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renderiza nombre, cargo y telefono clicable", () => {
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);

    expect(
      screen.getByRole("heading", { name: "Wilmar Sosa" })
    ).toBeInTheDocument();
    expect(screen.getByText("Ventas y Liderazgo")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "+10000000000" })).toHaveAttribute(
      "href",
      "tel:+10000000000"
    );
  });

  it("renderiza la foto con el alt correcto", () => {
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);
    expect(screen.getByAltText("Wilmar Sosa")).toBeInTheDocument();
  });

  it("no rompe el render cuando el usuario prefiere reduced motion", () => {
    useReducedMotionSafeMock.mockReturnValue(true);
    render(<TeamLeaderCard miembro={miembro} variants={{}} />);
    expect(
      screen.getByRole("heading", { name: "Wilmar Sosa" })
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run "components/estudiante/dashboard/TeamLeaderCard.test.tsx"`
Expected: FAIL — cannot find module `./TeamLeaderCard` (file doesn't exist yet).

- [ ] **Step 3: Write minimal implementation**

Create `components/estudiante/dashboard/TeamLeaderCard.tsx`. This is an
extraction of the card markup currently inline in `DashboardContent.tsx`
(the `.map()` inside "6. Team Leaders"), unchanged visually, plus a new
`useScroll`/`useTransform` parallax on the photo:

```tsx
"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { ArrowRight } from "lucide-react";
import type { MiembroEquipo } from "@/lib/db/equipo";
import { useReducedMotionSafe } from "@/lib/motion";

export function TeamLeaderCard({
  miembro,
  variants,
}: {
  miembro: MiembroEquipo;
  variants: Variants;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotionSafe();

  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ["start end", "end start"],
  });
  const parallaxYRaw = useTransform(scrollYProgress, [0, 1], [-16, 16]);
  const parallaxY = reducedMotion ? 0 : parallaxYRaw;

  return (
    <motion.div
      ref={cardRef}
      variants={variants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
    >
      {miembro.fotoUrl ? (
        <motion.div
          style={{ y: parallaxY }}
          className="absolute -inset-y-6 inset-x-0"
        >
          <Image
            src={miembro.fotoUrl}
            alt={miembro.nombre}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover object-top opacity-70 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-90"
          />
        </motion.div>
      ) : (
        <div className="absolute inset-0 bg-ink-900" aria-hidden="true" />
      )}
      {/* Degradado premium para que no se pierda el texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/60 to-transparent transition-opacity duration-300 group-hover:via-ink-950/50" />

      <div className="absolute inset-x-0 bottom-0 p-8">
        <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-gold-400">
          {miembro.cargo}
        </span>
        <h3 className="mt-1.5 font-display text-2xl font-bold text-white">
          {miembro.nombre}
        </h3>
        <p className="mt-2.5 text-sm leading-relaxed text-mist-300">
          {miembro.descripcionCargo}
        </p>
        <a
          href={`tel:${miembro.telefono}`}
          className="mt-4.5 inline-flex items-center gap-1.5 text-sm font-semibold text-gold-300 transition duration-200 hover:text-gold-200"
        >
          <span className="underline decoration-gold-500/40 hover:decoration-gold-400">
            {miembro.telefono}
          </span>
          <ArrowRight className="h-3 w-3" />
        </a>
      </div>
    </motion.div>
  );
}
```

Notes on the parallax markup: the photo wrapper is `-inset-y-6 inset-x-0`
(24px taller than the card on each side) so the ±16px vertical movement
never reveals empty space at the top/bottom edges — the card's own
`overflow-hidden` clips the excess.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run "components/estudiante/dashboard/TeamLeaderCard.test.tsx"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "components/estudiante/dashboard/TeamLeaderCard.tsx" "components/estudiante/dashboard/TeamLeaderCard.test.tsx"
git commit -m "feat(dashboard): agrega TeamLeaderCard con parallax de foto"
```

---

### Task 2: Convert `DashboardContent` to per-section scroll reveal

**Files:**
- Modify: `app/(estudiante)/dashboard/DashboardContent.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of
`app/(estudiante)/dashboard/DashboardContent.tsx` with:

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Eye,
  Heart,
  Image as ImageIcon,
  Lightbulb,
  MessageCircle,
  Target,
  Users,
} from "lucide-react";
import type { MiembroEquipo } from "@/lib/db/equipo";
import type { FotoGaleria } from "@/lib/db/galeria";
import { SCROLL_REVEAL_VIEWPORT } from "@/lib/motion";
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
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const cardVariants = {
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
const teamLeaderCardVariants = {
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
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
        className="relative"
      >
        <h1 className="font-display text-[46px] font-bold leading-tight tracking-tight text-white sm:text-[54px]">
          Bienvenido a <span className="text-gradient-gold">Team 100% Real Estate</span>
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
        <div className="absolute -left-4 top-1/2 h-16 w-1 -translate-y-1/2 rounded-r-md bg-gold-500/80" />
      </motion.div>

      {/* 2. Video de Bienvenida */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
        className="group relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.04] to-transparent p-5 sm:p-7 transition-all duration-300 hover:border-gold-500/20 hover:shadow-[0_0_50px_rgba(217,169,78,0.05)]"
      >
        <div className="flex items-center gap-2 px-1 pb-4">
          <span className="flex h-2 w-2 rounded-full bg-gold-400 animate-pulse" />
          <p className="font-mono text-xs uppercase tracking-wider text-mist-400">
            Video de inducción
          </p>
        </div>
        <div className="relative aspect-video overflow-hidden rounded-xl border border-white/[0.08] bg-ink-950 shadow-2xl">
          <iframe
            src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
            title="Video de bienvenida — Team 100% Real Estate"
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full opacity-90 transition-opacity duration-300 group-hover:opacity-100"
          />
        </div>
      </motion.div>

      {/* 3. Banner de Comunidad WhatsApp */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
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
      </motion.div>

      {/* 4. Dos Columnas: Inducción & Accesos */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={containerVariants}
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
      </motion.div>

      {/* Separador de Sección */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
        className="my-2 border-t border-white/[0.06]"
      />

      {/* 5. Cabecera Cultura */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
      >
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cultura y Equipo
        </h2>
        <p className="mt-2.5 text-lg text-mist-400">
          Conoce a los líderes y los principios que nos guían.
        </p>
      </motion.div>

      {/* 6. Team Leaders */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={cardVariants}
          className="flex items-center gap-2.5 px-1"
        >
          <Users className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Team Leaders</h3>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={containerVariants}
          className="grid gap-6 sm:grid-cols-2"
        >
          {miembrosEquipo.map((miembro) => (
            <TeamLeaderCard
              key={miembro.id}
              miembro={miembro}
              variants={teamLeaderCardVariants}
            />
          ))}
        </motion.div>
      </div>

      {/* 7. Misión & Visión */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={containerVariants}
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
      </motion.div>

      {/* 8. Nuestros Valores */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={cardVariants}
          className="flex items-center gap-2.5 px-1"
        >
          <Heart className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Nuestros Valores</h3>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={containerVariants}
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
        </motion.div>
      </div>

      {/* 9. Filosofía de Equipo */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={SCROLL_REVEAL_VIEWPORT}
        variants={cardVariants}
        className="relative overflow-hidden rounded-[24px] border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-8 sm:p-10 transition-all duration-300 hover:border-gold-500/25"
      >
        {/* Adorno visual */}
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-gold-500/5 blur-[50px] -z-10" />

        <Lightbulb className="h-6 w-6 text-gold-400" aria-hidden="true" />
        <h2 className="mt-3.5 font-display text-2xl font-bold text-white">
          Filosofía de Equipo
        </h2>
        <p className="mt-3.5 text-base leading-relaxed text-mist-300">
          Creemos firmemente en el trabajo en equipo, la transformación continua y la dedicación
          diaria. Somos una comunidad colaborativa donde nos apoyamos unos a otros, compartimos
          conocimiento y buscamos crecer juntos.
        </p>
        <div className="mt-5 border-l-2 border-gold-500/60 pl-4">
          <p className="text-base font-semibold text-white">
            Aquí no estamos solo para recibir información. Estamos para dar, aportar y sumar valor al equipo.
          </p>
        </div>
      </motion.div>

      {/* 10. Galería de Equipo */}
      <div className="flex flex-col gap-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={cardVariants}
          className="flex items-center gap-2.5 px-1"
        >
          <ImageIcon className="h-5 w-5 text-gold-400" aria-hidden="true" />
          <h3 className="font-display text-xl font-bold text-white">Galería del Equipo</h3>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={SCROLL_REVEAL_VIEWPORT}
          variants={containerVariants}
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
        </motion.div>
      </div>
    </div>
  );
}
```

Summary of what changed vs. the current file:
- Removed the outer `motion.div` (with `containerVariants` +
  `initial="hidden" animate="visible"`) wrapping the whole page — replaced
  with a plain `<div className="flex flex-col gap-12">`.
- Every section (and every grid wrapper that used to just be a plain `<div
  className="grid ...">`) is now its own `motion.div` with `initial="hidden"
  whileInView="visible" viewport={SCROLL_REVEAL_VIEWPORT}` — grids use
  `variants={containerVariants}` (to keep their internal stagger), single
  blocks use `variants={cardVariants}` directly.
- Added `teamLeaderCardVariants` and imported `SCROLL_REVEAL_VIEWPORT` +
  `TeamLeaderCard`.
- The Team Leaders `.map()` now renders `<TeamLeaderCard>` instead of the
  inline card markup.
- Removed the `4 min` badge and the now-unnecessary `justify-between` wrapper
  in the Video de Bienvenida section (was `<div className="flex items-center
  justify-between px-1 pb-4">` with two children; now `<div className="flex
  items-center gap-2 px-1 pb-4">` with just the left content).
- No other text, class, or prop changed.

- [ ] **Step 2: Run the dashboard page test to verify no regression**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS (10 tests — none of them assert on animation state, only on
content presence/attributes, so `whileInView` vs `animate` as the trigger
doesn't affect them; the removed `4 min` badge isn't asserted by any
existing test either).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "feat(dashboard): revela las secciones por scroll en vez de al cargar"
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
isolation to confirm it's that known flake, not a real regression).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (if run from a nested git worktree under the main
repo directory, this may fail with an unrelated `@next/next` plugin
config-conflict error — that's a pre-existing worktree-location artifact,
not a code issue; if that happens, rerun `npm run lint` from a plain
checkout to get a real signal before concluding lint is clean).

- [ ] **Step 3: Manual verification in the browser**

Start the dev server (`npm run dev`) with valid Supabase credentials in
`.env.local`, or use a temporary preview route bypassing data fetching (same
technique used for the hero-scroll-parallax feature) if no credentials are
available in this environment.

- Visit `/dashboard`: scroll slowly from top to bottom. Confirm each section
  reveals (fade + slide + un-blur) as it enters the viewport, not all at
  once on page load.
- Confirm the Team Leaders section feels more prominent than the rest
  (larger movement/blur on entrance) and that each team leader's photo has a
  subtle parallax shift as its card crosses the viewport, with no visible
  gaps at the top/bottom edges of the photo.
- Confirm the "4 min" badge is gone from the Video de Bienvenida section,
  and the "Video de inducción" label + pulsing dot still look correct
  without it.
- Scroll back up: sections should stay visible (this is a one-shot reveal,
  `SCROLL_REVEAL_VIEWPORT` uses `once: true` — they should not disappear and
  re-animate).
- Toggle `prefers-reduced-motion: reduce` in DevTools and reload: confirm
  all sections are visible immediately (no scroll-triggered animation) and
  the Team Leaders photos have no parallax movement.

- [ ] **Step 4: Final commit (only if Steps 1-2 required fixes)**

If the full suite or lint required any fix, commit it separately:

```bash
git add -A
git commit -m "fix(dashboard): ajustes tras verificacion de scroll reveal"
```

If no fixes were needed, skip this step — Tasks 1-2 already committed
everything.

---

## Self-review notes

- **Spec coverage:** per-section `whileInView` reveal using
  `SCROLL_REVEAL_VIEWPORT` (Task 2) for all 10 sections, `TeamLeaderCard`
  extraction with its own `useScroll`/`useTransform` parallax (Task 1),
  Team Leaders "protagonista" variant with bigger offset/duration (Task 2,
  `teamLeaderCardVariants`), reduced-motion handling in both the section
  reveals (inherited from existing global `prefers-reduced-motion` CSS
  support, unchanged) and the per-card parallax (Task 1, explicit
  `useReducedMotionSafe` check), removal of the `4 min` badge (Task 2) — all
  covered.
- **Out of scope confirmed not touched:** no pin/scroll-jacking, no GSAP/
  Lenis, no content/copy changes beyond the badge removal, no changes to any
  other Fase A page, no reordering of the 10 sections.
- **Type consistency:** `TeamLeaderCard`'s `variants: Variants` prop (Task
  1) is satisfied by `teamLeaderCardVariants` (Task 2, same shape as the
  existing `cardVariants` object already used elsewhere in the file) — no
  mismatch.
