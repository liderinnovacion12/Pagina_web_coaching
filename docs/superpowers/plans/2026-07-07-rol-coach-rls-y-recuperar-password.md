# Rol coach con RLS ampliado y recuperar contraseña real Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Agregar un tercer rol (`coach`) con RLS propio sobre sus cursos, implementar el flujo real de recuperar/actualizar contraseña vía Supabase Auth, y limpiar los archivos SQL que quedaron desalineados del esquema vigente.

**Architecture:** Todo el trabajo de base de datos vive en nuevas migraciones SQL (`004`, `005`) sobre el esquema ya existente en `supabase/migrations/001-003`, sin tocar las políticas de admin/estudiante ya probadas. El código de la app sigue el mismo patrón ya establecido: Server Actions con `useActionState` para formularios, helpers puros en `lib/auth/` para reglas de rol, y route groups `app/(rol)/` para proteger páginas. El flujo de recuperar contraseña reutiliza `/auth/callback` (ya existente para OAuth) agregándole un parámetro `next` para redirigir también al flujo de recuperación.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, `@supabase/ssr` + `@supabase/supabase-js`, Vitest + React Testing Library, Tailwind CSS, framer-motion, lucide-react.

**Spec:** `docs/superpowers/specs/2026-07-07-rol-coach-rls-y-recuperar-password-design.md`

---

## Task 1: Migración SQL — enum `coach`

**Files:**
- Create: `supabase/migrations/004_rol_coach_enum.sql`

Postgres no permite usar un valor de enum recién agregado (`ALTER TYPE ... ADD VALUE`) dentro de la misma transacción en la que se agregó — y la migración 005 usa el literal `'coach'` en `is_coach()`. Por eso el enum se agrega en su propio archivo/ejecución, separado de las políticas.

Esta tarea es SQL puro sin cobertura de Vitest — se verifica aplicándola manualmente en el SQL Editor de Supabase (igual que las migraciones 001-003).

- [ ] **Step 1: Escribir la migración**

```sql
-- 004_rol_coach_enum.sql
-- Agrega el valor 'coach' al enum rol_usuario. Debe aplicarse en su propia
-- ejecucion, separado de 005_rol_coach_rls.sql: Postgres no permite usar
-- un valor de enum recien agregado dentro de la misma transaccion en la
-- que se agrego, y 005 usa el literal 'coach' en is_coach().

alter type rol_usuario add value 'coach';
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/004_rol_coach_enum.sql
git commit -m "feat(db): agregar valor 'coach' al enum rol_usuario"
```

---

## Task 2: Migración SQL — columna `coach_id` y políticas RLS

**Files:**
- Create: `supabase/migrations/005_rol_coach_rls.sql`

Depende de que 004 ya se haya aplicado (requiere que el valor `'coach'` del enum exista). Sin cobertura de Vitest — verificación manual.

- [ ] **Step 1: Escribir la migración**

```sql
-- 005_rol_coach_rls.sql
-- Agrega el modelo de propiedad de cursos por coach y las politicas RLS
-- correspondientes. Requiere que 004_rol_coach_enum.sql ya se haya
-- aplicado (el valor 'coach' del enum rol_usuario debe existir).
--
-- Modelo: un curso pertenece a un coach via cursos.coach_id. Un coach
-- solo puede operar sobre sus propios cursos y las lecciones de esos
-- cursos, y solo puede LEER (no escribir) inscripciones/progreso/
-- quiz_intentos de sus estudiantes. Admin conserva acceso total via las
-- politicas *_admin_all ya existentes (001_coachpro_schema.sql), que no
-- se modifican. El trigger prevent_rol_self_escalation_trigger (002/003)
-- ya bloquea que un usuario no-admin se auto-promueva a 'coach'.

alter table cursos add column coach_id uuid references usuarios(id);
create index cursos_coach_id_idx on cursos(coach_id);

create or replace function is_coach()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and rol = 'coach'
  );
$$;

-- CURSOS: el coach ve y gestiona solo lo suyo (incluye no publicados)
create policy "cursos_coach_select_own" on cursos
  for select using (coach_id = auth.uid());
create policy "cursos_coach_write_own" on cursos
  for insert with check (coach_id = auth.uid() and is_coach());
create policy "cursos_coach_update_own" on cursos
  for update using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "cursos_coach_delete_own" on cursos
  for delete using (coach_id = auth.uid());

-- LECCIONES: el coach gestiona lecciones de sus propios cursos
create policy "lecciones_coach_own" on lecciones for all
  using (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()))
  with check (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()));

-- INSCRIPCIONES / PROGRESO / QUIZ_INTENTOS: el coach solo lee (sin insert/update/delete)
create policy "inscripciones_coach_select" on inscripciones for select using (
  exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid())
);

create policy "progreso_coach_select" on progreso for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);

create policy "quiz_intentos_coach_select" on quiz_intentos for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);
```

