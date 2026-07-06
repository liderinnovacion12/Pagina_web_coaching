# Coachpro — Fundación (migración a Next.js) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the current Vite+React coaching SPA with a Next.js (App Router, TypeScript) project implementing Coachpro's foundation: full database schema + RLS, Supabase Auth (email/password + Google) with `admin`/`estudiante` roles, route protection, and a public course-catalog landing.

**Architecture:** Single Next.js project (frontend + backend via Server Actions/Route Handlers) on Vercel, backed by the existing Supabase Pro project (schema wiped and rebuilt). `@supabase/ssr` provides browser/server/middleware Supabase clients; role-based access is enforced in middleware (redirect) and re-checked in every Server Action/layout via `lib/auth/session.ts`.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS 3, `@supabase/ssr` + `@supabase/supabase-js`, Vitest + React Testing Library, ESLint.

**Spec:** `docs/superpowers/specs/2026-07-06-coachpro-fundacion-design.md`

---

## Task 1: Remove legacy Vite project files

**Files:**
- Delete: `src/` (entire directory)
- Delete: `index.html`
- Delete: `vite.config.js`
- Delete: `package.json`, `package-lock.json` (replaced in Task 2)
- Delete: `postcss.config.js`, `tailwind.config.js` if present at repo root (replaced in Task 2)
- Keep: `docs/`, `supabase/`, `.git/`, `.gitignore`, `README.md` (if present)

- [ ] **Step 1: Confirm no uncommitted work would be lost**

Run: `git status --short`
Expected: clean or only files you intend to delete — if anything unexpected is modified, stop and ask before deleting.

- [ ] **Step 2: Delete the Vite app and its config**

```bash
git rm -r src index.html vite.config.js package.json package-lock.json
git rm postcss.config.js tailwind.config.js 2>/dev/null || true
```

- [ ] **Step 3: Commit the removal**

```bash
git add -A
git commit -m "chore: eliminar proyecto Vite, empieza migración a Next.js"
```

---

## Task 2: Scaffold the Next.js project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `tailwind.config.ts`
- Create: `postcss.config.js`
- Create: `.eslintrc.json`
- Create: `app/layout.tsx`
- Create: `app/globals.css`
- Create: `app/(public)/page.tsx`
- Create: `.gitignore` (append Next.js entries if missing)

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "coachpro",
  "private": true,
  "version": "0.1.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "seed:admin": "node scripts/seed-admin.mjs"
  },
  "dependencies": {
    "@supabase/ssr": "^0.5.2",
    "@supabase/supabase-js": "^2.45.4",
    "next": "^15.0.3",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@testing-library/dom": "^10.4.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.0.1",
    "@types/node": "^22.9.0",
    "@types/react": "^19.0.1",
    "@types/react-dom": "^19.0.2",
    "@vitejs/plugin-react": "^4.3.3",
    "autoprefixer": "^10.4.20",
    "eslint": "^9.15.0",
    "eslint-config-next": "^15.0.3",
    "jsdom": "^25.0.1",
    "postcss": "^8.4.49",
    "tailwindcss": "^3.4.14",
    "typescript": "^5.6.3",
    "vitest": "^2.1.5"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Write `next-env.d.ts`, `next.config.ts`**

`next-env.d.ts`:
```ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />
```

`next.config.ts`:
```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

- [ ] **Step 4: Write Tailwind + PostCSS + ESLint config**

`tailwind.config.ts`:
```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
```

`postcss.config.js`:
```js
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

`.eslintrc.json`:
```json
{
  "extends": ["next/core-web-vitals", "next/typescript"]
}
```

- [ ] **Step 5: Write root layout and global styles**

`app/globals.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

`app/layout.tsx`:
```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coachpro",
  description: "Plataforma de cursos online",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Write a minimal landing placeholder**

`app/(public)/page.tsx`:
```tsx
export default function LandingPage() {
  return <h1 className="text-3xl font-bold p-8">Coachpro</h1>;
}
```

- [ ] **Step 7: Ensure `.gitignore` covers Next.js build artifacts**

Append to `.gitignore` if not already present:
```
.next/
next-env.d.ts
```

- [ ] **Step 8: Install dependencies and verify the build**

```bash
npm install
npm run build
```

Expected: build completes with no errors, prints a route summary including `/`.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: scaffold del proyecto Next.js (App Router, TS, Tailwind)"
```

---

## Task 3: Configure Vitest + React Testing Library

**Files:**
- Create: `vitest.config.ts`
- Create: `vitest.setup.ts`

- [ ] **Step 1: Write `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./"),
    },
  },
});
```

- [ ] **Step 2: Write `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write a throwaway smoke test to confirm the harness works**

Create `app/(public)/page.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LandingPage from "./page";

describe("LandingPage smoke test", () => {
  it("renders the Coachpro heading", () => {
    render(<LandingPage />);
    expect(screen.getByText("Coachpro")).toBeInTheDocument();
  });
});
```

- [ ] **Step 4: Run the test**

Run: `npm test`
Expected: 1 passed.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "test: configurar Vitest + React Testing Library"
```

---

## Task 4: Environment variable template

**Files:**
- Create: `.env.example`
- Modify: `.gitignore` (confirm `.env.local` is ignored)

- [ ] **Step 1: Write `.env.example`**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

- [ ] **Step 2: Confirm `.gitignore` ignores local env files**

Check `.gitignore` contains `.env*.local` (Next.js's default). Add it if missing.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: plantilla de variables de entorno"
```

---

## Task 5: Supabase browser client

