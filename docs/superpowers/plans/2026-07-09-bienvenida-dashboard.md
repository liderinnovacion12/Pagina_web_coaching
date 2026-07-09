# Bienvenida — nueva página en `/dashboard` — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reemplazar el dashboard actual de estudiante (stats de XP/insignias/cursos/membresía) por una página de bienvenida estática ("Bienvenido a Team 100% Real Estate") con video de Loom, panel de WhatsApp, guía de uso y accesos rápidos — y destrabar en el nav las 4 rutas a las que apuntan esos accesos con páginas stub reales.

**Architecture:** `app/(estudiante)/dashboard/page.tsx` pasa de server component con 4 queries a Supabase a un server component 100% estático (sin `async`, sin fetch). Se crean 4 páginas nuevas mínimas ("en construcción") bajo `app/(estudiante)/` para que los accesos rápidos y el botón de WhatsApp tengan un destino real, y se actualiza `nav-config.ts` para que el sidebar deje de marcarlas como "Próximamente". Se añade un color `whatsapp` a Tailwind como excepción documentada a la paleta ink/gold/mist.

**Tech Stack:** Next.js 15 (App Router, server components), Tailwind CSS, `lucide-react`, Vitest + Testing Library.

---

## Spec de referencia

`docs/superpowers/specs/2026-07-09-bienvenida-dashboard-design.md` (aprobado por el usuario).

## Verificación del entorno antes de empezar

- [ ] **Step 0: Confirmar que la suite de tests pasa antes de tocar nada**

Run: `npm test`
Expected: todos los tests existentes en verde (incluye `app/(estudiante)/dashboard/page.test.tsx` y `components/estudiante/nav-config.test.ts` con su contenido actual).

---

### Task 1: Token de color `whatsapp` en Tailwind + documentación de la excepción

**Files:**
- Modify: `tailwind.config.ts`
- Modify: `docs/design-system.md`

- [ ] **Step 1: Añadir el color `whatsapp` a `theme.extend.colors`**

En `tailwind.config.ts`, dentro de `colors: { ... }`, después del bloque `mist`:

```ts
        mist: {
          300: "#aab1c4",
          400: "#8b93a7",
          500: "#6b7385",
        },
        whatsapp: {
          DEFAULT: "#25D366",
          dark: "#1EBE5D",
        },
```

- [ ] **Step 2: Documentar la excepción en `docs/design-system.md`**

En la sección "## 2. Paleta de colores", justo después de la fila de `rose-400`/`rose-500` en la tabla, agregar:

```
| `whatsapp` / `whatsapp-dark` | `#25D366` / `#1EBE5D` | **Excepción documentada** — solo el botón "Únete a los Grupos y Comunidades de WhatsApp" en `/dashboard`. No reutilizar en otro contexto. |
```

- [ ] **Step 3: Verificar que el proyecto sigue compilando**

Run: `npm run typecheck`
Expected: sin errores (este cambio no afecta tipos, solo config de Tailwind).

- [ ] **Step 4: Commit**

```bash
git add tailwind.config.ts docs/design-system.md
git commit -m "feat(estilos): agrega color whatsapp como excepcion documentada"
```

---

### Task 2: Páginas stub para los 4 módulos ("en construcción")

**Files:**
- Create: `app/(estudiante)/herramientas/page.tsx`
- Create: `app/(estudiante)/calendario/page.tsx`
- Create: `app/(estudiante)/marketing/page.tsx`
- Create: `app/(estudiante)/soporte/page.tsx`

Mismo patrón que el stub existente `app/(coach)/coach/page.tsx` (`<h1>Panel de coach (en construcción)</h1>`), pero con la tipografía H1/subtítulo ya usada en el dashboard actual. Heredan automáticamente `EstudianteShell` vía `app/(estudiante)/layout.tsx`. Sin tests — el stub de coach tampoco tiene test.

- [ ] **Step 1: Crear `app/(estudiante)/herramientas/page.tsx`**

```tsx
export default function HerramientasPage() {
  return (
    <div>
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        Herramientas y Comunicación
      </h1>
      <p className="mt-2 text-lg text-mist-400">
        Directorio de grupos y comunidades — en construcción.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Crear `app/(estudiante)/calendario/page.tsx`**

```tsx
export default function CalendarioPage() {
  return (
    <div>
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        Calendario de Clases
      </h1>
      <p className="mt-2 text-lg text-mist-400">
        Horario de clases y eventos en vivo — en construcción.
      </p>
    </div>
  );
}
```

- [ ] **Step 3: Crear `app/(estudiante)/marketing/page.tsx`**

```tsx
export default function MarketingPage() {
  return (
    <div>
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        Recursos de Ventas y Marketing
      </h1>
      <p className="mt-2 text-lg text-mist-400">
        Descargas, scripts y técnicas de venta — en construcción.
      </p>
    </div>
  );
}
```

- [ ] **Step 4: Crear `app/(estudiante)/soporte/page.tsx`**

```tsx
export default function SoportePage() {
  return (
    <div>
      <h1 className="font-display text-[42px] font-bold leading-tight text-white">
        Soporte, Ayuda y Contactos
      </h1>
      <p className="mt-2 text-lg text-mist-400">
        Directorio de contactos y ayuda — en construcción.
      </p>
    </div>
  );
}
```

- [ ] **Step 5: Levantar el servidor de desarrollo y verificar las 4 rutas manualmente**

Run: `npm run dev`

Visitar (autenticado como estudiante): `/herramientas`, `/calendario`, `/marketing`, `/soporte`. Expected: cada una renderiza su H1 dentro del shell de estudiante (header + sidebar), sin error 404 ni de build.

- [ ] **Step 6: Commit**

```bash
git add "app/(estudiante)/herramientas/page.tsx" "app/(estudiante)/calendario/page.tsx" "app/(estudiante)/marketing/page.tsx" "app/(estudiante)/soporte/page.tsx"
git commit -m "feat(estudiante): agrega paginas stub de herramientas, calendario, marketing y soporte"
```

---

### Task 3: Destrabar los 4 accesos en `nav-config.ts`

**Files:**
- Modify: `components/estudiante/nav-config.ts`
- Modify: `components/estudiante/nav-config.test.ts`

- [ ] **Step 1: Actualizar el test para reflejar los nuevos hrefs (debe fallar primero)**

Reemplazar el contenido completo de `components/estudiante/nav-config.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { NAV_GROUPS } from "./nav-config";

describe("NAV_GROUPS", () => {
  it("tiene 5 grupos", () => {
    expect(NAV_GROUPS).toHaveLength(5);
  });

  it("incluye los 17 módulos del mapa de referencia en total", () => {
    const totalItems = NAV_GROUPS.reduce((suma, grupo) => suma + grupo.items.length, 0);
    expect(totalItems).toBe(17);
  });

  it("Bienvenida, Sistema 100+, Clases, Calendario, Herramientas, Marketing y Soporte tienen href navegable", () => {
    const conHref = NAV_GROUPS.flatMap((grupo) => grupo.items).filter((item) => item.href !== null);
    expect(conHref.map((item) => item.href).sort()).toEqual(
      ["/calendario", "/clases", "/dashboard", "/herramientas", "/marketing", "/sistema-100", "/soporte"].sort()
    );
  });
});
```

- [ ] **Step 2: Correr el test y confirmar que falla**

Run: `npx vitest run components/estudiante/nav-config.test.ts`
Expected: FAIL en el tercer `it` — el array actual todavía no incluye `/calendario`, `/herramientas`, `/marketing`, `/soporte`.

- [ ] **Step 3: Actualizar `nav-config.ts` con los 4 hrefs reales**

En `components/estudiante/nav-config.ts`, reemplazar el array `NAV_GROUPS` completo:

```ts
export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Inicio",
    items: [{ label: "Bienvenida", href: "/dashboard" }],
  },
  {
    label: "Formación",
    items: [
      { label: "Sistema 100+", href: "/sistema-100" },
      { label: "Clases", href: "/clases" },
      { label: "Curso de Rentas", href: null },
      { label: "Acelerador Pro", href: null },
      { label: "Acelerador Starter", href: null },
    ],
  },
  {
    label: "Negocio",
    items: [
      { label: "Proyectos Inmobiliarios Aliados", href: null },
      { label: "Aliados Estratégicos", href: null },
      { label: "Transacciones", href: null },
      { label: "CRM", href: null },
      { label: "Marketing", href: "/marketing" },
    ],
  },
  {
    label: "Comunidad",
    items: [
      { label: "Calendario", href: "/calendario" },
      { label: "Eventos", href: null },
      { label: "Herramientas", href: "/herramientas" },
      { label: "Construcción de Equipo", href: null },
    ],
  },
  {
    label: "Soporte",
    items: [
      { label: "Soporte", href: "/soporte" },
      { label: "Oficinas", href: null },
    ],
  },
];
```

- [ ] **Step 4: Correr el test y confirmar que pasa**

Run: `npx vitest run components/estudiante/nav-config.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add components/estudiante/nav-config.ts components/estudiante/nav-config.test.ts
git commit -m "feat(estudiante): habilita accesos de calendario, herramientas, marketing y soporte en el nav"
```

---

### Task 4: Reescribir `/dashboard` con el nuevo contenido de bienvenida

**Files:**
- Modify: `app/(estudiante)/dashboard/page.tsx`
- Modify: `app/(estudiante)/dashboard/page.test.tsx`

- [ ] **Step 1: Reemplazar el test completo de la página (debe fallar primero)**

Reemplazar el contenido completo de `app/(estudiante)/dashboard/page.test.tsx`:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DashboardPage from "./page";

describe("DashboardPage", () => {
  it("muestra el encabezado de bienvenida", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Bienvenido a Team 100% Real Estate" })
    ).toBeInTheDocument();
    expect(screen.getByText("by Wilmar Sosa y Samuel Oropeza")).toBeInTheDocument();
  });

  it("embebe el video de bienvenida de Loom", () => {
    render(<DashboardPage />);

    const iframe = screen.getByTitle("Video de bienvenida — Team 100% Real Estate");
    expect(iframe).toHaveAttribute(
      "src",
      "https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
    );
  });

  it("el boton de WhatsApp enlaza a /herramientas", () => {
    render(<DashboardPage />);

    expect(
      screen.getByRole("link", { name: /únete a los grupos y comunidades de whatsapp/i })
    ).toHaveAttribute("href", "/herramientas");
  });

  it("muestra los 4 pasos de Como Usar la Plataforma", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Usa el menú lateral para navegar entre módulos.")).toBeInTheDocument();
    expect(screen.getByText("Revisa el calendario de clases y eventos.")).toBeInTheDocument();
    expect(screen.getByText("Descarga los recursos disponibles.")).toBeInTheDocument();
    expect(screen.getByText("Contacta a soporte si tienes dudas.")).toBeInTheDocument();
  });

  it("los accesos rapidos enlazan a las 4 rutas correctas", () => {
    render(<DashboardPage />);

    expect(screen.getByRole("link", { name: "Grupos de WhatsApp" })).toHaveAttribute(
      "href",
      "/herramientas"
    );
    expect(screen.getByRole("link", { name: "Calendario de Clases" })).toHaveAttribute(
      "href",
      "/calendario"
    );
    expect(screen.getByRole("link", { name: "Recursos de Ventas" })).toHaveAttribute(
      "href",
      "/marketing"
    );
    expect(screen.getByRole("link", { name: "Soporte" })).toHaveAttribute("href", "/soporte");
  });
});
```

- [ ] **Step 2: Correr el test y confirmar que falla**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: FAIL. La página actual todavía es un componente `async` que depende de `getSesionUsuario`/`getResumenEstudiante` y renderiza "Bienvenido de nuevo" — `render(<DashboardPage />)` no produce el árbol esperado por ninguna de las 5 aserciones.

- [ ] **Step 3: Reemplazar el contenido completo de `app/(estudiante)/dashboard/page.tsx`**

```tsx
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

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

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="font-display text-[42px] font-bold leading-tight text-white">
          Bienvenido a Team 100% Real Estate
        </h1>
        <p className="mt-2 text-lg text-mist-400">by Wilmar Sosa y Samuel Oropeza</p>
      </div>

      <div className="rounded-[20px] bg-white p-4 sm:p-6">
        <div className="flex items-center justify-between px-1 pb-3">
          <p className="font-mono text-xs uppercase tracking-wider text-ink-950/60">
            Video de bienvenida
          </p>
          <span className="text-xs font-medium text-ink-950/60">4 min</span>
        </div>
        <div className="aspect-video overflow-hidden rounded-xl">
          <iframe
            src="https://www.loom.com/embed/cb856608ad54454a95f79ccdbaa07de1"
            title="Video de bienvenida — Team 100% Real Estate"
            allow="fullscreen"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-8">
        <p className="font-mono text-xs uppercase tracking-wider text-mist-500">
          Conéctate con el equipo
        </p>
        <h2 className="mt-2 font-display text-xl font-semibold text-white">
          Únete a la comunidad de Team 100% Real Estate
        </h2>
        <p className="mt-2 text-mist-400">
          Súmate a los grupos y comunidades de WhatsApp para conectar con otros
          agentes, resolver dudas y enterarte de las próximas clases en vivo.
        </p>
        <Link
          href="/herramientas"
          className="mt-5 inline-flex h-[52px] items-center justify-center gap-2 rounded-xl bg-whatsapp px-6 font-semibold text-white transition hover:bg-whatsapp-dark"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Únete a los Grupos y Comunidades de WhatsApp
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h3 className="font-display font-semibold text-white">Cómo Usar la Plataforma</h3>
          <ol className="mt-4 flex flex-col gap-4">
            {PASOS_USO.map((paso, indice) => (
              <li key={paso} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold-500/10 font-mono text-xs text-gold-300">
                  {indice + 1}
                </span>
                <span className="text-sm text-mist-300">{paso}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-white/[0.08] bg-white/[0.03] p-6">
          <h3 className="font-display font-semibold text-white">Accesos Rápidos</h3>
          <ul className="mt-4 flex flex-col gap-1">
            {ACCESOS_RAPIDOS.map((acceso) => (
              <li key={acceso.href}>
                <Link
                  href={acceso.href}
                  className="flex items-center justify-between rounded-lg px-2 py-3 text-sm text-mist-300 transition hover:text-gold-300"
                >
                  {acceso.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Correr el test y confirmar que pasa**

Run: `npx vitest run "app/(estudiante)/dashboard/page.test.tsx"`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(estudiante)/dashboard/page.tsx" "app/(estudiante)/dashboard/page.test.tsx"
git commit -m "feat(estudiante): reemplaza el dashboard por la pagina de bienvenida de Team 100% Real Estate"
```

---

### Task 5: Eliminar la infraestructura de stats que quedó sin uso

**Files:**
- Delete: `lib/db/dashboard.ts`
- Delete: `lib/db/dashboard.test.ts`

`getResumenEstudiante` ya no se importa desde ningún lado después de la Task 4 (confirmado por búsqueda previa: solo lo usaban `dashboard/page.tsx` y su propio test).

- [ ] **Step 1: Confirmar que ya no hay referencias**

Run: `grep -rn "getResumenEstudiante\|lib/db/dashboard" app components lib --include="*.ts" --include="*.tsx"`
Expected: sin resultados (además de la propia definición, que se borra en el siguiente paso).

- [ ] **Step 2: Borrar los archivos**

```bash
git rm lib/db/dashboard.ts lib/db/dashboard.test.ts
```

- [ ] **Step 3: Correr toda la suite de tests**

Run: `npm test`
Expected: PASS en todos los tests (incluye los de la Task 2, 3 y 4; no debe quedar ningún test roto por la eliminación).

- [ ] **Step 4: Correr typecheck**

Run: `npm run typecheck`
Expected: sin errores (no debe quedar ningún import colgante hacia `lib/db/dashboard`).

- [ ] **Step 5: Commit**

```bash
git commit -m "chore(estudiante): elimina lib/db/dashboard.ts, reemplazado por el dashboard de bienvenida estatico"
```

---

## Verificación final

- [ ] **Step 1: Suite completa**

Run: `npm test && npm run typecheck && npm run lint`
Expected: los tres comandos terminan sin errores.

- [ ] **Step 2: Recorrido manual**

Run: `npm run dev`, iniciar sesión como estudiante y verificar en `/dashboard`:
- El H1 dice "Bienvenido a Team 100% Real Estate" y el subtítulo "by Wilmar Sosa y Samuel Oropeza".
- El video de Loom carga dentro de la tarjeta blanca.
- El botón verde de WhatsApp navega a `/herramientas` y esa página carga dentro del shell de estudiante.
- Los 4 accesos rápidos navegan a `/herramientas`, `/calendario`, `/marketing`, `/soporte` sin 404.
- En el sidebar (mega-menú), "Calendario", "Herramientas", "Marketing" y "Soporte" ya no muestran el candado "Próximamente" y son clicleables.