- [ ] **Step 2: Commit**

```bash
git add supabase/migrations/005_rol_coach_rls.sql
git commit -m "feat(db): coach_id en cursos y RLS del rol coach"
```

> **Nota de aplicación manual:** aplica `004_rol_coach_enum.sql` y `005_rol_coach_rls.sql` en ese orden en el SQL Editor de Supabase. Para verificar: promueve una cuenta demo a `coach` (ver Task 3), asígnale `coach_id` en un curso existente, e inicia sesión con esa cuenta para confirmar que solo ve/edita ese curso y sus lecciones, y que puede leer (no escribir) el progreso de estudiantes inscritos en él.

---

## Task 3: Limpiar SQL legacy desalineado

**Files:**
- Delete: `supabase/schema.sql`
- Modify: `supabase/scripts/seed-demo-users.sql`

`supabase/schema.sql` es el esquema completo (en inglés: `profiles`/`videos`/`coaches`/`chat_sessions`) del proyecto Vite anterior — no lo referencia ninguna migración activa ni el código de la app. `seed-demo-users.sql` sí se usa (script manual, no migración) pero quedó referenciando `profiles`/`role`, que ya no existen; el esquema vigente usa `usuarios`/`rol`.

- [ ] **Step 1: Eliminar el esquema legacy**

```bash
git rm supabase/schema.sql
```

- [ ] **Step 2: Reescribir `seed-demo-users.sql` contra el esquema vigente**

```sql
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Este script NO es una migracion: promueve cuentas demo ya creadas
-- via Auth (admin@test.com / user@test.com), que se muestran como hint
-- en la pagina de login, para que las verificaciones locales puedan
-- iniciar sesion contra el proyecto real de Supabase.
--
-- El trigger on_auth_user_created (migracion 001_coachpro_schema.sql)
-- siempre crea la fila en usuarios con rol='estudiante', asi que este
-- script corrige el rol de admin@test.com.

update usuarios
set rol = 'admin'
where id = (select id from auth.users where email = 'admin@test.com');

update usuarios
set rol = 'estudiante'
where id = (select id from auth.users where email = 'user@test.com');

-- Opcional: promover una cuenta demo a coach y asignarle un curso existente.
-- update usuarios set rol = 'coach' where id = (select id from auth.users where email = 'coach@test.com');
-- update cursos set coach_id = (select id from auth.users where email = 'coach@test.com') where id = '<curso-id>';
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore(db): eliminar schema.sql legacy y alinear seed-demo-users.sql con el esquema vigente"
```

---

## Task 4: Rol `coach` en las reglas de middleware

**Files:**
- Modify: `lib/auth/middleware-rules.ts`
- Test: `lib/auth/middleware-rules.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Reemplaza el contenido completo de `lib/auth/middleware-rules.test.ts`:

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
    expect(calcularRedireccion("/coach", null)).toBe("/login");
  });

  it("redirige a un estudiante fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "estudiante")).toBe("/dashboard");
  });

  it("redirige a un estudiante fuera de /coach", () => {
    expect(calcularRedireccion("/coach", "estudiante")).toBe("/dashboard");
  });

  it("redirige a un coach fuera de /admin", () => {
    expect(calcularRedireccion("/admin", "coach")).toBe("/coach");
  });

  it("permite a un estudiante entrar a /dashboard", () => {
    expect(calcularRedireccion("/dashboard", "estudiante")).toBeNull();
  });

  it("permite a un coach entrar a /coach y a /dashboard", () => {
    expect(calcularRedireccion("/coach", "coach")).toBeNull();
    expect(calcularRedireccion("/dashboard", "coach")).toBeNull();
  });

  it("permite a un admin entrar a /admin, /coach y /dashboard", () => {
    expect(calcularRedireccion("/admin", "admin")).toBeNull();
    expect(calcularRedireccion("/coach", "admin")).toBeNull();
    expect(calcularRedireccion("/dashboard", "admin")).toBeNull();
  });
});
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: FAIL — los casos de `/coach` no existen todavía en `calcularRedireccion` (la implementación actual no conoce el rol `"coach"` ni el prefijo `/coach`).

- [ ] **Step 3: Implementar**

Reemplaza el contenido completo de `lib/auth/middleware-rules.ts`:

```ts
export type Rol = "admin" | "estudiante" | "coach";

const PREFIJO_ESTUDIANTE = "/dashboard";
const PREFIJO_ADMIN = "/admin";
const PREFIJO_COACH = "/coach";

function destinoPorRol(rol: Rol): string {
  if (rol === "admin") return "/admin";
  if (rol === "coach") return "/coach";
  return "/dashboard";
}