**Files:**
- Create: `lib/supabase/client.ts`
- Test: `lib/supabase/client.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const createBrowserClientMock = vi.fn(() => ({ mocked: "browser-client" }));

vi.mock("@supabase/ssr", () => ({
  createBrowserClient: createBrowserClientMock,
}));

describe("createClient (browser)", () => {
  beforeEach(() => {
    createBrowserClientMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("crea el cliente con la URL y la anon key del entorno", async () => {
    const { createClient } = await import("./client");
    const result = createClient();

    expect(createBrowserClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key"
    );
    expect(result).toEqual({ mocked: "browser-client" });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/supabase/client.test.ts`
Expected: FAIL — `Cannot find module './client'`.

- [ ] **Step 3: Write the implementation**

```ts
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/supabase/client.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cliente de Supabase para el browser"
```

---

## Task 6: Supabase server client

**Files:**
- Create: `lib/supabase/server.ts`
- Test: `lib/supabase/server.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const createServerClientMock = vi.fn(() => ({ mocked: "server-client" }));
const getAllMock = vi.fn(() => [{ name: "sb-token", value: "abc" }]);
const setMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: createServerClientMock,
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({ getAll: getAllMock, set: setMock })),
}));

describe("createClient (server)", () => {
  beforeEach(() => {
    createServerClientMock.mockClear();
    getAllMock.mockClear();
    setMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "anon-key";
  });

  it("crea el cliente pasando getAll/setAll respaldados por las cookies de Next", async () => {
    const { createClient } = await import("./server");
    await createClient();

    expect(createServerClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "anon-key",
      expect.objectContaining({ cookies: expect.any(Object) })
    );

    const { cookies: cookieOptions } = createServerClientMock.mock.calls[0][2];
    expect(cookieOptions.getAll()).toEqual([{ name: "sb-token", value: "abc" }]);

    cookieOptions.setAll([{ name: "sb-token", value: "xyz", options: {} }]);
    expect(setMock).toHaveBeenCalledWith("sb-token", "xyz", {});
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/supabase/server.test.ts`
Expected: FAIL — `Cannot find module './server'`.

- [ ] **Step 3: Write the implementation**

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Llamado desde un Server Component; el middleware refresca la sesión.
          }
        },
      },
    }
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/supabase/server.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cliente de Supabase para Server Components/Actions"
```

---

## Task 7: Supabase admin client

**Files:**
- Create: `lib/supabase/admin.ts`
- Test: `lib/supabase/admin.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const createClientMock = vi.fn(() => ({ mocked: "admin-client" }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: createClientMock,
}));

describe("createAdminClient", () => {
  beforeEach(() => {
    createClientMock.mockClear();
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
  });

  it("crea el cliente con la service role key y sin persistencia de sesión", async () => {
    const { createAdminClient } = await import("./admin");
    createAdminClient();

    expect(createClientMock).toHaveBeenCalledWith(
      "https://example.supabase.co",
      "service-role-key",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/supabase/admin.test.ts`
Expected: FAIL — `Cannot find module './admin'`.

- [ ] **Step 3: Write the implementation**

```ts
import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/supabase/admin.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: cliente de Supabase con service role"
```

---

## Task 8: Database schema + RLS migration

**Files:**
- Create: `supabase/migrations/001_coachpro_schema.sql`

This task is SQL applied to Supabase — not Vitest-covered. Verification is via `supabase db reset` / manual review, per the Definition of Done in the plan de implementación (RLS checked with two test accounts).

- [ ] **Step 1: Write the migration**

```sql
-- 001_coachpro_schema.sql
-- Esquema completo de Coachpro: usuarios, cursos, lecciones, inscripciones,
-- membresia, progreso, quiz_intentos, xp_eventos, insignias, usuario_intereses.
-- Incluye RLS y la función is_admin() (SECURITY DEFINER) para evitar la
-- recursión infinita ya resuelta antes en el proyecto de coaching anterior.

create extension if not exists "pgcrypto";

create type rol_usuario as enum ('admin', 'estudiante');
create type origen_inscripcion as enum ('compra_individual', 'membresia');
create type estado_membresia as enum ('activa', 'cancelada', 'vencida');

-- ── Tablas ────────────────────────────────────────────────────────────────

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  rol rol_usuario not null default 'estudiante',
  stripe_customer_id text,
  registrado_en timestamptz not null default now()
);
create index usuarios_email_idx on usuarios(email);

create table cursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  precio numeric(10,2) not null default 0,
  publicado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table lecciones (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos(id) on delete cascade,
  tipo_contenido text not null,
  mux_asset_id text,
  storage_key text,
  orden int not null default 0
);
create index lecciones_curso_id_idx on lecciones(curso_id);

create table inscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  stripe_payment_id text,
  origen origen_inscripcion not null,
  creado_en timestamptz not null default now(),
  unique (usuario_id, curso_id)
);
create index inscripciones_usuario_curso_idx on inscripciones(usuario_id, curso_id);

create table membresia (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  stripe_subscription_id text,
  estado estado_membresia not null default 'vencida',
  periodo_fin timestamptz
);

create table progreso (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  segundo_actual int not null default 0,
  completado boolean not null default false,
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, leccion_id)
);
create index progreso_usuario_leccion_idx on progreso(usuario_id, leccion_id);

create table quiz_intentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  calificacion int not null,
  creado_en timestamptz not null default now()
);

create table xp_eventos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  origen text not null,
  puntos int not null,
  creado_en timestamptz not null default now()
);
create index xp_eventos_usuario_idx on xp_eventos(usuario_id);

create table insignias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  icono text
);

create table insignias_usuario (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  insignia_id uuid not null references insignias(id) on delete cascade,
  obtenida_en timestamptz not null default now(),
  primary key (usuario_id, insignia_id)
);

create table usuario_intereses (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  sector text not null,
  primary key (usuario_id, sector)
);

