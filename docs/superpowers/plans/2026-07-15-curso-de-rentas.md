# Curso de Rentas Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el `href: null` de "Curso de Rentas" por una página real: una única página promocional estática para el curso externo "Maestría en Rentas", sin tabla en base de datos ni CRUD admin.

**Architecture:** Un solo server component estático (`app/(estudiante)/curso-de-rentas/page.tsx`) con contenido hardcodeado — sin capa de datos, sin RLS, sin panel admin (decisión explícita del usuario, distinta de los módulos anteriores). Reutiliza los tokens de diseño `ink`/`gold`/`mist` y patrones visuales ya existentes en `DashboardContent.tsx` (tarjeta con borde izquierdo dorado para destacar bloques, botón CTA grande estilo "WhatsApp" pero en dorado).

**Tech Stack:** Next.js 15 (App Router), `next/image`, Tailwind (tokens de `tailwind.config.ts`), Vitest + Testing Library.

---

## Referencia: spec

Este plan implementa `docs/superpowers/specs/2026-07-15-curso-de-rentas-design.md`. Léelo primero si algo aquí no tiene sentido.

---

### Task 1: `app/(estudiante)/curso-de-rentas/page.tsx` — página estática (TDD)

**Files:**
- Create: `app/(estudiante)/curso-de-rentas/page.tsx`
- Test: `app/(estudiante)/curso-de-rentas/page.test.tsx`

- [ ] **Step 1: Escribir el test completo (falla porque el módulo no existe)**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import CursoDeRentasPage from "./page";

describe("CursoDeRentasPage", () => {
  it("muestra el título y subtítulo", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByRole("heading", { level: 1, name: "Maestría en Rentas" })).toBeInTheDocument();
    expect(
      screen.getByText("Domina el arte de las rentas inmobiliarias con nuestro programa completo.")
    ).toBeInTheDocument();
  });

  it("muestra el beneficio del 50% de descuento y el código", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByText(/Disfruta de un 50% de descuento en tu inscripción\./)).toBeInTheDocument();
    expect(screen.getByText("TEAM100REAL")).toBeInTheDocument();
  });

  it("muestra los 6 ítems del checklist", () => {
    render(<CursoDeRentasPage />);

    expect(screen.getByText("Módulos en video:")).toBeInTheDocument();
    expect(screen.getByText("Guiones y plantillas:")).toBeInTheDocument();
    expect(screen.getByText("Sesiones de reuniones en vivo grupales.")).toBeInTheDocument();
    expect(screen.getByText("Comunidad privada de WhatsApp:")).toBeInTheDocument();
    expect(screen.getByText("Bonus")).toBeInTheDocument();
    expect(screen.getByText("Plan de 30 días:")).toBeInTheDocument();
  });

  it("el CTA final enlaza a la plataforma externa en una pestaña nueva", () => {
    render(<CursoDeRentasPage />);

    const cta = screen.getByRole("link", { name: "Inscríbete ahora" });
    expect(cta).toHaveAttribute("href", "https://www.aprendeconwilmar.com/maestriaenrentas/pdp");
    expect(cta).toHaveAttribute("target", "_blank");
    expect(cta).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("no usa ningún ícono ni emoji en el contenido visible", () => {
    const { container } = render(<CursoDeRentasPage />);

    expect(container.querySelector("svg")).not.toBeInTheDocument();
    const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
    expect(emojiRegex.test(container.textContent ?? "")).toBe(false);
  });
});
```

- [ ] **Step 2: Verificar que falla**

Run: `npx vitest run "app/(estudiante)/curso-de-rentas/page.test.tsx"`
Expected: FAIL — `Cannot find module './page'`

- [ ] **Step 3: Implementar `app/(estudiante)/curso-de-rentas/page.tsx`**

```tsx
import Image from "next/image";