export function calcularRedireccion(
  pathname: string,
  rol: Rol | null
): string | null {
  const esRutaEstudiante = pathname.startsWith(PREFIJO_ESTUDIANTE);
  const esRutaAdmin = pathname.startsWith(PREFIJO_ADMIN);
  const esRutaCoach = pathname.startsWith(PREFIJO_COACH);

  if (!esRutaEstudiante && !esRutaAdmin && !esRutaCoach) return null;
  if (rol === null) return "/login";
  if (esRutaAdmin && rol !== "admin") return destinoPorRol(rol);
  if (esRutaCoach && rol !== "admin" && rol !== "coach") return destinoPorRol(rol);

  return null;
}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `npm test -- lib/auth/middleware-rules.test.ts`
Expected: PASS (8 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/middleware-rules.ts lib/auth/middleware-rules.test.ts
git commit -m "feat(auth): agregar rol coach y ruta /coach a las reglas de middleware"
```

---

## Task 5: `requireRol` acepta múltiples roles

**Files:**
- Modify: `lib/auth/session.ts`
- Test: `lib/auth/session.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Reemplaza el contenido completo de `lib/auth/session.test.ts`:

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

  it("redirige a /dashboard si un estudiante intenta acceder a coach", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "ana@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "estudiante" } });

    const { requireRol } = await import("./session");
    await requireRol("coach");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("permite a un admin acceder cuando la ruta acepta varios roles", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "admin@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "admin" } });

    const { requireRol } = await import("./session");
    const sesion = await requireRol(["coach", "admin"]);

    expect(redirectMock).not.toHaveBeenCalled();
    expect(sesion.rol).toBe("admin");
  });

  it("redirige a /coach si un coach intenta acceder a una ruta restringida a admin", async () => {
    getUserMock.mockResolvedValue({
      data: { user: { id: "user-1", email: "coach@example.com" } },
    });
    singleMock.mockResolvedValue({ data: { rol: "coach" } });

    const { requireRol } = await import("./session");
    await requireRol(["admin"]);

    expect(redirectMock).toHaveBeenCalledWith("/coach");
  });
});
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `npm test -- lib/auth/session.test.ts`
Expected: FAIL — `requireRol` no acepta arreglos de roles ni conoce `"coach"` todavía.

- [ ] **Step 3: Implementar**

Reemplaza el contenido completo de `lib/auth/session.ts`:

```ts
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Rol = "admin" | "estudiante" | "coach";

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

export async function requireRol(
  rolesPermitidos: Rol | Rol[]
): Promise<SesionUsuario> {
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  const sesion = await getSesionUsuario();

  if (!sesion) {
    redirect("/login");
    return sesion as never;
  }

  if (!roles.includes(sesion.rol)) {
    redirect(
      sesion.rol === "admin"
        ? "/admin"
        : sesion.rol === "coach"
          ? "/coach"
          : "/dashboard"
    );
    return sesion as never;
  }

  return sesion;
}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `npm test -- lib/auth/session.test.ts`
Expected: PASS (7 tests).

- [ ] **Step 5: Commit**

```bash
git add lib/auth/session.ts lib/auth/session.test.ts
git commit -m "feat(auth): requireRol acepta un rol o un arreglo de roles permitidos"
```

---

## Task 6: Route group `(coach)` — layout protegido

**Files:**
- Create: `app/(coach)/layout.tsx`
- Test: `app/(coach)/layout.test.tsx`

Sigue el mismo patrón que `app/(admin)/layout.tsx` y `app/(estudiante)/layout.tsx`.

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

const requireRolMock = vi.fn();

vi.mock("@/lib/auth/session", () => ({
  requireRol: requireRolMock,
}));

describe("CoachLayout", () => {
  beforeEach(() => {
    requireRolMock.mockReset();
  });

  it("exige el rol coach o admin y renderiza los hijos", async () => {
    requireRolMock.mockResolvedValue({ id: "u1", email: "c@c.com", rol: "coach" });

    const CoachLayout = (await import("./layout")).default;
    const jsx = await CoachLayout({ children: <p>Contenido coach</p> });
    render(jsx);

    expect(requireRolMock).toHaveBeenCalledWith(["coach", "admin"]);
    expect(screen.getByText("Contenido coach")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

Run: `npm test -- "app/(coach)/layout.test.tsx"`
Expected: FAIL — `Cannot find module './layout'`.

- [ ] **Step 3: Implementar**

```tsx
import { requireRol } from "@/lib/auth/session";

export default async function CoachLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireRol(["coach", "admin"]);

  return <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>;
}
```

- [ ] **Step 4: Ejecutar el test para confirmar que pasa**

Run: `npm test -- "app/(coach)/layout.test.tsx"`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add "app/(coach)/layout.tsx" "app/(coach)/layout.test.tsx"
git commit -m "feat(coach): layout protegido para el route group (coach)"
```