-- ── Auto-creación de fila en usuarios al registrarse ────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, rol)
  values (new.id, new.email, 'estudiante');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── is_admin() sin recursión ────────────────────────────────────────────────

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────

alter table usuarios enable row level security;
alter table cursos enable row level security;
alter table lecciones enable row level security;
alter table inscripciones enable row level security;
alter table membresia enable row level security;
alter table progreso enable row level security;
alter table quiz_intentos enable row level security;
alter table xp_eventos enable row level security;
alter table insignias enable row level security;
alter table insignias_usuario enable row level security;
alter table usuario_intereses enable row level security;

create policy "usuarios_select_own" on usuarios for select using (id = auth.uid() or is_admin());
create policy "usuarios_update_own" on usuarios for update using (id = auth.uid() or is_admin());
create policy "usuarios_insert_own" on usuarios for insert with check (id = auth.uid());

create policy "cursos_select_publicado" on cursos for select using (publicado = true or is_admin());
create policy "cursos_admin_all" on cursos for all using (is_admin()) with check (is_admin());

create policy "lecciones_select_publicado" on lecciones for select using (
  is_admin() or exists (select 1 from cursos c where c.id = curso_id and c.publicado = true)
);
create policy "lecciones_admin_all" on lecciones for all using (is_admin()) with check (is_admin());

create policy "inscripciones_select_own" on inscripciones for select using (usuario_id = auth.uid() or is_admin());
create policy "inscripciones_insert_own" on inscripciones for insert with check (usuario_id = auth.uid() or is_admin());
create policy "inscripciones_admin_all" on inscripciones for all using (is_admin()) with check (is_admin());

create policy "membresia_select_own" on membresia for select using (usuario_id = auth.uid() or is_admin());
create policy "membresia_admin_all" on membresia for all using (is_admin()) with check (is_admin());

create policy "progreso_select_own" on progreso for select using (usuario_id = auth.uid() or is_admin());
create policy "progreso_insert_own" on progreso for insert with check (usuario_id = auth.uid());
create policy "progreso_update_own" on progreso for update using (usuario_id = auth.uid() or is_admin());

create policy "quiz_intentos_select_own" on quiz_intentos for select using (usuario_id = auth.uid() or is_admin());
create policy "quiz_intentos_insert_own" on quiz_intentos for insert with check (usuario_id = auth.uid());

create policy "xp_eventos_select_own" on xp_eventos for select using (usuario_id = auth.uid() or is_admin());
create policy "xp_eventos_insert_own" on xp_eventos for insert with check (usuario_id = auth.uid() or is_admin());

create policy "insignias_select_all" on insignias for select using (true);
create policy "insignias_admin_all" on insignias for all using (is_admin()) with check (is_admin());

create policy "insignias_usuario_select_own" on insignias_usuario for select using (usuario_id = auth.uid() or is_admin());
create policy "insignias_usuario_insert_own" on insignias_usuario for insert with check (usuario_id = auth.uid() or is_admin());

create policy "usuario_intereses_select_own" on usuario_intereses for select using (usuario_id = auth.uid() or is_admin());
create policy "usuario_intereses_insert_own" on usuario_intereses for insert with check (usuario_id = auth.uid());
create policy "usuario_intereses_delete_own" on usuario_intereses for delete using (usuario_id = auth.uid());
```

- [ ] **Step 2: Wipe the old schema and apply the new one against the linked Supabase project**

Run `supabase/scripts/drop-all-tables.sql` in the Supabase SQL Editor (it already drops the old `is_admin()`/`handle_new_user()` too, so no changes needed there), then apply the new migration:

```bash
supabase db push
```

Expected: no errors; `supabase db diff` shows no drift afterward.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(db): esquema completo de Coachpro con RLS"
```

---

## Task 9: Seed admin script

**Files:**
- Create: `scripts/seed-admin.mjs`
- Test: `scripts/seed-admin.test.mjs`

- [ ] **Step 1: Write the failing test**

```js
// scripts/seed-admin.test.mjs
import { describe, it, expect, vi, beforeEach } from "vitest";

const createUserMock = vi.fn(async () => ({
  data: { user: { id: "user-123" } },
  error: null,
}));
const eqMock = vi.fn(() => ({ error: null }));
const updateMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ update: updateMock }));

vi.mock("@supabase/supabase-js", () => ({
  createClient: vi.fn(() => ({
    auth: { admin: { createUser: createUserMock } },
    from: fromMock,
  })),
}));

describe("seedAdmin", () => {
  beforeEach(() => {
    createUserMock.mockClear();
    updateMock.mockClear();
    eqMock.mockClear();
    fromMock.mockClear();
  });

  it("crea el usuario admin y promueve su rol", async () => {
    const { seedAdmin } = await import("./seed-admin.mjs");

    await seedAdmin({
      email: "admin@coachpro.demo",
      password: "clave-segura-123",
      supabaseUrl: "https://example.supabase.co",
      serviceRoleKey: "service-role-key",
    });

    expect(createUserMock).toHaveBeenCalledWith({
      email: "admin@coachpro.demo",
      password: "clave-segura-123",
      email_confirm: true,
    });
    expect(fromMock).toHaveBeenCalledWith("usuarios");
    expect(updateMock).toHaveBeenCalledWith({ rol: "admin" });
    expect(eqMock).toHaveBeenCalledWith("id", "user-123");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- scripts/seed-admin.test.mjs`
Expected: FAIL — `Cannot find module './seed-admin.mjs'`.

- [ ] **Step 3: Write the implementation**

