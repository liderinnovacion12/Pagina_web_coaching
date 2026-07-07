# Rol `coach` con RLS ampliado + recuperar contraseña real — Design

**Fecha:** 2026-07-07
**Estado:** Aprobado, pendiente de plan de implementación

## Contexto

El proyecto (Coachpro, Next.js + Supabase) ya tiene un esquema de base de datos con RLS para dos roles (`admin`, `estudiante`), definido en `supabase/migrations/001_coachpro_schema.sql` y endurecido en `002_fix_rls_criticos.sql` / `003_permitir_service_role_en_trigger_rol.sql`. La función `is_admin()` (SECURITY DEFINER) evita recursión infinita en las políticas.

Se detectaron tres brechas a cerrar en esta iteración:

1. No existe un rol para instructores/coaches — solo admin (control total) y estudiante (autogestión). El negocio necesita un tercer rol con permisos intermedios sobre sus propios cursos.
2. `/recuperar-password` es un stub: valida el email en el cliente pero nunca llama a Supabase Auth. No existe página para fijar la nueva contraseña tras el enlace del correo, y `/auth/callback` siempre redirige a `/dashboard` sin soportar el flujo de recuperación.
3. Dos archivos SQL quedaron desalineados con el esquema vigente: `supabase/schema.sql` (esquema completo en inglés de un proyecto Vite anterior, no referenciado por ninguna migración activa) y `supabase/scripts/seed-demo-users.sql` (referencia la tabla `profiles`/columna `role`, que ya no existen; el esquema real usa `usuarios`/`rol`).

## Alcance de esta iteración

Incluye: migración SQL para el rol coach y sus políticas, actualización de rutas/sesión para proteger `/coach`, flujo completo de recuperar contraseña, y limpieza de los dos archivos SQL legacy.

No incluye: UI funcional del panel de coach (queda un placeholder protegido), script de seed para promover un coach (la promoción se hace manualmente por SQL Editor), páginas del panel `/dashboard`/`/admin` (no forman parte de este pedido).

---

## 1. Rol `coach`: datos y RLS

**Migración nueva:** `supabase/migrations/004_rol_coach.sql`

```sql
alter type rol_usuario add value 'coach';

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
```

> Nota de ejecución: `ALTER TYPE ... ADD VALUE` no puede correr dentro de la misma transacción implícita que la usa en un `CREATE POLICY` posterior en algunos clientes; se coloca como el primer statement del archivo y el resto de la migración se aplica después, tal como ya se documenta al aplicar migraciones manualmente en el SQL Editor.

**Modelo de propiedad:** un curso pertenece a un coach vía `cursos.coach_id`. Un coach solo puede operar sobre sus propios cursos y las lecciones de esos cursos. Un admin conserva acceso total (las políticas `*_admin_all` ya existentes no se tocan).

**Políticas nuevas** (se suman a las existentes; múltiples políticas permisivas para el mismo comando se combinan con OR en Postgres, por lo que las políticas de `admin`/`estudiante` no requieren cambios):