---

## Task 7: Página placeholder `/coach`

**Files:**
- Create: `app/(coach)/coach/page.tsx`

Sigue el mismo patrón que `app/(admin)/admin/page.tsx` y `app/(estudiante)/dashboard/page.tsx` (páginas simples sin lógica, sin test dedicado — la protección ya está cubierta por el layout de Task 6).

- [ ] **Step 1: Escribir la página**

```tsx
export default function CoachHomePage() {
  return (
    <h1 className="text-2xl font-bold">Panel de coach (en construcción)</h1>
  );
}
```

- [ ] **Step 2: Verificar que el build compila**

Run: `npm run build`
Expected: sin errores, `/coach` listado en el resumen de rutas.

- [ ] **Step 3: Commit**

```bash
git add "app/(coach)/coach/page.tsx"
git commit -m "feat(coach): placeholder de la página /coach"
```

---

## Task 8: Server Action de recuperar contraseña

**Files:**
- Create: `app/(public)/recuperar-password/actions.ts`
- Test: `app/(public)/recuperar-password/actions.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const resetPasswordForEmailMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: { resetPasswordForEmail: resetPasswordForEmailMock },
  })),
}));

function formDataDe(email: string) {
  const fd = new FormData();
  fd.set("email", email);
  return fd;
}

describe("solicitarRecuperacion", () => {
  beforeEach(() => {
    resetPasswordForEmailMock.mockReset();
    process.env.NEXT_PUBLIC_SITE_URL = "http://localhost:3000";
  });

  it("devuelve error si el correo tiene formato inválido", async () => {
    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("no-es-un-correo")
    );

    expect(resultado).toEqual({
      enviado: false,
      error: "Ingresa un correo electrónico válido.",
    });
    expect(resetPasswordForEmailMock).not.toHaveBeenCalled();
  });

  it("llama a resetPasswordForEmail con el redirectTo correcto y responde con éxito", async () => {
    resetPasswordForEmailMock.mockResolvedValue({ data: {}, error: null });

    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("ana@example.com")
    );

    expect(resetPasswordForEmailMock).toHaveBeenCalledWith("ana@example.com", {
      redirectTo: "http://localhost:3000/auth/callback?next=/actualizar-password",
    });
    expect(resultado).toEqual({ enviado: true, error: null });
  });

  it("responde con éxito aunque Supabase devuelva un error (no revela si el correo existe)", async () => {
    resetPasswordForEmailMock.mockResolvedValue({
      data: {},
      error: { message: "user not found" },
    });

    const { solicitarRecuperacion } = await import("./actions");
    const resultado = await solicitarRecuperacion(
      { enviado: false, error: null },
      formDataDe("nadie@example.com")
    );

    expect(resultado).toEqual({ enviado: true, error: null });
  });
});
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

Run: `npm test -- "app/(public)/recuperar-password/actions.test.ts"`
Expected: FAIL — `Cannot find module './actions'`.

- [ ] **Step 3: Implementar**

```ts
"use server";

import { createClient } from "@/lib/supabase/server";

export type RecuperarPasswordState = { enviado: boolean; error: string | null };

export async function solicitarRecuperacion(
  _prevState: RecuperarPasswordState,
  formData: FormData
): Promise<RecuperarPasswordState> {
  const email = String(formData.get("email") ?? "").trim();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { enviado: false, error: "Ingresa un correo electrónico válido." };
  }

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback?next=/actualizar-password`,
  });

  // Siempre se responde con éxito genérico, exista o no la cuenta,
  // para no revelar qué correos están registrados.
  return { enviado: true, error: null };
}
```

- [ ] **Step 4: Ejecutar el test para confirmar que pasa**

Run: `npm test -- "app/(public)/recuperar-password/actions.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/recuperar-password/actions.ts" "app/(public)/recuperar-password/actions.test.ts"
git commit -m "feat(auth): server action para solicitar recuperación de contraseña"
```

---

## Task 9: Conectar `RecuperarPasswordForm` a la acción real

**Files:**
- Modify: `app/(public)/recuperar-password/RecuperarPasswordForm.tsx`
- Modify: `app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx`

- [ ] **Step 1: Escribir los tests que fallan**