const CHECKLIST = [
  {
    titulo: "Módulos en video:",
    detalle: "Clases paso a paso disponibles 24/7.",
  },
  {
    titulo: "Guiones y plantillas:",
    detalle: "Scripts de llamadas, emails y tableros de gestión.",
  },
  {
    titulo: "Sesiones de reuniones en vivo grupales.",
    detalle: "También encuentras las grabaciones en caso de no poder asistir.",
  },
  {
    titulo: "Comunidad privada de WhatsApp:",
    detalle: "Soporte y networking con otros agentes.",
  },
  {
    titulo: "Bonus",
    detalle: "de charlas con Expertos.",
  },
  {
    titulo: "Plan de 30 días:",
    detalle: 'Guía clara para activar tu "salario inmobiliario".',
  },
];

const URL_INSCRIPCION = "https://www.aprendeconwilmar.com/maestriaenrentas/pdp";

export default function CursoDeRentasPage() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Maestría en Rentas
        </h1>
        <p className="mt-2 text-lg text-mist-400">
          Domina el arte de las rentas inmobiliarias con nuestro programa completo.
        </p>
      </div>

      <div className="rounded-2xl border border-gold-500/20 bg-gold-500/10 p-6">
        <p className="text-sm text-mist-300">
          Beneficio exclusivo para los agentes que hacen parte de este Team 100% Real Estate:
        </p>
        <p className="mt-2 text-xl font-semibold text-gold-300">
          Disfruta de un 50% de descuento en tu inscripción.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-mist-300">
          Dirígete al enlace, realiza tu inscripción y no olvides ingresar el código{" "}
          <code className="rounded border border-white/10 bg-ink-950 px-2 py-0.5 font-mono text-gold-300">
            TEAM100REAL
          </code>{" "}
          antes de pagar.
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-white/[0.06]">
        <Image
          src="https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/rentas/maestria-rentas-banner-CPOeJvYN.png"
          alt="Maestría en Rentas"
          width={1280}
          height={720}
          className="h-auto w-full object-cover"
        />
      </div>

      <p className="text-base leading-relaxed text-mist-300">
        Aprende a generar ingresos con propiedades de renta. Con estrategias probadas para el
        mercado inmobiliario, acceso a material exclusivo y una guía paso a paso desde cero hasta
        tu primera renta.
      </p>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-8">
        <h2 className="font-display text-lg font-bold text-white">
          ¿Qué incluye la Maestría en Rentas?
        </h2>
        <p className="mt-2 text-sm text-mist-300">
          Todo lo que necesitas para dominar las rentas y construir un ingreso constante como
          agente inmobiliario.
        </p>

        <ul className="mt-6 flex flex-col gap-4">
          {CHECKLIST.map((item) => (
            <li key={item.titulo} className="border-l-2 border-gold-500/60 pl-4">
              <p className="text-sm leading-relaxed text-mist-300">
                <span className="font-semibold text-white">{item.titulo}</span> {item.detalle}
              </p>
            </li>
          ))}
        </ul>

        <p className="mt-6 text-base font-bold text-white">
          Todo esto en una sola plataforma y podrás disfrutar el curso de por vida.
        </p>

        <a
          href={URL_INSCRIPCION}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-flex h-[54px] items-center justify-center gap-2.5 rounded-xl bg-gold-500 px-8 font-semibold text-ink-950 transition-all duration-200 hover:scale-[1.02] hover:bg-gold-400 hover:shadow-[0_0_24px_rgba(217,169,78,0.25)] active:scale-[0.98]"
        >
          Inscríbete ahora
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verificar que pasa**

Run: `npx vitest run "app/(estudiante)/curso-de-rentas/page.test.tsx"`
Expected: PASS (5 tests)

- [ ] **Step 5: Verificar tipos**

Run: `npx tsc --noEmit -p tsconfig.json`
Expected: sin errores. Presta atención a que `next.config.ts` ya permite imágenes de `*.supabase.co/storage/v1/object/public/**` (patrón usado en módulos anteriores) — la URL de esta imagen (`.../Fotografias/rentas/maestria-rentas-banner-CPOeJvYN.png`) ya cae dentro de ese patrón, así que `next/image` no debería fallar en build por `remotePatterns`. Confírmalo leyendo `next.config.ts` antes de dar la tarea por terminada.

