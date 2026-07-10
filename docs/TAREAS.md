# Tareas: hecho vs. pendiente

Estado a 2026-07-10, basado en lectura directa del código (no en `PRODUCT.md` ni en los docs del sitio anterior, que describen objetivos/referencias, no lo ya construido).

## Hecho

- **Autenticación completa**: registro, login (email/password + Google OAuth), recuperar/actualizar password, callback OAuth. Con tests.
- **Control de acceso por rol**: `usuarios.rol` (admin/estudiante/coach), middleware de redirección, `requireRol()` en cada layout protegido, RLS en las 13 tablas del esquema.
- **Landing pública**: hero animado, catálogo de cursos publicados.
- **Área de estudiante**:
  - Dashboard de bienvenida (video, WhatsApp, equipo, misión/visión/valores, galería).
  - Catálogo "Sistema 100+" y "Clases" (con búsqueda/filtro).
  - Detalle de curso + reproductor de lección (Mux) + tracking de progreso.
- **Contenido de equipo/cultura** gestionado en base de datos (`miembros_equipo`, `galeria_equipo`), no hardcodeado.
- **Calendario de clases** (`/calendario`): reemplaza el stub — vista semanal/diaria real con mini calendario, selector de año, toolbar, grilla horaria, tarjetas de clase y panel de detalle; tabla `clases_calendario` con RLS, lógica pura de recurrencia/zona horaria y datos semilla.
- **Gestión de clases en admin** (`/admin/calendario`): primera pantalla funcional del panel de admin — CRUD (crear/editar/listar) de `clases_calendario` vía server actions.
- **Seeds y mantenimiento**: scripts de seed de admin y contenido, scripts SQL de datos de prueba y promoción de roles.
- **CI**: lint + typecheck + test + build en cada PR/push a `main`.

## Pendiente para el objetivo final (LMS con venta de cursos)

Ordenado por lo que bloquea el objetivo de negocio (vender y controlar acceso a cursos) primero:

1. **Control de acceso real a cursos comprados** — hoy cualquier estudiante ve cualquier curso `publicado`. Falta que `lib/db/cursos.ts` verifique `inscripciones`/`membresia` antes de dar acceso a la lección, no solo a la portada del curso. Las tablas y RLS ya existen; falta la lógica de aplicación.
2. **Cobro/Stripe** — `usuarios.stripe_customer_id`, `inscripciones.stripe_payment_id` y `membresia.stripe_subscription_id` están reservados en el esquema pero no hay integración de Stripe en ningún lado del código. Sin esto no hay forma real de que un estudiante compre un curso o se suscriba.
3. **Panel de coach** (`/coach`) — hoy es un stub con solo gating de rol. Falta UI para que un coach cree/edite sus propios cursos y lecciones (la RLS de `cursos_coach_*`/`lecciones_coach_own` ya soporta esto).
4. **Panel de admin** (`/admin`) — la home sigue siendo un stub sin UI y ya tiene la primera sección real (`/admin/calendario`, gestión de clases). Falta gestión de usuarios/roles, cursos, equipo/galería (hoy esas dos últimas solo se editan a mano por SQL).
5. **Secciones "en construcción" del área de estudiante**: `/herramientas`, `/marketing`, `/soporte` (`/calendario` ya se implementó). Ver alcance objetivo en `docs/descripcion_contenido_pagina.txt` (sitio de referencia).
6. **Ítems de navegación sin ruta** (`components/estudiante/nav-config.ts`, `href: null`): Curso de Rentas, Acelerador Pro/Starter, Proyectos Inmobiliarios Aliados, Aliados Estratégicos, Transacciones, CRM, Eventos, Construcción de Equipo, Oficinas.
7. **Gamificación sin UI**: `quiz_intentos`, `xp_eventos`, `insignias`, `insignias_usuario` existen en el esquema y en datos de prueba, pero ninguna pantalla los muestra ni los alimenta desde una acción real de usuario.
8. **Edge Functions sin invocar**: `nexus-chat` (asistente IA) y `send-email` (emails transaccionales) están desplegables pero no hay ningún punto del frontend/backend que las llame.
9. **Datos placeholder pendientes de reemplazar**: `supabase/scripts/seed-miembros-equipo.sql` inserta a los Team Leaders reales con teléfono/correo placeholder (`+00000000000`, `pendiente@teamwilmarsosa.com`) — falta la actualización manual con los datos definitivos antes de ir a producción.
10. **Dominio de correo en `send-email`** — `supabase/functions/send-email/index.ts` envía desde `no-reply@coachpro.app`, un dominio que no corresponde a la marca real "Team 100% Real Estate". Falta reemplazarlo por el dominio de correo real del negocio (no se adivinó ni se cambió en esta limpieza).
11. **`docs/design-system.md`, sección de login**: describía el layout de dos columnas con `LoginBranding` (ya eliminado por no estar en uso — el login actual es de una sola columna); se marcó como histórico en esta limpieza. Revisar si el diseño de dos columnas se retoma.

## Deuda técnica menor (no bloquea el objetivo, pero vale la pena)

- ~~`tailwind.config.ts` no escaneaba `components/**`, arriesgando que clases usadas solo ahí no se generaran en el CSS de producción~~ — corregido en esta limpieza.
- ~~Código muerto: `app/(public)/login/LoginBranding.tsx` y `components/motion/CursorGlow.tsx` (solo alcanzables entre sí, sin uso real)~~ — eliminados en esta limpieza.
- ~~`.vercel/project.json` y `.vercel/README.txt` estaban commiteados a git pese a estar en `.gitignore`~~ — destrackeados en esta limpieza (se conservan en disco).
- `lib/supabase/client.ts` y `lib/supabase/admin.ts` no tienen ningún call-site en `app/` hoy. No son código muerto per se (son scaffolding razonable), pero conviene revisar si siguen siendo necesarios cuando se construyan los paneles de coach/admin.