Reemplaza el contenido completo de `RecuperarPasswordForm.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RecuperarPasswordForm } from "./RecuperarPasswordForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  solicitarRecuperacion: vi.fn(),
}));

describe("RecuperarPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(actions.solicitarRecuperacion).mockReset();
  });

  it("muestra un error si el correo es inválido", async () => {
    vi.mocked(actions.solicitarRecuperacion).mockResolvedValue({
      enviado: false,
      error: "Ingresa un correo electrónico válido.",
    });

    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "no-es-un-correo" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      await screen.findByText("Ingresa un correo electrónico válido.")
    ).toBeInTheDocument();
  });

  it("muestra el mensaje de confirmación tras enviar un correo válido", async () => {
    vi.mocked(actions.solicitarRecuperacion).mockResolvedValue({
      enviado: true,
      error: null,
    });

    render(<RecuperarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Correo electrónico"), {
      target: { value: "ana@example.com" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /enviar instrucciones/i })
    );

    expect(
      await screen.findByText(/recibirás instrucciones/i)
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `npm test -- "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx"`
Expected: FAIL — el componente actual no importa `solicitarRecuperacion` ni usa `useActionState`, así que el mock nunca se llama y las aserciones asíncronas (`findByText`) no encuentran el texto esperado a tiempo.

- [ ] **Step 3: Implementar**

Reemplaza el contenido completo de `RecuperarPasswordForm.tsx`:

```tsx
"use client";

import { useActionState } from "react";
import { Mail } from "lucide-react";
import { solicitarRecuperacion, type RecuperarPasswordState } from "./actions";

const estadoInicial: RecuperarPasswordState = { enviado: false, error: null };

export function RecuperarPasswordForm() {
  const [estado, formAction, pendiente] = useActionState(
    solicitarRecuperacion,
    estadoInicial
  );

  if (estado.enviado) {
    return (
      <p role="status" className="text-center text-mist-300">
        Si el correo existe en nuestro sistema, recibirás instrucciones para
        restablecer tu contraseña.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-mist-300">
          Correo electrónico
        </label>
        <div className="relative">
          <Mail
            aria-hidden="true"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
          />
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="correo@ejemplo.com"
            aria-invalid={Boolean(estado.error)}
            aria-describedby={estado.error ? "email-error" : undefined}
            className="h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-4 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]"
          />
        </div>
        {estado.error && (
          <p id="email-error" role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={pendiente}
        className="h-[52px] rounded-xl bg-gold-500 font-semibold text-ink-950 transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pendiente ? "Enviando..." : "Enviar instrucciones"}
      </button>
    </form>
  );
}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `npm test -- "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx"`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/recuperar-password/RecuperarPasswordForm.tsx" "app/(public)/recuperar-password/RecuperarPasswordForm.test.tsx"
git commit -m "feat(auth): conectar RecuperarPasswordForm a supabase.auth.resetPasswordForEmail"
```

---

## Task 10: `/auth/callback` soporta `next`

**Files:**
- Modify: `app/auth/callback/route.ts`
- Modify: `app/auth/callback/route.test.ts`

- [ ] **Step 1: Escribir los tests que fallan**

Reemplaza el contenido completo de `route.test.ts`:

```ts
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

  it("intercambia el code y redirige a /dashboard cuando no hay next", async () => {
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

  it("intercambia el code y redirige al next indicado", async () => {
    exchangeCodeForSessionMock.mockResolvedValue({ error: null });

    const { GET } = await import("./route");
    const respuesta = await GET(
      new Request(
        "http://localhost/auth/callback?code=abc123&next=/actualizar-password"
      )
    );

    expect(respuesta.headers.get("location")).toBe(
      "http://localhost/actualizar-password"
    );
  });
});
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `npm test -- app/auth/callback/route.test.ts`
Expected: FAIL — el caso de `next` recibe `/dashboard` en vez de `/actualizar-password`, porque la implementación actual ignora ese parámetro.

- [ ] **Step 3: Implementar**

Reemplaza el contenido completo de `route.ts`:

```ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth`);
  }

  return NextResponse.redirect(`${origin}${next}`);
}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `npm test -- app/auth/callback/route.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add app/auth/callback/route.ts app/auth/callback/route.test.ts
git commit -m "feat(auth): soportar parámetro next en /auth/callback para el flujo de recuperación"
```

---

## Task 11: Server Action de actualizar contraseña

**Files:**
- Create: `app/(public)/actualizar-password/actions.ts`
- Test: `app/(public)/actualizar-password/actions.test.ts`

- [ ] **Step 1: Escribir el test que falla**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const getUserMock = vi.fn();
const updateUserMock = vi.fn();
const signOutMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(async () => ({
    auth: {
      getUser: getUserMock,
      updateUser: updateUserMock,
      signOut: signOutMock,
    },
  })),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

function formDataDe(password: string, confirmacion: string) {
  const fd = new FormData();
  fd.set("password", password);
  fd.set("confirmacion", confirmacion);
  return fd;
}

