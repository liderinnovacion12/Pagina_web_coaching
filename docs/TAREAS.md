# Tareas: hecho vs. pendiente

Estado a 2026-07-15, basado en lectura directa del código (no en `PRODUCT.md` ni en los docs del sitio anterior, que describen objetivos/referencias, no lo ya construido).

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
- **Herramientas y Comunicación** (`/herramientas`): reemplaza el stub — directorio de 51 grupos de WhatsApp/Dropbox del equipo, con hero, grupo principal, indicadores, búsqueda/filtro por categoría/orden/paginación y toggle grid/lista; tabla `grupos_comunidad` con RLS y datos semilla (enlaces cargados manualmente desde admin).
- **Control de acceso real a cursos** (`lib/db/cursos.ts`, `lib/db/lecciones.ts`): `tieneAccesoCurso()` verifica `inscripciones`/`membresia` antes de dar acceso al contenido de una lección — los cursos con `precio = 0` siguen siendo libres para cualquier estudiante. La portada del curso sigue siendo visible con las lecciones bloqueadas mostrando un candado; sin flujo de compra todavía (ver Épica B · Stripe en `/cronograma`).
- **Gestión de grupos en admin** (`/admin/herramientas`): CRUD de `grupos_comunidad` vía server actions — mismo patrón que `/admin/calendario`.
- **Proyectos Inmobiliarios Aliados** (`/proyectos-inmobiliarios-aliados`): reemplaza el `href: null` del nav — catálogo de 10 preconstrucciones aliadas (comisión 6%/7%), contenido real (contacto "In House", precio, enlace de WhatsApp por proyecto); tabla `proyectos_aliados` con RLS y datos semilla. `imagen_url` sembrada en NULL — fotos ya capturadas, pendientes de subir a Supabase Storage (ver `public/images/proyectos-aliados/README.md`).
- **Gestión de proyectos aliados en admin** (`/admin/proyectos-inmobiliarios-aliados`): CRUD de `proyectos_aliados` vía server actions — mismo patrón que `/admin/herramientas`.
- **Aliados Estratégicos** (`/aliados`): reemplaza el `href: null` del nav — directorio de 4 proveedores externos (LLC/impuestos, hipotecas, transaction coordinator, marketing digital) en tarjetas de contacto (avatar circular, teléfono/correo clickeables); soporta más de un contacto por aliado vía columnas de texto alineadas por línea (`parsearContactos()`); tabla `aliados` con RLS y datos semilla completos (fotos ya subidas). CRUD en `/admin/aliados`.
- **Curso de Rentas** (`/curso-de-rentas`): reemplaza el `href: null` del nav — página promocional estática (sin tabla en base de datos ni admin, decisión explícita) para el curso externo "Maestría en Rentas": beneficio de 50% de descuento con código, banner, checklist de contenido del curso y CTA a la plataforma externa de inscripción.
- **Cronograma interno** (`/cronograma`, visible en estudiante/coach/admin): dashboard de reporting hacia el cliente — tiempo invertido (commits reales), velocidad observada y hoja de ruta estimada (épicas A–I, ~96.5h netas / 114.6h con margen, 13/07–06/08). No es una funcionalidad del producto LMS; es transparencia de avance del desarrollo. **Vive hardcodeado en `components/cronograma/CronogramaPagina.tsx`** — hay que actualizarlo a mano conforme avance el trabajo real (ver nota de desviación abajo).
- **Seeds y mantenimiento**: scripts de seed de admin y contenido, scripts SQL de datos de prueba y promoción de roles.
- **CI**: lint + typecheck + test + build en cada PR/push a `main`.

## Nota: desviación del cronograma interno

`/cronograma` programó la **Épica A (control de acceso real a cursos)** para el 13/07 y la **Épica B (Stripe)** para 14–16/07. La Épica A se completó el 14/07 (un día tarde respecto al cronograma) — ver la entrada "Control de acceso real a cursos" en Hecho. La Épica B (Stripe, ítem 1 de Pendiente abajo) sigue sin arrancar; conviene decidir si se re-planifica el resto del cronograma o si se retoma tal cual, corriendo cada épica siguiente un día más tarde.