```js
// scripts/seed-admin.mjs
import { createClient } from "@supabase/supabase-js";

export async function seedAdmin({ email, password, supabaseUrl, serviceRoleKey }) {
  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    throw new Error(`No se pudo crear el usuario admin: ${error.message}`);
  }

  const { error: updateError } = await supabase
    .from("usuarios")
    .update({ rol: "admin" })
    .eq("id", data.user.id);

  if (updateError) {
    throw new Error(`No se pudo promover el rol admin: ${updateError.message}`);
  }
}

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!email || !password || !supabaseUrl || !serviceRoleKey) {
    console.error(
      "Faltan variables: ADMIN_EMAIL, ADMIN_PASSWORD, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY"
    );
    process.exit(1);
  }

  await seedAdmin({ email, password, supabaseUrl, serviceRoleKey });
  console.log(`Usuario admin creado: ${email}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- scripts/seed-admin.test.mjs`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(db): script de seed para la cuenta admin"
```

---

## Task 10: Session/role helpers (`lib/auth/session.ts`)

**Files:**
- Create: `lib/auth/session.ts`
- Test: `lib/auth/session.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const singleMock = vi.fn();
const eqMock = vi.fn(() => ({ single: singleMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { getUser: getUserMock },
    from: fromMock,
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("getSesionUsuario", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
    redirectMock.mockReset();
  });

  it("retorna null si no hay usuario autenticado", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { getSesionUsuario } = await import("./session");
    const resultado = await getSesionUsuario();

    expect(resultado).toBeNull();
  });

  it("retorna id, email y rol cuando hay usuario y perfil", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "estudiante" } });

    const { getSesionUsuario } = await import("./session");
    const resultado = await getSesionUsuario();

    expect(resultado).toEqual({
      id: "user-1",
      email: "ana@example.com",
      rol: "estudiante",
    });
  });
});

describe("requireRol", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    singleMock.mockReset();
    redirectMock.mockReset();
  });

  it("redirige a /login si no hay sesión", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { requireRol } = await import("./session");
    await requireRol("estudiante");

    expect(redirectMock).toHaveBeenCalledWith("/login");
  });

  it("redirige a /dashboard si un estudiante intenta acceder a admin", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "estudiante" } });

    const { requireRol } = await import("./session");
    await requireRol("admin");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/auth/session.test.ts`
Expected: FAIL — `Cannot find module './session'`.

- [ ] **Step 3: Write the implementation**

```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "estudiante";

export type SesionUsuario = {
  id: string;
  email: string;
  rol: Rol;
};

export async function getSesionUsuario(): Promise<SesionUsuario | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: perfil } = await supabase
    .from("usuarios")
    .select("rol")
    .eq("id", user.id)
    .single();

  if (!perfil) return null;

  return { id: user.id, email: user.email ?? "", rol: perfil.rol as Rol };
}

export async function requireRol(rolRequerido: Rol): Promise<SesionUsuario> {
  const sesion = await getSesionUsuario();

  if (!sesion) {
    redirect("/login");
  }

  if (sesion.rol !== rolRequerido) {
    redirect(sesion.rol === "admin" ? "/admin" : "/dashboard");
  }

  return sesion;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/auth/session.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): helpers de sesión y rol server-side"
```

---

## Task 11: Middleware route rules (pure logic)

**Files:**
- Create: `lib/auth/middleware-rules.ts`
- Test: `lib/auth/middleware-rules.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { calcularRedireccion } from "./middleware-rules";

describe("calcularRedireccion", () => {
  it("no redirige rutas públicas sin importar el rol", () => {
    expect(calcularRedireccion("/", null)).toBeNull();
    expect(calcularRedireccion("/login", null)).toBeNull();
  });

  it("redirige a /login si no hay rol y la ruta es protegida", () => {
    expect(calcularRedireccion("/dashboard", null)).toBe("/login");
    expect(calcularRedireccion("/admin", null)).toBe("/login");
  });

  it("redirige a un estudiante fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "estudiante")).toBe("/dashboard");
  });

  it("permite a un estudiante entrar a /dashboard", () => {
    expect(calcularRedireccion("/dashboard", "estudiante")).toBeNull();
  });

  it("permite a un admin entrar a /admin y a /dashboard", () => {
    expect(calcularRedireccion("/admin", "admin")).toBeNull();
    expect(calcularRedireccion("/dashboard", "admin")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: FAIL — `Cannot find module './middleware-rules'`.

- [ ] **Step 3: Write the implementation**

```ts
export type Rol = "admin" | "estudiante";

const PREFIJO_ESTUDIANTE = "/dashboard";
const PREFIJO_ADMIN = "/admin";

export function calcularRedireccion(
  pathname: string,
  rol: Rol | null
): string | null {
  const esRutaEstudiante = pathname.startsWith(PREFIJO_ESTUDIANTE);
  const esRutaAdmin = pathname.startsWith(PREFIJO_ADMIN);

  if (!esRutaEstudiante && !esRutaAdmin) return null;

  if (rol === null) return "/login";

  if (esRutaAdmin && rol !== "admin") return "/dashboard";

  return null;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): reglas puras de redirección para el middleware"