```sql
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

**Auto-escalación de rol:** el trigger `prevent_rol_self_escalation_trigger` (migración 002/003) ya bloquea que cualquier usuario no-admin cambie su propio `rol` — cubre automáticamente la auto-promoción a `coach`. No requiere cambios.

**Promoción a coach:** manual, por SQL Editor (`update usuarios set rol = 'coach' where id = '...'` y luego `update cursos set coach_id = '...' where id = '...'`). No se agrega script de seed en esta iteración.

---

## 2. Rutas y sesión: prefijo `/coach`

**`lib/auth/middleware-rules.ts`:**

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

export function calcularRedireccion(pathname: string, rol: Rol | null): string | null {
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

Comportamiento: `/admin` solo admin; `/coach` admin o coach; `/dashboard` cualquier rol autenticado (sin cambio). La redirección de "no autorizado" ahora apunta al home real del rol del usuario en vez de asumir siempre `/dashboard`.

**`lib/auth/session.ts`:** `requireRol` acepta un rol único o un arreglo de roles permitidos:

```ts
export async function requireRol(rolesPermitidos: Rol | Rol[]): Promise<SesionUsuario> {
  const roles = Array.isArray(rolesPermitidos) ? rolesPermitidos : [rolesPermitidos];
  const sesion = await getSesionUsuario();

  if (!sesion) {
    redirect("/login");
    return sesion as never;
  }

  if (!roles.includes(sesion.rol)) {
    redirect(sesion.rol === "admin" ? "/admin" : sesion.rol === "coach" ? "/coach" : "/dashboard");
    return sesion as never;
  }

  return sesion;
}
```

Las llamadas existentes (`requireRol("admin")`, `requireRol("estudiante")`) siguen funcionando sin cambios por ser retrocompatibles con un solo rol.

**Nuevo route group `app/(coach)/`** (mismo patrón que `(admin)`/`(estudiante)`):
- `app/(coach)/layout.tsx` → `await requireRol(["coach", "admin"])`, mismo wrapper visual (`mx-auto max-w-5xl px-4 py-8`).
- `app/(coach)/coach/page.tsx` → placeholder: "Panel de coach — en construcción". Sin lógica de negocio.

**Tests a actualizar:** `lib/auth/middleware-rules.test.ts` (casos para `/coach` con admin/coach/estudiante/null) y `lib/auth/session.test.ts` (casos para `requireRol` con arreglo de roles).

---

## 3. Recuperar contraseña (flujo real)

Flujo estándar de Supabase Auth con PKCE, consistente con el uso existente de `@supabase/ssr`.

**a) `app/(public)/recuperar-password/actions.ts`** (nuevo):

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

**b) `RecuperarPasswordForm.tsx`:** se convierte de estado local (`useState`) a `useActionState(solicitarRecuperacion, estadoInicial)`, igual patrón que `LoginForm`, eliminando el comentario "Pendiente: conectar con supabase...". El mensaje de éxito ("Si el correo existe...") se muestra cuando `estado.enviado === true`.

**c) `app/auth/callback/route.ts`:** agrega soporte para `?next=`:

```ts
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

El login normal y el login con Google no mandan `next`, así que siguen yendo a `/dashboard` sin cambios de comportamiento.

**d) `app/(public)/actualizar-password/`** (nuevo, mismo patrón visual que `/recuperar-password`):

- `page.tsx`: layout de página pública con el formulario.
- `ActualizarPasswordForm.tsx`: campos "Nueva contraseña" y "Confirmar contraseña", usando `useActionState`.
- `actions.ts`:

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

**e) `app/(public)/login/page.tsx` + `LoginForm.tsx`:** la página lee `searchParams.reset === "ok"` y pasa un prop `mostrarResetOk` a `LoginForm`, que renderiza un banner de éxito ("Contraseña actualizada. Inicia sesión.") arriba del formulario cuando está presente.

---

## 4. Limpieza de SQL legacy

- **`supabase/schema.sql`**: se elimina (`git rm`). Esquema obsoleto del proyecto Vite anterior (tablas `profiles`/`videos`/`coaches`/`chat_sessions` en inglés), no referenciado por ninguna migración activa ni por el código de la aplicación.
- **`supabase/scripts/seed-demo-users.sql`**: se reescribe para usar el esquema vigente (`usuarios`/`rol` en vez de `profiles`/`role`):

```sql
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Este script NO es una migracion: promueve cuentas demo ya creadas
-- via Auth para pruebas locales contra el proyecto real de Supabase.

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

---

## Testing

- `RecuperarPasswordForm.test.tsx`: reescrito para mockear `solicitarRecuperacion` (patrón de `LoginForm.test.tsx`), cubriendo envío exitoso y error de validación.
- Nuevo `ActualizarPasswordForm.test.tsx` y `actions.test.ts` (recuperar-password y actualizar-password): validación de longitud/coincidencia, error de Supabase, éxito con `signOut` + `redirect`.
- `app/auth/callback/route.test.ts`: caso nuevo para `next` presente/ausente.
- `lib/auth/middleware-rules.test.ts` y `lib/auth/session.test.ts`: casos nuevos para el rol `coach` y `requireRol` con arreglo de roles.
- `app/(coach)/layout.test.tsx`: siguiendo el patrón de `(admin)/layout.test.tsx` y `(estudiante)/layout.test.tsx`.

La migración SQL (004) no tiene cobertura de Vitest — se verifica manualmente aplicándola en el SQL Editor de Supabase (igual que las migraciones 001-003), revisando que las políticas nuevas no rompan el acceso existente de admin/estudiante.