describe("actualizarPassword", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    updateUserMock.mockReset();
    signOutMock.mockReset();
    redirectMock.mockReset();
  });

  it("devuelve error si la contraseña tiene menos de 8 caracteres", async () => {
    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("1234567", "1234567")
    );

    expect(resultado.error).toBe(
      "La contraseña debe tener al menos 8 caracteres."
    );
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("devuelve error si las contraseñas no coinciden", async () => {
    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave9999")
    );

    expect(resultado.error).toBe("Las contraseñas no coinciden.");
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("redirige a /login?error=recovery si no hay sesión activa", async () => {
    getUserMock.mockResolvedValue({ data: { user: null } });

    const { actualizarPassword } = await import("./actions");
    await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(redirectMock).toHaveBeenCalledWith("/login?error=recovery");
    expect(updateUserMock).not.toHaveBeenCalled();
  });

  it("devuelve error si Supabase rechaza la actualización", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    updateUserMock.mockResolvedValue({ error: { message: "fail" } });

    const { actualizarPassword } = await import("./actions");
    const resultado = await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(resultado.error).toBe(
      "No se pudo actualizar la contraseña. Intenta de nuevo."
    );
    expect(signOutMock).not.toHaveBeenCalled();
  });

  it("cierra la sesión y redirige a /login?reset=ok cuando la actualización es exitosa", async () => {
    getUserMock.mockResolvedValue({ data: { user: { id: "user-1" } } });
    updateUserMock.mockResolvedValue({ error: null });

    const { actualizarPassword } = await import("./actions");
    await actualizarPassword(
      { error: null },
      formDataDe("clave1234", "clave1234")
    );

    expect(updateUserMock).toHaveBeenCalledWith({ password: "clave1234" });
    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/login?reset=ok");
  });
});
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

Run: `npm test -- "app/(public)/actualizar-password/actions.test.ts"`
Expected: FAIL — `Cannot find module './actions'`.

- [ ] **Step 3: Implementar**

```ts
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type ActualizarPasswordState = { error: string | null };

export async function actualizarPassword(
  _prevState: ActualizarPasswordState,
  formData: FormData
): Promise<ActualizarPasswordState> {
  const password = String(formData.get("password") ?? "");
  const confirmacion = String(formData.get("confirmacion") ?? "");

  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }
  if (password !== confirmacion) {
    return { error: "Las contraseñas no coinciden." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=recovery");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: "No se pudo actualizar la contraseña. Intenta de nuevo." };
  }

  await supabase.auth.signOut();
  redirect("/login?reset=ok");
}
```

- [ ] **Step 4: Ejecutar el test para confirmar que pasa**

Run: `npm test -- "app/(public)/actualizar-password/actions.test.ts"`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/actualizar-password/actions.ts" "app/(public)/actualizar-password/actions.test.ts"
git commit -m "feat(auth): server action para actualizar la contraseña tras recuperación"
```

---

## Task 12: Formulario de actualizar contraseña

**Files:**
- Create: `app/(public)/actualizar-password/ActualizarPasswordForm.tsx`
- Test: `app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx`

- [ ] **Step 1: Escribir el test que falla**

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ActualizarPasswordForm } from "./ActualizarPasswordForm";
import * as actions from "./actions";

vi.mock("./actions", () => ({
  actualizarPassword: vi.fn(),
}));

describe("ActualizarPasswordForm", () => {
  beforeEach(() => {
    vi.mocked(actions.actualizarPassword).mockReset();
  });

  it("envía la nueva contraseña y su confirmación", async () => {
    vi.mocked(actions.actualizarPassword).mockResolvedValue({ error: null });

    render(<ActualizarPasswordForm />);

    fireEvent.change(screen.getByLabelText("Nueva contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.change(screen.getByLabelText("Confirmar contraseña"), {
      target: { value: "clave1234" },
    });
    fireEvent.click(
      screen.getByRole("button", { name: /guardar contraseña/i })
    );

    await waitFor(() => expect(actions.actualizarPassword).toHaveBeenCalled());
  });

  it("muestra el error devuelto por la acción", async () => {
    vi.mocked(actions.actualizarPassword).mockResolvedValue({
      error: "Las contraseñas no coinciden.",
    });

    render(<ActualizarPasswordForm />);
    fireEvent.click(
      screen.getByRole("button", { name: /guardar contraseña/i })
    );

    expect(
      await screen.findByText("Las contraseñas no coinciden.")
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Ejecutar el test para confirmar que falla**

Run: `npm test -- "app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx"`
Expected: FAIL — `Cannot find module './ActualizarPasswordForm'`.

- [ ] **Step 3: Implementar**

```tsx
"use client";

import { useState } from "react";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";
import { actualizarPassword, type ActualizarPasswordState } from "./actions";

const estadoInicial: ActualizarPasswordState = { error: null };