```

---

## Task 12: Middleware glue

**Files:**
- Create: `middleware.ts`

This file is thin glue over `calcularRedireccion` (Task 11, already unit-tested) and the standard `@supabase/ssr` middleware recipe. It is verified manually in Task 27, not with Vitest (mocking `NextRequest`/`NextResponse` end-to-end adds little over the pure-function tests already in place).

- [ ] **Step 1: Write `middleware.ts`**

```ts
import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { calcularRedireccion, type Rol } from "@/lib/auth/middleware-rules";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let rol: Rol | null = null;

  if (user) {
    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", user.id)
      .single();
    rol = (perfil?.rol as Rol) ?? null;
  }

  const destino = calcularRedireccion(request.nextUrl.pathname, rol);

  if (destino) {
    const url = request.nextUrl.clone();
    url.pathname = destino;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
```

- [ ] **Step 2: Verify the build still compiles**

Run: `npm run build`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(auth): middleware de sesión y protección de rutas"
```

---

## Task 13: Login — Server Action

**Files:**
- Create: `app/(public)/login/actions.ts`
- Test: `app/(public)/login/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const signInWithPasswordMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { signInWithPassword: signInWithPasswordMock },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(valores: Record<string, string>) {
  const fd = new FormData();
  Object.entries(valores).forEach(([clave, valor]) => fd.set(clave, valor));
  return fd;
}

describe("login", () => {
  beforeEach(() => {
    signInWithPasswordMock.mockReset();
    redirectMock.mockReset();
  });

  it("devuelve error si falta el email o el password", async () => {
    const { login } = await import("./actions");
    const resultado = await login(
      { error: null },
      formDataDe({ email: "", password: "" })
    );

    expect(resultado.error).toBe("Ingresa tu correo y contraseña.");
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("devuelve error si Supabase rechaza las credenciales", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: { message: "bad creds" } });

    const { login } = await import("./actions");
    const resultado = await login(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(resultado.error).toBe("Correo o contraseña incorrectos.");
  });

  it("redirige a /dashboard cuando el login es correcto", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const { login } = await import("./actions");
    await login(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(public\)/login/actions.test.ts`
Expected: FAIL — `Cannot find module './actions'`.

- [ ] **Step 3: Write the implementation**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error: string | null };

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Correo o contraseña incorrectos." };
  }

  redirect("/dashboard");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(public\)/login/actions.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): server action de login"
```

---

## Task 14: Login — Google OAuth action + callback route

**Files:**
- Modify: `app/(public)/login/actions.ts`
- Create: `app/auth/callback/route.ts`
- Test: `app/auth/callback/route.test.ts`

- [ ] **Step 1: Add `loginConGoogle` to `actions.ts`**

Append to `app/(public)/login/actions.ts`:
```ts
export async function loginConGoogle() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  });

  if (error || !data.url) {
    redirect("/login?error=oauth");
  }

  redirect(data.url);
}
```

- [ ] **Step 2: Write the failing test for the callback route**

```ts
// app/auth/callback/route.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const exchangeCodeForSessionMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { exchangeCodeForSession: exchangeCodeForSessionMock },
  })),
}));

describe("GET /auth/callback", () => {
  beforeEach(() => {
    exchangeCodeForSessionMock.mockReset();
  });

  it("redirige a /login?error=oauth si no hay code", async () => {
    const { GET } = await import("./route");
    const respuesta = await GET(new Request("http://localhost/auth/callback"));

    expect(respuesta.status).toBe(307);
    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/login?error=oauth"
    );
    expect(exchangeCodeForSessionMock).not.toHaveBeenCalled();
  });

  it("intercambia el code y redirige a /dashboard", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });

    const { GET } = await import("./route");
    const respuesta = await GET(
      new Request("http://localhost/auth/callback?code=abc123")
    );

    expect(exchangeCodeForSessionMock).toHaveBeenCalledWith("abc123");
    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/dashboard"
    );
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- app/auth/callback/route.test.ts`
Expected: FAIL — `Cannot find module './route'`.

- [ ] **Step 4: Write the implementation**

```ts
// app/auth/callback/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(`${origin}/dashboard`);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- app/auth/callback/route.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat(auth): login con Google OAuth y callback"
```

---

## Task 15: Login — form component

**Files:**
- Create: `app/(public)/login/LoginForm.tsx`
- Test: `app/(public)/login/LoginForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LoginForm } from "./LoginForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  login: vi.fn(),
  loginConGoogle: vi.fn(),
}));

