# Coachpro — Sub-proyecto 1: Fundación (diseño)

**Fecha:** 2026-07-06
**Repositorio:** `Pagina_web_coaching` (este repo — reemplaza el proyecto Vite+React actual)
**Referencia de producto/arquitectura:** documentos en `C:\Users\Victor Pulido\Coachpro\*.md` (arquitectura-y-stack-tecnologico.md, especificaciones-lms-corporativo.md, plan-de-implementacion.md)

## Contexto y decisión previa

Coachpro es una plataforma comercial de cursos online (B2B2C, ~1000 estudiantes) especificada para Next.js full-stack + Supabase Pro + Mux + Stripe. Existe un repositorio paralelo (`C:\Users\Victor Pulido\Coachpro`, rama `feature/semana-1-fundacion`) donde esta misma migración ya se empezó de forma independiente (scaffold Next.js+TS+Tailwind, Vitest, clientes Supabase). Se decidió explícitamente **no continuar ahí**: el trabajo de migración continúa en `Pagina_web_coaching`, que actualmente es una SPA Vite+React+Supabase con su propio dominio (landing de coaching individual, mapa de coaches, chatbot, i18n es/en) sin relación funcional con el catálogo de cursos de Coachpro.

**Decisiones de alcance ya tomadas:**
- Migrar completamente a Next.js (App Router), no adaptar el stack Vite existente.
- Reemplazar todo el código Vite actual — no coexistencia temporal.
- Reutilizar el proyecto Supabase Pro ya conectado: correr `drop-all-tables.sql` (ya existe en `supabase/scripts/`) y reconstruir el esquema desde cero para Coachpro.
- Diseño de UI nuevo orientado a LMS/venta de cursos (catálogo, precios) — se descartan piezas que no aplican al nuevo modelo (mapa de coaches, chatbot de coaching individual), conservando i18n es/en como base técnica.
- TypeScript (no JavaScript) para el nuevo proyecto.

Este documento cubre únicamente el **sub-proyecto 1 (Fundación)**, equivalente a la Semana 1 del plan de implementación. Los sub-proyectos siguientes (2: contenido/video, 3: monetización/quizzes/gamificación, 4: dashboards/pulido) se diseñarán por separado.

## Alcance de este sub-proyecto

**Incluye:**
- Proyecto Next.js (App Router, TypeScript, Tailwind) nuevo, reemplazando el proyecto Vite actual en este repo.
- Esquema completo de base de datos (todas las tablas del modelo de datos de Coachpro) + políticas RLS.
- Supabase Auth: registro autoservicio (email/password + Google OAuth) para estudiantes; creación manual (seed) de la cuenta admin.
- Roles `admin`/`estudiante` con guards de middleware + validación server-side en cada Server Action/Route Handler.
- Layout base: landing pública (catálogo de cursos, sin flujo de compra funcional todavía), páginas de login/registro, shell de rutas protegidas `(estudiante)` y `(admin)` (placeholders).
- Deploy funcionando en Vercel, conectado al proyecto Supabase existente.

**No incluye (queda para sub-proyectos posteriores):**
- CRUD real de cursos/lecciones desde el panel admin.
- Integración con Mux (subida/reproducción de video) y Supabase Storage para PDFs.
- Integración con Stripe (compra individual, membresía, webhook).
- Motor de quizzes, XP, leaderboard, insignias.
- Dashboards de estudiante/admin con datos reales.

Las rutas de estos módulos existen como placeholders no funcionales (o no existen todavía) al final de este sub-proyecto.

## Arquitectura y estructura de carpetas

Next.js 15 App Router + TypeScript + Tailwind CSS, un solo proyecto (frontend + backend vía Route Handlers/Server Actions), desplegado en Vercel Pro. Estructura por dominio, no microservicios:

```
app/
├── (public)/          # landing (catálogo público, sin compra), /login, /registro
├── (estudiante)/      # layout protegido + dashboard placeholder
├── (admin)/           # layout protegido + páginas admin placeholder
├── api/               # vacío en esta fase (mux/stripe/quizzes en sub-proyectos futuros)
lib/
├── supabase/          # cliente browser, cliente server (SSR), cliente service role
├── auth/              # helpers de sesión/rol, guards reutilizables
└── db/                # tipos generados de Supabase (supabase gen types) + queries base
supabase/
├── migrations/        # esquema nuevo Coachpro, numeración reiniciada desde 001
├── scripts/           # drop-all-tables.sql (ya existe), seed-admin.sql (nuevo)
└── config.toml
middleware.ts          # refresco de sesión + guard de rutas por grupo
```

Los archivos del proyecto Vite actual (`src/`, `vite.config.js`, componentes `ui/`, `layout/`, `chatbot/`, `map/`) se eliminan del repo como parte de este sub-proyecto.

## Modelo de datos

Tablas (nombres y campos según `especificaciones-lms-corporativo.md`), todas creadas en esta fase aunque varias no tengan lógica funcional hasta sub-proyectos posteriores:

| Tabla | Campos clave |
|---|---|
| `usuarios` | `id` (PK, = `auth.users.id`), `email`, `rol` (enum `admin`\|`estudiante`), `stripe_customer_id`, `registrado_en` |
| `cursos` | `id`, `titulo`, `precio`, `publicado` |
| `lecciones` | `id`, `curso_id` (FK), `tipo_contenido`, `mux_asset_id`, `storage_key` |
| `inscripciones` | `id`, `usuario_id` (FK), `curso_id` (FK), `stripe_payment_id`, `origen` (enum `compra_individual`\|`membresia`) |
| `membresia` | `usuario_id` (FK, PK), `stripe_subscription_id`, `estado` (enum `activa`\|`cancelada`\|`vencida`), `periodo_fin` |
| `progreso` | `usuario_id` (FK), `leccion_id` (FK), `segundo_actual`, `completado` |
| `quiz_intentos` | `id`, `usuario_id` (FK), `leccion_id` (FK), `calificacion` |
| `xp_eventos` | `id`, `usuario_id` (FK), `origen`, `puntos` |
| `insignias_usuario` | `usuario_id` (FK), `insignia_id` (FK) |
| `usuario_intereses` | `usuario_id` (FK), `sector` |

Índices críticos: `usuarios.email`, `progreso(usuario_id, leccion_id)`, `inscripciones(usuario_id, curso_id)`, `xp_eventos(usuario_id)`.

## Row-Level Security

- Función `is_admin()` (`SECURITY DEFINER`, consulta `usuarios.rol` para el `auth.uid()` actual) usada en todas las políticas de admin, para evitar la recursión RLS infinita que ya se resolvió una vez en el proyecto anterior (migración `008_fix_admin_rls_recursion.sql`).
- Tablas con datos personales (`progreso`, `inscripciones`, `quiz_intentos`, `xp_eventos`, `membresia`, `usuario_intereses`): política de lectura/escritura restringida a `usuario_id = auth.uid()`, más política adicional de acceso total para `is_admin()`.
- `cursos`/`lecciones` con `publicado = true`: lectura pública (cualquier usuario autenticado o anónimo); escritura solo para `is_admin()`.
- `usuarios`: cada usuario lee/actualiza su propia fila; `is_admin()` tiene acceso completo.

## Autenticación y roles

- **Supabase Auth** vía paquete `@supabase/ssr` (patrón oficial Next.js App Router): cliente browser (`lib/supabase/client.ts`), cliente server para Server Components/Actions (`lib/supabase/server.ts`), cliente admin con service role solo donde sea estrictamente necesario (`lib/supabase/admin.ts`, nunca expuesto al browser).
- **Métodos:** email/password + Google OAuth.
- **Registro estudiante:** formulario en `(public)/registro`, incluye selección de intereses (`usuario_intereses`) como parte del flujo — se guarda al completar el registro.
- **Cuenta admin:** sin UI de sign-up. Se crea vía `supabase/scripts/seed-admin.sql` (SQL directo), consistente con "sin flujo de sign-up" de la especificación.
- **Middleware (`middleware.ts`):** refresca el JWT en cada request y redirige si un usuario sin sesión intenta acceder a `(estudiante)` o `(admin)`, o si un `estudiante` intenta acceder a `(admin)`.
- **Validación server-side:** cada Server Action/Route Handler vuelve a verificar el rol desde la sesión antes de ejecutar — el middleware es la primera capa, no la única (igual que sección 9 de la arquitectura: "autorización nunca solo en el frontend").
- Sin usuarios hardcodeados para bypass local: Supabase Auth real corre igual en local (`supabase start`) que en producción.

## UI / Landing

- Landing pública nueva orientada a venta de cursos: hero, catálogo de cursos publicados (sin flujo de compra funcional — eso es sub-proyecto 3), sección de propuesta de valor.
- Se conserva i18n (es/en) como capacidad técnica, reimplementada sobre el stack Next.js (a decidir en el plan: `next-intl` vs mantener `i18next`/`react-i18next` client-side).
- Se descartan del alcance de este sub-proyecto: mapa de coaches (Leaflet), chatbot de coaching (`react-chatbotify` + Edge Function `nexus-chat`), Edge Function `send-email` — no aplican al modelo de negocio de venta de cursos. Si se necesitan más adelante para otro propósito, es una decisión aparte.

## Testing y tooling

- **Vitest + React Testing Library** para componentes y helpers de `lib/` (continúa lo ya usado en el proyecto Vite actual).
- **ESLint + `tsc --noEmit`** en cada PR vía GitHub Actions.
- Playwright/E2E no se incluye en este sub-proyecto (se evalúa en el sub-proyecto de dashboards/pulido si es necesario).

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

(Mux/Stripe se agregan en sub-proyectos posteriores)

## Criterio de aceptación

Equivalente al de la Semana 1 del plan de implementación:

- Una persona puede registrarse (incluyendo selección de intereses), iniciar sesión, y ver el catálogo de cursos publicado (con datos semilla mínimos, ya que el CRUD real es el sub-proyecto 2).
- El admin inicia sesión con su cuenta separada (creada por seed) y accede a rutas de admin protegidas (aunque su contenido sea placeholder).
- Un estudiante no puede acceder a rutas `(admin)`; un usuario no autenticado es redirigido a login desde cualquier ruta protegida.
- RLS verificado: un estudiante no puede leer/escribir filas de `progreso`/`inscripciones`/etc. de otro usuario (se prueba con dos cuentas de prueba).
- Deploy funcionando en Vercel con Supabase conectado, en una rama/preview.

## Fuera de alcance (explícito)

- Todo lo de los sub-proyectos 2, 3 y 4 (ver plan de implementación original).
- Multi-tenant/organizaciones.
- Verificación de email obligatoria, recuperación de contraseña avanzada.