const CAMPO_CLASES =
  "h-[52px] w-full rounded-xl border border-white/10 bg-ink-950 pl-11 pr-11 text-base text-white placeholder:text-mist-500 outline-none transition duration-150 hover:border-white/20 focus:border-gold-500/60 focus:shadow-[0_0_0_4px_rgba(217,169,78,0.12)]";

export function ActualizarPasswordForm() {
  const [estado, formAction, pendiente] = useActionState(
    actualizarPassword,
    estadoInicial
  );
  const [mostrarPassword, setMostrarPassword] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <form action={formAction} className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-medium text-mist-300">
            Nueva contraseña
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="password"
              name="password"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={CAMPO_CLASES}
            />
            <button
              type="button"
              onClick={() => setMostrarPassword((valor) => !valor)}
              aria-label={
                mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              className="absolute inset-y-0 right-0 flex items-center rounded-r-xl px-4 text-mist-500 transition hover:text-mist-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60"
            >
              {mostrarPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label
            htmlFor="confirmacion"
            className="text-sm font-medium text-mist-300"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <Lock
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-mist-500"
            />
            <input
              id="confirmacion"
              name="confirmacion"
              type={mostrarPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="••••••••"
              className={CAMPO_CLASES}
            />
          </div>
        </div>

        {estado.error && (
          <p role="alert" className="text-sm text-rose-400">
            {estado.error}
          </p>
        )}

        <motion.button
          type="submit"
          disabled={pendiente}
          whileHover={pendiente ? undefined : { y: -2 }}
          transition={{ duration: 0.15 }}
          className="flex h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 font-semibold text-ink-950 shadow-[0_8px_24px_rgba(217,169,78,0.25)] transition-colors duration-150 hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-900 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pendiente && (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          )}
          {pendiente ? "Guardando..." : "Guardar contraseña"}
        </motion.button>
      </form>
    </motion.div>
  );
}
```

- [ ] **Step 4: Ejecutar el test para confirmar que pasa**

Run: `npm test -- "app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx"`
Expected: PASS (2 tests).

- [ ] **Step 5: Commit**

```bash
git add "app/(public)/actualizar-password/ActualizarPasswordForm.tsx" "app/(public)/actualizar-password/ActualizarPasswordForm.test.tsx"
git commit -m "feat(auth): formulario de actualizar contraseña"
```

---

## Task 13: Página `/actualizar-password`

**Files:**
- Create: `app/(public)/actualizar-password/page.tsx`

Sigue el mismo patrón visual que `app/(public)/recuperar-password/page.tsx`. Sin test dedicado (igual que esa página y que `login/page.tsx`, que tampoco lo tienen — la lógica ya está cubierta por `ActualizarPasswordForm.test.tsx`).

- [ ] **Step 1: Escribir la página**

```tsx
import type { Metadata } from "next";
import Link from "next/link";
import { ActualizarPasswordForm } from "./ActualizarPasswordForm";

export const metadata: Metadata = {
  title: "Actualizar contraseña | CoachPro",
  description: "Establece una nueva contraseña para tu cuenta de CoachPro.",
};

export default function ActualizarPasswordPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-ink-950 bg-grain px-6 py-16">
      <Link
        href="/"
        className="rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
      >
        COACH<span className="text-gold-400">PRO</span>
        <span className="text-gold-400"> •</span>
      </Link>

      <div className="mt-10 w-full max-w-sm">
        <h1 className="text-center font-display text-[42px] font-bold leading-tight text-white">
          Nueva contraseña
        </h1>
        <p className="mt-2 text-center text-lg text-mist-400">
          Elige una contraseña nueva para tu cuenta.
        </p>

        <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12">
          <ActualizarPasswordForm />
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Verificar que el build compila**

Run: `npm run build`
Expected: sin errores, `/actualizar-password` listado en el resumen de rutas.

- [ ] **Step 3: Commit**

```bash
git add "app/(public)/actualizar-password/page.tsx"
git commit -m "feat(auth): página /actualizar-password"
```

---

## Task 14: Banner de éxito en el login tras restablecer contraseña

**Files:**
- Modify: `app/(public)/login/LoginForm.tsx`
- Modify: `app/(public)/login/LoginForm.test.tsx`
- Modify: `app/(public)/login/page.tsx`

- [ ] **Step 1: Escribir el test que falla**

Agrega este test al final del `describe("LoginForm", ...)` en `LoginForm.test.tsx` (antes del cierre del bloque):

```tsx
  it("muestra un banner de éxito cuando mostrarResetOk es true", () => {
    render(<LoginForm mostrarResetOk />);

    expect(
      screen.getByText(/contraseña actualizada/i)
    ).toBeInTheDocument();
  });
```

- [ ] **Step 2: Ejecutar los tests para confirmar que fallan**

Run: `npm test -- "app/(public)/login/LoginForm.test.tsx"`
Expected: FAIL — `LoginForm` no acepta la prop `mostrarResetOk` ni renderiza ningún banner.

- [ ] **Step 3: Implementar — `LoginForm.tsx`**

Agrega el tipo de props y el banner. Cambia la firma del componente:

```tsx
export function LoginForm({
  mostrarResetOk = false,
}: {
  mostrarResetOk?: boolean;
}) {
```

E inmediatamente después de la apertura de `<motion.div ...>` (antes del `<form onSubmit={manejarSubmit} ...>`), agrega:

```tsx
      {mostrarResetOk && (
        <p
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
        >
          Contraseña actualizada. Inicia sesión con tu nueva contraseña.
        </p>
      )}
```

- [ ] **Step 4: Ejecutar los tests para confirmar que pasan**

Run: `npm test -- "app/(public)/login/LoginForm.test.tsx"`
Expected: PASS (6 tests).

- [ ] **Step 5: Implementar — `page.tsx` lee `searchParams`**

Reemplaza la firma y el cuerpo de `LoginPage` en `app/(public)/login/page.tsx`:

```tsx
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ reset?: string }>;
}) {
  const params = await searchParams;
  const mostrarResetOk = params.reset === "ok";

  return (
    <main className="grid min-h-screen bg-ink-950 lg:grid-cols-[55fr_45fr]">
      <LoginBranding />

      <div className="flex flex-col items-center justify-center bg-grain px-6 py-16 sm:px-10">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="flex justify-center rounded-sm font-display text-2xl font-bold tracking-tight text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
          >
            COACH<span className="text-gold-400">PRO</span>
            <span className="text-gold-400"> •</span>
          </Link>

          <div className="mt-10 text-center">
            <h1 className="font-display text-[42px] font-bold leading-tight text-white">
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-lg text-mist-400">
              Inicia sesión para continuar tu proceso de aprendizaje.
            </p>
          </div>

          <div className="mt-10 rounded-[20px] border border-white/[0.08] bg-white/[0.03] p-12 shadow-[0_0_40px_rgba(0,0,0,0.25)]">
            <LoginForm mostrarResetOk={mostrarResetOk} />
          </div>

          <p className="mt-8 text-center text-sm text-mist-400">
            ¿No tienes una cuenta?{" "}
            <Link
              href="/registro"
              className="rounded-sm font-medium text-gold-300 transition duration-150 hover:text-gold-200 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ink-950"
            >
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
```

- [ ] **Step 6: Verificar que el build compila**

Run: `npm run build`
Expected: sin errores.

- [ ] **Step 7: Commit**

```bash
git add "app/(public)/login/LoginForm.tsx" "app/(public)/login/LoginForm.test.tsx" "app/(public)/login/page.tsx"
git commit -m "feat(auth): banner de éxito en login tras restablecer contraseña"
```

---

## Task 15: Verificación final

**Files:** ninguno (solo comandos de verificación)

- [ ] **Step 1: Ejecutar toda la suite de tests**

Run: `npm test`
Expected: todos los tests pasan, incluidos los nuevos de las Tasks 4-14.

- [ ] **Step 2: Typecheck**

Run: `npm run typecheck`
Expected: sin errores.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: build exitoso; el resumen de rutas incluye `/coach`, `/actualizar-password` y `/recuperar-password`.

- [ ] **Step 4: Checklist manual de base de datos (fuera de Vitest)**

Aplica en el SQL Editor de Supabase, en orden: `004_rol_coach_enum.sql`, luego `005_rol_coach_rls.sql`. Luego:
- Ejecuta el `update` opcional de `seed-demo-users.sql` para promover una cuenta demo a `coach` y asígnale `coach_id` en un curso existente.
- Inicia sesión con esa cuenta y confirma: ve solo su(s) curso(s) (incluidos no publicados), puede editar sus lecciones, no puede ver ni editar cursos de otro coach, y puede leer (no escribir) el progreso de estudiantes inscritos en su curso.
- Confirma que un estudiante normal sigue sin poder ver cursos no publicados ni cursos ajenos.

- [ ] **Step 5: Checklist manual del flujo de recuperar contraseña (fuera de Vitest)**

Con variables de entorno reales (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`) y `npm run dev`:
- Ve a `/login` → "¿Olvidaste tu contraseña?" → `/recuperar-password`, envía un correo de una cuenta real.
- Verifica que llega el correo de Supabase Auth y que el enlace redirige a `/auth/callback?code=...&next=/actualizar-password` y de ahí a `/actualizar-password`.
- Establece una nueva contraseña, confirma que redirige a `/login?reset=ok` mostrando el banner, y que puedes iniciar sesión con la nueva contraseña.