- [ ] **Step 6: Commit**

```bash
git add "app/(estudiante)/curso-de-rentas/page.tsx" "app/(estudiante)/curso-de-rentas/page.test.tsx"
git commit -m "feat(curso-rentas): agrega pagina estatica de Maestria en Rentas"
```

---

### Task 2: Activar el ítem de navegación (y actualizar su test)

**Files:**
- Modify: `components/estudiante/nav-config.ts`
- Modify: `components/estudiante/nav-config.test.ts`

**Contexto importante:** en un módulo anterior (Proyectos Inmobiliarios Aliados) se activó un `href: null` sin actualizar `nav-config.test.ts` en el mismo commit, y causó una regresión detectada recién en verificación final. Este task hace ambos cambios juntos para no repetir eso — mismo cuidado que se tuvo en el módulo "Aliados Estratégicos".

- [ ] **Step 1: Cambiar el `href`**

En `components/estudiante/nav-config.ts`, busca (dentro del grupo `"Formación"`):

```ts
      { label: "Curso de Rentas", href: null },
```

Reemplázala por:

```ts
      { label: "Curso de Rentas", href: "/curso-de-rentas" },
```

- [ ] **Step 2: Actualizar el test que verifica los hrefs navegables**

Lee `components/estudiante/nav-config.test.ts` primero para confirmar el array actual (debería incluir `/aliados` del módulo anterior). Busca el test con el array de hrefs esperados y reemplázalo completo (nombre incluido) por:

```ts
  it("Bienvenida, Sistema 100+, Clases, Curso de Rentas, Calendario, Herramientas, Marketing, Proyectos Inmobiliarios Aliados, Aliados Estratégicos y Soporte tienen href navegable", () => {
    const conHref = NAV_GROUPS.flatMap((grupo) => grupo.items).filter((item) => item.href !== null);
    expect(conHref.map((item) => item.href).sort()).toEqual(
      [
        "/aliados",
        "/calendario",
        "/clases",
        "/curso-de-rentas",
        "/dashboard",
        "/herramientas",
        "/marketing",
        "/proyectos-inmobiliarios-aliados",
        "/sistema-100",
        "/soporte",
      ].sort()
    );
  });
```

El test de "17 módulos en total" no cambia (el ítem ya existía, solo cambia su `href`).

- [ ] **Step 3: Verificar que pasa**

Run: `npx vitest run components/estudiante/nav-config.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 4: Commit**

```bash
git add components/estudiante/nav-config.ts components/estudiante/nav-config.test.ts
git commit -m "feat(nav): activa el link de Curso de Rentas"
```

---

### Task 3: Verificación completa

**Files:** ninguno (solo comandos)

- [ ] **Step 1: Correr la suite completa**

Run: `npm run lint && npm run typecheck && npm test && npm run build`
Expected: los cuatro pasan (mismo orden que `.github/workflows/ci.yml`). Si corrés esto dentro de una worktree bajo `.worktrees/`, `npm run lint`/el paso de lint de `npm run build` pueden toparse con un problema conocido de resolución de config de ESLint anidado — no es un error real, ya está diagnosticado en épicas anteriores de este repo.

- [ ] **Step 2: Verificación manual en dev**

Run: `npm run dev`, iniciar sesión como estudiante, navegar a `/curso-de-rentas` desde el nav ("Formación" → "Curso de Rentas") y confirmar: el título, la caja de beneficio con el código `TEAM100REAL`, la imagen banner cargando correctamente, el párrafo descriptivo, los 6 ítems del checklist con su borde dorado, la línea de cierre en negrita, y el botón "Inscríbete ahora" abriendo `https://www.aprendeconwilmar.com/maestriaenrentas/pdp` en una pestaña nueva. Confirmar visualmente que no hay ningún ícono ni emoji en toda la página.
