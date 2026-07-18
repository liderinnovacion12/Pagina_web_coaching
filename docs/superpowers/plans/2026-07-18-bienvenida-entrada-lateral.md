# Bienvenida Entrada Lateral Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the numbered indices and the video's "Video de inducción"
label, make Team Leader photos taller, and give the 4 multi-card sections
(Dos Columnas, Team Leaders, Nuestros Valores, Galería del Equipo) a much
more pronounced "enters from off-screen, alternating sides" animation.

**Architecture:** `TeamLeaderCard.tsx` gets a one-line height change. Two
new variants (`revealFromLeftFar`, `revealFromRightFar` — larger
`x`/`rotate` travel than the existing `revealLeft`/`revealRight`) are added
to `DashboardContent.tsx` and assigned by child index (even → left, odd →
right) to the individual cards inside the 4 named sections, replacing
`cardVariants`/`teamLeaderCardVariants` there. The 3 numbered headers lose
their decorative index `<span>`; the video section loses its kicker label
`<div>` entirely. Misión & Visión is untouched.

**Tech Stack:** Next.js 15, React 19, Framer Motion 12 (`Variants` — no new
APIs beyond what's already used in this file).

**Reference spec:** `docs/superpowers/specs/2026-07-18-bienvenida-entrada-lateral-design.md`

---

### Task 1: Team Leader photos taller

**Files:**
- Modify: `components/estudiante/dashboard/TeamLeaderCard.tsx`

- [ ] **Step 1: Change the height**

In `components/estudiante/dashboard/TeamLeaderCard.tsx`, change:

```tsx
      className="group relative h-[440px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
```

to:

```tsx
      className="group relative h-[560px] overflow-hidden rounded-[24px] border border-white/[0.06] bg-ink-950"
```

This is the only change in this file — the parallax range
(`useTransform(scrollYProgress, [0, 1], [-16, 16])`) and every other class/
prop stay exactly as they are.

- [ ] **Step 2: Run the existing tests to verify no regression**

Run: `npx vitest run "components/estudiante/dashboard/TeamLeaderCard.test.tsx"`
Expected: PASS (4 tests — none assert on the card's height in pixels).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add "components/estudiante/dashboard/TeamLeaderCard.tsx"
git commit -m "feat(dashboard): agranda las fotos de Team Leaders"
```

---

### Task 2: Remove indices/label, add pronounced lateral entrance

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

// ── Coreografía de encabezados y tarjetas ─────────────────────────────────
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

// Entrada lateral pronunciada para tarjetas dentro de grillas (Dos
// Columnas, Team Leaders, Valores, Galería) — mucho más recorrido y una
// leve rotación frente a revealLeft/revealRight, para que se sienta como
// que la tarjeta "cae" desde fuera de la pantalla en vez de un simple
// desplazamiento.
const revealFromLeftFar: Variants = {
  hidden: { opacity: 0, x: -130, rotate: -4, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
  },
};

const revealFromRightFar: Variants = {
  hidden: { opacity: 0, x: 130, rotate: 4, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    rotate: 0,
    filter: "blur(0px)",
    transition: { duration: 0.9, ease: EASE },
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

      {/* 2. Video de Bienvenida (sin marco, sin etiqueta) */}
      <ScrollReveal variants={revealUp} once={false}>
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
          variants={revealFromLeftFar}
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
          variants={revealFromRightFar}
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
      <ScrollReveal variants={revealLeft} once={false}>
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Cultura y Equipo
        </h2>
        <p className="mt-2.5 text-lg text-mist-400">
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
          {miembrosEquipo.map((miembro, indice) => (
            <TeamLeaderCard
              key={miembro.id}
              miembro={miembro}
              variants={indice % 2 === 0 ? revealFromLeftFar : revealFromRightFar}
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
        <ScrollReveal variants={revealRight} once={false} className="flex items-center px-1">
          <h3 className="font-display text-xl font-bold text-white">Nuestros Valores</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid gap-4 sm:grid-cols-2"
        >
          {VALORES.map((valor, indice) => (
            <motion.div
              key={valor.nombre}
              variants={indice % 2 === 0 ? revealFromLeftFar : revealFromRightFar}
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
          className="flex flex-col items-center px-1 text-center"
        >
          <h3 className="font-display text-xl font-bold text-white">Galería del Equipo</h3>
        </ScrollReveal>

        <ScrollReveal
          variants={containerVariants}
          once={false}
          className="grid grid-cols-2 gap-4 sm:grid-cols-4"
        >
          {galeriaEquipo.map((foto, indice) => (
            <motion.div
              key={foto.id}
              variants={indice % 2 === 0 ? revealFromLeftFar : revealFromRightFar}
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

Summary of what changed vs. the previous version:
- `teamLeaderCardVariants` constant removed; `revealFromLeftFar` and
  `revealFromRightFar` added.
- Video section (`2.`) no longer has the kicker label
  `<div className="flex items-center gap-2 px-1 pb-4">...</div>` above the
  player — `ScrollReveal` now wraps only the video's own div directly.
- Cultura y Equipo header (`5.`): the `01` index `<span>` is gone, and the
  now-unnecessary `relative` classes (on the `ScrollReveal` and on the
  `h2`/`p`, which existed only to stack above the absolutely-positioned
  number) are removed too.
- Nuestros Valores header (`8.`): the `02` index `<span>` is gone;
  `className` simplified from `"relative flex items-center gap-3 px-1"` to
  `"flex items-center px-1"` (no second flex child left to space out or
  stack above).
- Galería del Equipo header (`10.`): the `03` index `<span>` is gone;
  `className` simplified from `"relative flex flex-col items-center gap-1
  px-1 text-center"` to `"flex flex-col items-center px-1 text-center"` —
  centered alignment is preserved.
- Team Leaders header and Filosofía de Equipo are **unchanged** (their
  decorative elements are the oversized `Users`/`Lightbulb` icons, not
  numbers — out of scope for the index removal).
- Dos Columnas' two `motion.div` cards now use `revealFromLeftFar`/
  `revealFromRightFar` (was `cardVariants` for both).
- Team Leaders' `.map()` now passes `indice % 2 === 0 ? revealFromLeftFar :
  revealFromRightFar` to each `TeamLeaderCard` (was always
  `teamLeaderCardVariants`) — this requires adding the `indice` parameter
  to the `.map()` callback.
- Nuestros Valores' `.map()` now takes `(valor, indice)` and alternates
  `revealFromLeftFar`/`revealFromRightFar` (was always `cardVariants`).
- Galería's `.map()` now takes `(foto, indice)` and alternates
  `revealFromLeftFar`/`revealFromRightFar` (was always `cardVariants`).
- Misión & Visión (`7.`) is **completely unchanged** — still
  `cardVariants` on both cards, no index-based alternation.
- No other text, class, or prop changed.

- [ ] **Step 2: Run the dashboard page test to verify no regression**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS (10 tests — none assert on decorative spans, the video
label text, or animation values).

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors (confirms `teamLeaderCardVariants` removal left no
orphaned references, and the two new `Variants`-typed constants are
compatible with `ScrollReveal`'s and `TeamLeaderCard`'s `variants` props).

- [ ] **Step 4: Commit**

```bash
git add "app/(estudiante)/dashboard/DashboardContent.tsx"
git commit -m "feat(dashboard): entrada lateral pronunciada y limpieza de indices/etiqueta"
```

---

### Task 3: Full verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npx vitest run`
Expected: all tests passing (the pre-existing, unrelated flaky test in
`app/(estudiante)/dashboard/page.test.tsx` — "muestra el encabezado de
bienvenida" — may still occasionally fail only when run as part of the
full suite; if it's the *only* failure, rerun it in isolation to confirm
it's that known flake before treating the suite as green).

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: no new errors (if run from a nested git worktree under the main
repo directory, this may fail with an unrelated `@next/next` plugin
config-conflict error — a pre-existing worktree-location artifact; rerun
from a plain checkout to get a real signal if that happens).

- [ ] **Step 3: Manual verification in the browser**

Start the dev server (`npm run dev`) with valid Supabase credentials in
`.env.local`, or use a temporary preview route bypassing data fetching (same
technique used in previous verification cycles for this page) if no
credentials are available in this environment.

- Confirm the "01"/"02"/"03" numbers are gone from Cultura y Equipo,
  Nuestros Valores, and Galería del Equipo headers.
- Confirm the "Video de inducción" label and pulsing dot are gone — the
  video player is the very first thing in that block.
- Confirm Team Leader photos are visibly taller than before, and the
  section is correspondingly taller.
- Scroll through Dos Columnas, Team Leaders, Nuestros Valores, and Galería
  del Equipo: confirm each card visibly slides in from a side (alternating
  left/right by position) with a noticeably larger travel distance and a
  slight rotation compared to the rest of the page's more modest
  animations — and that scrolling back up and down again re-triggers it
  (this page's `once={false}` behavior, unchanged).
- Confirm Misión & Visión still uses the plain fade-up entrance, unchanged.
- Toggle `prefers-reduced-motion: reduce` in DevTools and reload: confirm
  everything (including the 4 lateral-entrance sections) renders fully
  visible immediately with no animation.

- [ ] **Step 4: Final commit (only if Steps 1-2 required fixes)**

If the full suite or lint required any fix, commit it separately:

```bash
git add -A
git commit -m "fix(dashboard): ajustes tras verificacion de entrada lateral"
```

If no fixes were needed, skip this step — Tasks 1-2 already committed
everything.

---

## Self-review notes

- **Spec coverage:** index removal on the 3 numbered headers (Task 2),
  video label removal (Task 2), taller Team Leader photos (Task 1),
  `revealFromLeftFar`/`revealFromRightFar` applied by alternating index to
  Dos Columnas/Team Leaders/Nuestros Valores/Galería (Task 2), Misión &
  Visión explicitly untouched (Task 2) — all covered.
- **Out of scope confirmed not touched:** any other Fase A/B page,
  `TeamLeaderCard`'s parallax range, Team Leaders' and Filosofía's
  icon-based decorations (not numbers, out of scope), new dependencies.
- **Type consistency:** `revealFromLeftFar`/`revealFromRightFar` (both
  typed `Variants`) are used identically wherever `TeamLeaderCard`'s
  `variants: Variants` prop and `motion.div`'s `variants` prop already
  expect a `Variants` value — no mismatch. `teamLeaderCardVariants` is
  fully removed (no leftover references) since `revealFromLeftFar`/
  `revealFromRightFar` replace it everywhere it was used.
