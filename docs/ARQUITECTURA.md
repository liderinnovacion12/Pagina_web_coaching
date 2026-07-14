# Arquitectura

## Stack

- **Next.js 15** (App Router, React Server Components) + **React 19**.
- **Supabase**: Auth (email/password + Google OAuth), Postgres con Row Level Security, Storage (fotos de equipo/galería).
- **Mux Player** (`@mux/mux-player-react`) para el reproductor de video de las lecciones.
- **Tailwind CSS 3** + `framer-motion` para animación.
- **Vitest** + Testing Library (jsdom) para pruebas unitarias/de componentes.
- Despliegue en **Vercel** (`vercel.json`, integración Git nativa; sin paso de deploy propio en CI).

## Estructura de carpetas

```
app/
  (public)/       rutas públicas: landing, login, registro, recuperar/actualizar password
  (estudiante)/   área del alumno tras login (requiere rol "estudiante")
  (coach)/        área del coach (requiere rol "coach" o "admin") — stub
  (admin)/        panel de administración (requiere rol "admin") — stub
  auth/callback/  intercambio de código OAuth / recuperación de password
  layout.tsx      layout raíz: fuentes (Bricolage Grotesque, IBM Plex Mono), metadata global
components/
  motion/         componentes de animación (ParticleField)
  estudiante/     UI compartida del área de alumno (shell, nav, tarjetas de curso, herramientas/)
  cronograma/     dashboard interno de reporting (CronogramaPagina), compartido por los 3 roles
  admin/          UI de gestión (formularios/filas de calendario y herramientas)
  SiteHeader.tsx  header de la landing pública
lib/
  auth/           sesión, control de roles, redirecciones de middleware, logout
  db/             acceso a datos (cursos, lecciones, equipo, galería, intereses)
  supabase/       clientes Supabase (server, browser, admin/service-role)
  motion.ts       helpers de animación compartidos (variants de framer-motion)
middleware.ts     guard de rutas: refresca sesión y redirige según rol
supabase/
  migrations/     SQL versionado, aplicado manualmente en el SQL editor de Supabase
  functions/      Edge Functions (Deno) — ver más abajo
  scripts/        SQL de mantenimiento/seed manual (no son migraciones)
scripts/          scripts Node de seed (`seed-admin.mjs`, `seed-contenido.mjs`)
```

## Rutas y su estado

| Ruta | Estado | Descripción |
|---|---|---|
| `/` (public) | Construido | Landing: header, hero animado, catálogo de cursos publicados |
| `/login`, `/registro`, `/recuperar-password`, `/actualizar-password` | Construido | Flujos de auth completos contra Supabase, con tests |
| `/dashboard` (estudiante) | Construido | Bienvenida: video, WhatsApp CTA, equipo, misión/visión/galería |
| `/sistema-100`, `/clases` | Construido | Catálogo de cursos por categoría, con búsqueda/filtro en `/clases` |
| `/cursos/[cursoId]` y `/lecciones/[leccionId]` | Construido | Detalle de curso, reproductor Mux, progreso por lección |
| `/calendario` (estudiante) | Construido | Vista semanal/diaria de clases, mini calendario, panel de detalle |
| `/herramientas` (estudiante) | Construido | Directorio de 51 grupos de WhatsApp/Dropbox del equipo, con búsqueda/filtro/paginación |
| `/cronograma` (estudiante, coach, admin) | Construido | Dashboard interno de reporting (tiempo invertido, velocidad, hoja de ruta) — no es funcionalidad de producto |
| `/marketing`, `/soporte` (estudiante) | Placeholder | "En construcción", sin funcionalidad |
| `/coach` | Placeholder | Solo gating de rol, sin UI (excepto `/coach/cronograma`) |
| `/admin` | Placeholder | Solo gating de rol; ya tiene `/admin/calendario` y `/admin/herramientas` como CRUD reales |

La navegación completa objetivo (incluye ítems aún sin ruta, como CRM, Transacciones, Eventos) está en [components/estudiante/nav-config.ts](../components/estudiante/nav-config.ts) — los `href: null` marcan lo que falta.

## Autenticación y roles

- Tabla `usuarios` refleja 1:1 a `auth.users` de Supabase (rol: `admin` | `estudiante` | `coach`).
- Un trigger (`handle_new_user`, en `supabase/migrations/002_usuarios.sql`) crea automáticamente la fila en `usuarios` al registrarse, con rol por defecto `estudiante`. Los admins se crean vía `scripts/seed-admin.mjs`, no hay sign-up propio para ese rol.
- `middleware.ts` + `lib/auth/middleware-rules.ts` deciden redirecciones según sesión/rol en cada request.
- `lib/auth/session.ts` expone `requireRol(...)`, usado en los layouts de `(admin)`, `(coach)` y `(estudiante)` para proteger cada área server-side.
- Un trigger (`prevent_rol_self_escalation`) impide que un usuario cambie su propio rol salvo que sea admin o vía service-role.

## Acceso a datos

Todo el acceso a Supabase pasa por `lib/db/*` (cursos, lecciones, equipo, galería, intereses) usando el cliente server (`lib/supabase/server.ts`). No hay llamadas directas a Supabase desde componentes de UI.

- `lib/supabase/client.ts` (cliente de navegador) y `lib/supabase/admin.ts` (service-role) existen como scaffolding pero **no tienen ningún call-site en `app/` hoy**. Se mantienen porque son de bajo riesgo y probablemente necesarios pronto (p. ej. un panel admin real, o features realtime), pero no se debe asumir que están conectados a nada todavía.

## Edge Functions (Supabase, Deno) — construidas pero no invocadas

- `supabase/functions/nexus-chat`: llama a la API de Anthropic para un asistente de chat de coaching ("NEXUS"). Ningún código en `app/` la invoca.
- `supabase/functions/send-email`: envía emails transaccionales (bienvenida, recordatorio, certificado, logro) vía Resend. Tampoco se invoca desde la app.

Ambas están listas para desplegarse en Supabase pero **desconectadas del flujo actual del producto** — quedan como funcionalidad futura ya scaffoldeada, no como código muerto a borrar.

## Gaps conocidos de la arquitectura

- **Control de acceso a contenido incompleto**: `lib/db/cursos.ts` solo filtra por `cursos.publicado`. Las tablas `inscripciones` (compra) y `membresia` (suscripción) existen con RLS pero ningún código en `app/`/`lib` las consulta — hoy cualquier estudiante autenticado ve cualquier curso publicado, sin verificar que lo haya comprado o tenga membresía activa.
- **Gamificación sin UI**: `quiz_intentos`, `xp_eventos`, `insignias`, `insignias_usuario` están en el esquema y en el seed de prueba, pero ninguna página los lee o escribe.
- **Stripe** aparece en `usuarios.stripe_customer_id` y en `PRODUCT.md` como fase futura; no hay integración de pagos en el código.
- Ver detalle de estas tablas en [BASE_DE_DATOS.md](./BASE_DE_DATOS.md) y el listado priorizado en [TAREAS.md](./TAREAS.md).

## Testing y CI

- `npm test` (Vitest + jsdom) cubre componentes, acciones de servidor y helpers — 43 archivos de test, corriendo en cada PR.
- `.github/workflows/ci.yml` ejecuta en orden: `lint` → `typecheck` → `test` → `build`, en cada PR y push a `main`. No incluye los scripts de seed (requieren credenciales service-role de Supabase).