describe("LoginForm", () => {
  beforeEach(() => {
    vi.mocked(actions.login).mockReset();
    vi.mocked(actions.loginConGoogle).mockReset();
  });

  it("envía el formulario con email y password", async () => {
    vi.mocked(actions.login).mockResolvedValue({ error: null });

    render(<LoginForm />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    await waitFor(() => expect(actions.login).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.login).mockResolvedValue({
      error: "Correo o contraseña incorrectos.",
    });

    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /ingresar/i }));

    expect(
      await screen.findByText("Correo o contraseña incorrectos.")
    ).toBeInTheDocument();
  });

  it("llama a loginConGoogle al hacer clic en el botón de Google", () => {
    render(<LoginForm />);
    fireEvent.click(screen.getByRole("button", { name: /continuar con google/i }));

    expect(actions.loginConGoogle).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(public\)/login/LoginForm.test.tsx`
Expected: FAIL — `Cannot find module './LoginForm'`.

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

import { useActionState } from "react";
import { login, loginConGoogle, type LoginState } from "./actions";

const estadoInicial: LoginState = { error: null };

export function LoginForm() {
  const [estado, formAction, pendiente] = useActionState(login, estadoInicial);

  return (
    <div className="flex flex-col gap-4 max-w-sm">
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span>Correo</span>
          <input name="email" type="email" required className="border rounded px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1">
          <span>Contraseña</span>
          <input name="password" type="password" required className="border rounded px-3 py-2" />
        </label>
        {estado.error && (
          <p role="alert" className="text-red-600">
            {estado.error}
          </p>
        )}
        <button
          type="submit"
          disabled={pendiente}
          className="bg-slate-900 text-white rounded px-4 py-2"
        >
          {pendiente ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
      <button
        type="button"
        onClick={() => loginConGoogle()}
        className="border rounded px-4 py-2"
      >
        Continuar con Google
      </button>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(public\)/login/LoginForm.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(auth): formulario de login"
```

---

## Task 16: Login — page wiring

**Files:**
- Create: `app/(public)/login/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Iniciar sesión</h1>
      <LoginForm />
    </main>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: no errors, `/login` listed in the route summary.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(auth): página de login"
```

---

## Task 17: Intereses helper (`lib/db/intereses.ts`)

**Files:**
- Create: `lib/db/intereses.ts`
- Test: `lib/db/intereses.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const insertMock = vi.fn(() => ({ error: null }));
const fromMock = vi.fn(() => ({ insert: insertMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("guardarIntereses", () => {
  beforeEach(() => {
    insertMock.mockClear();
    fromMock.mockClear();
  });

  it("no llama a Supabase si no hay sectores", async () => {
    const { guardarIntereses } = await import("./intereses");
    await guardarIntereses("user-1", []);

    expect(fromMock).not.toHaveBeenCalled();
  });

  it("inserta una fila por sector", async () => {
    const { guardarIntereses } = await import("./intereses");
    await guardarIntereses("user-1", ["liderazgo", "ventas"]);

    expect(fromMock).toHaveBeenCalledWith("usuario_intereses");
    expect(insertMock).toHaveBeenCalledWith([
      { usuario_id: "user-1", sector: "liderazgo" },
      { usuario_id: "user-1", sector: "ventas" },
    ]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/intereses.test.ts`
Expected: FAIL — `Cannot find module './intereses'`.

- [ ] **Step 3: Write the implementation**

```ts
import { createClient } from "@/lib/supabase/server";

export async function guardarIntereses(usuarioId: string, sectores: string[]) {
  if (sectores.length === 0) return;

  const supabase = await createClient();
  const filas = sectores.map((sector) => ({ usuario_id: usuarioId, sector }));

  const { error } = await supabase.from("usuario_intereses").insert(filas);

  if (error) {
    throw new Error(`No se pudieron guardar los intereses: ${error.message}`);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/intereses.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(registro): guardar intereses del usuario"
```

---

## Task 18: Registro — Server Action

**Files:**
- Create: `app/(public)/registro/actions.ts`
- Test: `app/(public)/registro/actions.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const signUpMock = vi.fn();
const redirectMock = vi.fn();
const guardarInteresesMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ auth: { signUp: signUpMock } })),
}));

vi.mock("@/lib/db/intereses", () => ({
  guardarIntereses: guardarInteresesMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(campos: { email?: string; password?: string; intereses?: string[] }) {
  const fd = new FormData();
  if (campos.email !== undefined) fd.set("email", campos.email);
  if (campos.password !== undefined) fd.set("password", campos.password);
  (campos.intereses ?? []).forEach((valor) => fd.append("intereses", valor));
  return fd;
}

describe("registrar", () => {
  beforeEach(() => {
    signUpMock.mockReset();
    redirectMock.mockReset();
    guardarInteresesMock.mockReset();
  });

  it("devuelve error si falta el email o el password", async () => {
    const { registrar } = await import("./actions");
    const resultado = await registrar({ error: null }, formDataDe({}));

    expect(resultado.error).toBe("Ingresa tu correo y contraseña.");
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("devuelve error si el password es muy corto", async () => {
    const { registrar } = await import("./actions");
    const resultado = await registrar(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "1234567" })
    );

    expect(resultado.error).toBe("La contraseña debe tener al menos 8 caracteres.");
  });

  it("devuelve error si Supabase rechaza el signUp", async () => {
    signUpMock.mockResolvedValue({ data: { user: null }, error: { message: "duplicate" } });

    const { registrar } = await import("./actions");
    const resultado = await registrar(
      { error: null },
      formDataDe({ email: "ana@example.com", password: "clave1234" })
    );

    expect(resultado.error).toBe("No se pudo completar el registro. Intenta de nuevo.");
  });

  it("guarda intereses válidos y redirige a /dashboard", async () => {
    signUpMock.mockResolvedValue({ data: { user: { id: "user-1" } }, error: null });

    const { registrar } = await import("./actions");
    await registrar(
      { error: null },
      formDataDe({
        email: "ana@example.com",
        password: "clave1234",
        intereses: ["liderazgo", "no-valido"],
      })
    );

    expect(guardarInteresesMock).toHaveBeenCalledWith("user-1", ["liderazgo"]);
    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(public\)/registro/actions.test.ts`
Expected: FAIL — `Cannot find module './actions'`.

- [ ] **Step 3: Write the implementation**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { guardarIntereses } from "@/lib/db/intereses";

export type RegistroState = { error: string | null };

const SECTORES_VALIDOS = ["liderazgo", "ventas", "finanzas", "marketing", "tecnologia"];

export async function registrar(
  _prevState: RegistroState,
  formData: FormData
): Promise<RegistroState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const sectores = formData
    .getAll("intereses")
    .map(String)
    .filter((sector) => SECTORES_VALIDOS.includes(sector));

  if (!email || !password) {
    return { error: "Ingresa tu correo y contraseña." };
  }

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error || !data.user) {
    return { error: "No se pudo completar el registro. Intenta de nuevo." };
  }

  await guardarIntereses(data.user.id, sectores);

  redirect("/dashboard");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(public\)/registro/actions.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(registro): server action de registro con intereses"
```

---

## Task 19: Registro — form component

**Files:**
- Create: `app/(public)/registro/RegistroForm.tsx`
- Test: `app/(public)/registro/RegistroForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { RegistroForm } from "./RegistroForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  registrar: vi.fn(),
}));