## Pendiente para el objetivo final (LMS con venta de cursos)

Ordenado por lo que bloquea el objetivo de negocio (vender y controlar acceso a cursos) primero:

1. **Cobro/Stripe** — `usuarios.stripe_customer_id`, `inscripciones.stripe_payment_id` y `membresia.stripe_subscription_id` están reservados en el esquema pero no hay integración de Stripe en ningún lado del código. Sin esto no hay forma real de que un estudiante compre un curso o se suscriba.
2. **Panel de coach** (`/coach`) — hoy es un stub con solo gating de rol. Falta UI para que un coach cree/edite sus propios cursos y lecciones (la RLS de `cursos_coach_*`/`lecciones_coach_own` ya soporta esto).
3. **Panel de admin** (`/admin`) — la home sigue siendo un stub sin UI y ya tiene la primera sección real (`/admin/calendario`, gestión de clases). Falta gestión de usuarios/roles, cursos, equipo/galería (hoy esas dos últimas solo se editan a mano por SQL).
4. **Secciones "en construcción" del área de estudiante**: `/marketing`, `/soporte` (`/calendario` y `/herramientas` ya se implementaron). Ver alcance objetivo en `docs/descripcion_contenido_pagina.txt` (sitio de referencia).
5. **Ítems de navegación sin ruta** (`components/estudiante/nav-config.ts`, `href: null`): Acelerador Pro/Starter, Transacciones, CRM, Eventos, Construcción de Equipo, Oficinas.
6. **Gamificación sin UI**: `quiz_intentos`, `xp_eventos`, `insignias`, `insignias_usuario` existen en el esquema y en datos de prueba, pero ninguna pantalla los muestra ni los alimenta desde una acción real de usuario.
7. **Edge Functions sin invocar**: `nexus-chat` (asistente IA) y `send-email` (emails transaccionales) están desplegables pero no hay ningún punto del frontend/backend que las llame.
8. **Datos placeholder pendientes de reemplazar**: `supabase/scripts/seed-miembros-equipo.sql` inserta a los Team Leaders reales con teléfono/correo placeholder (`+00000000000`, `pendiente@teamwilmarsosa.com`) — falta la actualización manual con los datos definitivos antes de ir a producción.
9. **Dominio de correo en `send-email`** — `supabase/functions/send-email/index.ts` envía desde `no-reply@coachpro.app`, un dominio que no corresponde a la marca real "Team 100% Real Estate". Falta reemplazarlo por el dominio de correo real del negocio (no se adivinó ni se cambió en esta limpieza).
10. **`docs/design-system.md`, sección de login**: describía el layout de dos columnas con `LoginBranding` (ya eliminado por no estar en uso — el login actual es de una sola columna); se marcó como histórico en esta limpieza. Revisar si el diseño de dos columnas se retoma.

## Deuda técnica menor (no bloquea el objetivo, pero vale la pena)

- ~~`tailwind.config.ts` no escaneaba `components/**`, arriesgando que clases usadas solo ahí no se generaran en el CSS de producción~~ — corregido en esta limpieza.
- ~~Código muerto: `app/(public)/login/LoginBranding.tsx` y `components/motion/CursorGlow.tsx` (solo alcanzables entre sí, sin uso real)~~ — eliminados en esta limpieza.
- ~~`.vercel/project.json` y `.vercel/README.txt` estaban commiteados a git pese a estar en `.gitignore`~~ — destrackeados en esta limpieza (se conservan en disco).
- `lib/supabase/client.ts` y `lib/supabase/admin.ts` no tienen ningún call-site en `app/` hoy. No son código muerto per se (son scaffolding razonable), pero conviene revisar si siguen siendo necesarios cuando se construyan los paneles de coach/admin.