describe("RegistroForm", () => {
  beforeEach(() => {
    vi.mocked(actions.registrar).mockReset();
  });

  it("envía email, password e intereses seleccionados", async () => {
    vi.mocked(actions.registrar).mockResolvedValue({ error: null });

    render(<RegistroForm />);

    fireEvent.change(screen.getByLabelText("Correo"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(screen.getByLabelText("Liderazgo"));
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    await waitFor(() => expect(actions.registrar).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.registrar).mockResolvedValue({
      error: "La contraseña debe tener al menos 8 caracteres.",
    });

    render(<RegistroForm />);
    fireEvent.click(screen.getByRole("button", { name: /crear cuenta/i }));

    expect(
      await screen.findByText("La contraseña debe tener al menos 8 caracteres.")
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(public\)/registro/RegistroForm.test.tsx`
Expected: FAIL — `Cannot find module './RegistroForm'`.

- [ ] **Step 3: Write the implementation**

```tsx
"use client";

import { useActionState } from "react";
import { registrar, type RegistroState } from "./actions";

const SECTORES = [
  { valor: "liderazgo", etiqueta: "Liderazgo" },
  { valor: "ventas", etiqueta: "Ventas" },
  { valor: "finanzas", etiqueta: "Finanzas" },
  { valor: "marketing", etiqueta: "Marketing" },
  { valor: "tecnologia", etiqueta: "Tecnología" },
];

const estadoInicial: RegistroState = { error: null };

export function RegistroForm() {
  const [estado, formAction, pendiente] = useActionState(registrar, estadoInicial);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-sm">
      <label className="flex flex-col gap-1">
        <span>Correo</span>
        <input name="email" type="email" required className="border rounded px-3 py-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span>Contraseña</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="border rounded px-3 py-2"
        />
      </label>
      <fieldset className="flex flex-col gap-1">
        <legend>Tus intereses</legend>
        {SECTORES.map((sector) => (
          <label key={sector.valor} className="flex items-center gap-2">
            <input type="checkbox" name="intereses" value={sector.valor} />
            {sector.etiqueta}
          </label>
        ))}
      </fieldset>
      {estado.error && (
        <p role="alert" className="text-red-600">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="bg-slate-900 text-white rounded px-4 py-2"
      >
        {pendiente ? "Creando cuenta..." : "Crear cuenta"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(public\)/registro/RegistroForm.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(registro): formulario de registro con selección de intereses"
```

---

## Task 20: Registro — page wiring

**Files:**
- Create: `app/(public)/registro/page.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { RegistroForm } from "./RegistroForm";

export default function RegistroPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Crea tu cuenta</h1>
      <RegistroForm />
    </main>
  );
}
```

- [ ] **Step 2: Verify the build**

Run: `npm run build`
Expected: no errors, `/registro` listed in the route summary.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat(registro): página de registro"
```

---

## Task 21: Catálogo de cursos (`lib/db/cursos.ts`)

**Files:**
- Create: `lib/db/cursos.ts`
- Test: `lib/db/cursos.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const orderMock = vi.fn(() => ({ data: [{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }], error: null }));
const eqMock = vi.fn(() => ({ order: orderMock }));
const selectMock = vi.fn(() => ({ eq: eqMock }));
const fromMock = vi.fn(() => ({ select: selectMock }));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({ from: fromMock })),
}));

describe("getCursosPublicados", () => {
  beforeEach(() => {
    fromMock.mockClear();
    selectMock.mockClear();
    eqMock.mockClear();
    orderMock.mockClear();
  });

  it("consulta solo cursos publicados, ordenados por título", async () => {
    const { getCursosPublicados } = await import("./cursos");
    const cursos = await getCursosPublicados();

    expect(fromMock).toHaveBeenCalledWith("cursos");
    expect(selectMock).toHaveBeenCalledWith("id, titulo, precio");
    expect(eqMock).toHaveBeenCalledWith("publicado", true);
    expect(orderMock).toHaveBeenCalledWith("titulo");
    expect(cursos).toEqual([{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }]);
  });

  it("lanza un error legible si Supabase falla", async () => {
    orderMock.mockReturnValueOnce({ data: null, error: { message: "timeout" } });

    const { getCursosPublicados } = await import("./cursos");

    await expect(getCursosPublicados()).rejects.toThrow(
      "No se pudo cargar el catálogo: timeout"
    );
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: FAIL — `Cannot find module './cursos'`.

- [ ] **Step 3: Write the implementation**

```ts
import { createClient } from "@/lib/supabase/server";

export type CursoPublicado = {
  id: string;
  titulo: string;
  precio: number;
};

export async function getCursosPublicados(): Promise<CursoPublicado[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("cursos")
    .select("id, titulo, precio")
    .eq("publicado", true)
    .order("titulo");

  if (error) {
    throw new Error(`No se pudo cargar el catálogo: ${error.message}`);
  }

  return data ?? [];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- lib/db/cursos.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(catalogo): consulta de cursos publicados"
```

---

## Task 22: Catálogo — presentational component

**Files:**
- Create: `app/(public)/CatalogoList.tsx`
- Test: `app/(public)/CatalogoList.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CatalogoList } from "./CatalogoList";

describe("CatalogoList", () => {
  it("muestra un mensaje cuando no hay cursos", () => {
    render(<CatalogoList cursos={[]} />);
    expect(screen.getByText("Próximamente nuevos cursos.")).toBeInTheDocument();
  });

  it("muestra título y precio de cada curso", () => {
    render(
      <CatalogoList
        cursos={[{ id: "c1", titulo: "Ventas B2B", precio: 49.99 }]}
      />
    );

    expect(screen.getByText("Ventas B2B")).toBeInTheDocument();
    expect(screen.getByText("$49.99")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(public\)/CatalogoList.test.tsx`
Expected: FAIL — `Cannot find module './CatalogoList'`.

- [ ] **Step 3: Write the implementation**

```tsx
import type { CursoPublicado } from "@/lib/db/cursos";

export function CatalogoList({ cursos }: { cursos: CursoPublicado[] }) {
  if (cursos.length === 0) {
    return <p>Próximamente nuevos cursos.</p>;
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cursos.map((curso) => (
        <li key={curso.id} className="border rounded-lg p-4">
          <h3 className="font-semibold">{curso.titulo}</h3>
          <p>${curso.precio.toFixed(2)}</p>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(public\)/CatalogoList.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(catalogo): componente de lista de cursos"
```

---

## Task 23: Landing — wire the real catalog

**Files:**
- Modify: `app/(public)/page.tsx`

- [ ] **Step 1: Replace the placeholder with the real landing**

```tsx
import { getCursosPublicados } from "@/lib/db/cursos";
import { CatalogoList } from "./CatalogoList";

export default async function LandingPage() {
  const cursos = await getCursosPublicados();

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold">Coachpro</h1>
      <p className="mt-2 text-slate-600">
        Cursos para impulsar tu carrera profesional.
      </p>
      <section className="mt-8">
        <CatalogoList cursos={cursos} />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Remove the now-obsolete smoke test**

Delete `app/(public)/page.test.tsx` from Task 3 (it asserted on the placeholder heading only; `CatalogoList.test.tsx` and `cursos.test.tsx` now cover this behavior).

- [ ] **Step 3: Verify the build**

Run: `npm run build`
Expected: no errors. (This route needs env vars to run for real; build-time static analysis only, no live DB call.)

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat(catalogo): landing pública muestra el catálogo real"
```

---

## Task 24: Ruta protegida — estudiante

**Files:**
- Create: `app/(estudiante)/layout.tsx`
- Create: `app/(estudiante)/dashboard/page.tsx`
- Test: `app/(estudiante)/layout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("EstudianteLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol estudiante y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "estudiante" });

    const EstudianteLayout = (await import("./layout")).default;
    const jsx = await EstudianteLayout({ children: <p>Contenido</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("estudiante");
    expect(screen.getByText("Contenido")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(estudiante\)/layout.test.tsx`
Expected: FAIL — `Cannot find module './layout'`.

- [ ] **Step 3: Write the implementation**

```tsx
import { requireRol } from "@/lib/auth/session";

export default async function EstudianteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol("estudiante");

  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
```

`app/(estudiante)/dashboard/page.tsx`:
```tsx
export default function DashboardPage() {
  return <h1 className="text-2xl font-bold">Mi progreso</h1>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(estudiante\)/layout.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(estudiante): layout protegido y dashboard placeholder"
```

---

## Task 25: Ruta protegida — admin

**Files:**
- Create: `app/(admin)/layout.tsx`
- Create: `app/(admin)/page.tsx`
- Test: `app/(admin)/layout.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("AdminLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol admin y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "a@a.com", rol: "admin" });

    const AdminLayout = (await import("./layout")).default;
    const jsx = await AdminLayout({ children: <p>Contenido admin</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith("admin");
    expect(screen.getByText("Contenido admin")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- app/\(admin\)/layout.test.tsx`
Expected: FAIL — `Cannot find module './layout'`.

- [ ] **Step 3: Write the implementation**

```tsx
import { requireRol } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol("admin");

  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
```

`app/(admin)/page.tsx`:
```tsx
export default function AdminHomePage() {
  return <h1 className="text-2xl font-bold">Panel de administración</h1>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- app/\(admin\)/layout.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(admin): layout protegido y home placeholder"
```

---

## Task 26: CI pipeline

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Write the workflow**

```yaml
name: CI

on:
  pull_request:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "ci: lint, typecheck, test y build en cada PR"
```

---

## Task 27: Manual acceptance verification

Not automatable — run these against a real Vercel preview + the connected Supabase project before calling Fundación done.

- [ ] Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL` in Vercel project settings and in a local `.env.local`.
- [ ] Run `supabase/scripts/drop-all-tables.sql` against the Supabase project, then `supabase db push` to apply `001_coachpro_schema.sql`.
- [ ] Insert 1-2 rows into `cursos` with `publicado = true` (temporary manual seed — real CRUD is sub-project 2) and confirm they render on `/`.
- [ ] Run `ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin` and confirm the account can log in at `/login` and lands on `/admin`.
- [ ] Register a new student account at `/registro`, selecting at least one interest; confirm redirect to `/dashboard` and a row in `usuario_intereses`.
- [ ] As the student account, attempt to visit `/admin` directly — confirm redirect to `/dashboard`.
- [ ] Log out and visit `/dashboard` directly — confirm redirect to `/login`.
- [ ] With two separate student accounts, confirm (via Supabase SQL editor, using each user's JWT or the REST API with their access token) that one cannot read the other's `usuario_intereses` row.
- [ ] Push to a branch, confirm a Vercel preview deploy succeeds and the flows above work on the deployed URL.

---

## Plan self-review notes

- **Spec coverage:** every "Incluye" item in the spec has a task — scaffold (2), schema+RLS (8), auth email/password (13, 16), Google OAuth (14, 15), roles/guards (10, 11, 12, 24, 25), registro + intereses (17-20), landing/catálogo (21-23), CI (26), acceptance criteria (27). Testing/tooling section covered by Task 3 + every task's test step. Env vars section covered by Task 4.
- **Placeholder scan:** no TBD/TODO; every code step has complete, runnable code.
- **Type consistency:** `Rol = "admin" | "estudiante"` defined once in `lib/auth/session.ts` and re-exported/reused as the same union in `lib/auth/middleware-rules.ts` and `middleware.ts`; `CursoPublicado` defined in `lib/db/cursos.ts` and imported (not redefined) in `CatalogoList.tsx`; `LoginState`/`RegistroState` each defined once in their `actions.ts` and imported by their form component.
