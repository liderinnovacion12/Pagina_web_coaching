# Fase 1 — Núcleo de aprendizaje para estudiantes

> Primera fase de las páginas interiores de CoachPro (LMS de coaching ejecutivo inmobiliario). El mapa completo de 17 módulos de referencia vive en `docs/descripcion-paginas.md` (sitio "team wilmar sosa"); esta fase construye solo los 3 módulos que ya tienen esquema de datos real (`cursos`, `lecciones`, `progreso`, `inscripciones`, `membresia`, `xp_eventos`, `insignias`). El resto de módulos se agregan en fases posteriores y hoy aparecen en el nav como "Próximamente".

## 1. Alcance

Páginas nuevas dentro de `app/(estudiante)`:

| Ruta | Página | Rol |
|---|---|---|
| `/dashboard` | Bienvenida | Home del estudiante: stats, continuar viendo, accesos rápidos |
| `/sistema-100` | Sistema 100+ | Grid de los 5 cursos "pilares" (`cursos.categoria = 'sistema_100'`) |
| `/clases` | Clases | Catálogo filtrable de todos los cursos publicados |
| `/cursos/[cursoId]` | Detalle de curso | Compartida por Sistema 100+ y Clases: descripción + lista de lecciones con progreso |
| `/cursos/[cursoId]/lecciones/[leccionId]` | Reproductor | Mux player (con fallback) + tracking de progreso real |

Fuera de alcance en esta fase (quedan como ítems deshabilitados "Próximamente" en el nav, sin página): Calendario, Herramientas, Proyectos Inmobiliarios Aliados, Aliados Estratégicos, Eventos, Acelerador Pro, Acelerador Starter, Curso de Rentas, CRM, Marketing, Construcción de Equipo, Transacciones, Soporte, Oficinas.

## 2. Navegación — `EstudianteShell`

Reemplaza el layout actual de `app/(estudiante)/layout.tsx` (hoy un simple `<div className="mx-auto max-w-5xl px-4 py-8">`).

- Client component (`"use client"`) por el mega-menú interactivo y el overlay móvil.
- Header fijo: logo `COACH<span class="text-gold-400">PRO</span>` (link a `/dashboard`) + mega-menú superior + menú de usuario (email truncado + botón "Cerrar sesión").
- **Mega-menú**: 5 grupos con kicker en `font-mono text-xs uppercase tracking-wider text-mist-500` como título:
  - **Inicio**: Bienvenida
  - **Formación**: Sistema 100+, Clases, Curso de Rentas*, Acelerador Pro*, Acelerador Starter*
  - **Negocio**: Proyectos Inmobiliarios Aliados*, Aliados Estratégicos*, Transacciones*, CRM*, Marketing*
  - **Comunidad**: Calendario*, Eventos*, Herramientas*, Construcción de Equipo*
  - **Soporte**: Soporte*, Oficinas*

  (`*` = deshabilitado, sin `href` navegable, estilo `border-white/10 text-mist-500 opacity-50 cursor-not-allowed`, `title="Próximamente"`, `aria-disabled="true"`).
- Al hacer click/hover en un grupo se despliega un panel (`motion.div`, fade+slide estándar) con sus ítems. Un solo grupo abierto a la vez. Cierra con click afuera o `Escape`.
- Item activo (ruta actual): texto `text-gold-300`, indicador inferior dorado.
- **Mobile (`<lg`)**: el mega-menú se oculta; aparece botón hamburguesa que abre un overlay `fixed inset-0` a pantalla completa (`bg-ink-950`, `bg-grain`) con los 5 grupos como acordeones expandibles (uno abierto a la vez, animación de altura). Mismo tratamiento visual de ítems deshabilitados.
- Toda la navegación sigue el layout tipo de la sección 9 del design-system: `<main>` con `min-h-screen bg-ink-950`, contenido centrado con `max-w` apropiado por página (dashboard/sistema-100/clases usan un contenedor más ancho que las páginas de auth, ej. `max-w-6xl`).

## 3. Cambios de base de datos

Nueva migración `006_cursos_categoria.sql`:

```sql
alter table cursos add column categoria text not null default 'clases'
  check (categoria in ('sistema_100', 'clases'));
```

- No se modifica RLS: `cursos_select_publicado` (migración 001) ya permite `select` de cualquier curso `publicado = true` a cualquier usuario autenticado, y eso es exactamente el modelo de acceso de esta fase.
- **Modelo de acceso confirmado**: cualquier estudiante logueado puede ver/avanzar cualquier curso y lección `publicado = true`, sin validar `inscripciones` ni `membresia` todavía (no hay checkout real — Stripe es fase posterior según `PRODUCT.md`). Esto se revisita cuando se implemente el flujo de pago.

### Seed de contenido

Nuevo script `scripts/seed-contenido.mjs` (mismo patrón que `scripts/seed-admin.mjs`, usando `SUPABASE_SERVICE_ROLE_KEY`):

- 5 cursos `categoria = 'sistema_100'`, `publicado = true`, cada uno con 3-4 lecciones (`tipo_contenido = 'video'`, sin `mux_asset_id` real todavía).
- 6 cursos `categoria = 'clases'`, `publicado = true`, con 2-5 lecciones cada uno.
- Idempotente: si ya existen cursos con esos títulos, no duplica (upsert por `titulo` o chequeo previo).

## 4. Bienvenida (`/dashboard`)

Server component que reemplaza el stub actual (`<h1>Mi progreso</h1>`).

- H1 "Bienvenido de nuevo" + subtítulo aspiracional (tono editorial-ejecutivo de `PRODUCT.md`).
- Fila de 4 stat cards (`rounded-[20px] border border-white/[0.08] bg-white/[0.03]`):
  - XP total: `sum(xp_eventos.puntos)` del usuario.
  - Insignias obtenidas: `count(insignias_usuario)`.
  - Cursos en progreso: cantidad de `curso_id` distintos con al menos una fila en `progreso` donde `completado = false` (no se consulta `inscripciones`, ya que el acceso no está gateado en esta fase).
  - Estado de membresía: valor de `membresia.estado` (o "Sin membresía" si no existe fila).
- "Continuar viendo": última lección con `progreso.completado = false` ordenada por `actualizado_en desc` — tarjeta con título de curso/lección + botón "Retomar" → `/cursos/[cursoId]/lecciones/[leccionId]`.
- "Accesos rápidos": 2 tarjetas grandes hacia `/sistema-100` y `/clases`.
- **Estado vacío** (usuario nuevo sin ninguna fila en `progreso`/`xp_eventos`): stats en 0, sin sección "Continuar viendo", mensaje motivacional + CTA directo a `/sistema-100`.

Nueva función en `lib/db/dashboard.ts`: `getResumenEstudiante(usuarioId)` que agrega las 4 métricas + la lección "continuar viendo" en una sola llamada (varias queries en paralelo con `Promise.all`, no una función monolítica de UI).

## 5. Sistema 100+ (`/sistema-100`)

- H1 + kicker "Los 5 pilares del Sistema 100+".
- Grid de tarjetas (una por curso `categoria = 'sistema_100'`, ordenadas por algún campo de orden — se reutiliza el orden alfabético/creado_en si no existe columna de orden explícita para cursos) — cada tarjeta muestra título + barra de progreso (% de lecciones completadas / total).
- Click en tarjeta → `/cursos/[cursoId]`.

Nueva función `lib/db/cursos.ts`: `getCursosPorCategoria(categoria, usuarioId)` que además trae el progreso agregado por curso.

## 6. Clases (`/clases`)

- H1 + subtítulo.
- Buscador de texto (client-side, filtra por `titulo`) + chips de filtro por categoría (Todas / Sistema 100+ / Clases) — estado en cliente (`useState`), sin recargar la página.
- Grid de tarjetas igual que Sistema 100+, pero con todos los cursos publicados.
- Estado vacío de búsqueda: "No encontramos clases con ese nombre."

Reutiliza `getCursosPorCategoria` sin filtro (o una variante `getCursosPublicadosConProgreso(usuarioId)`).

## 7. Detalle de curso (`/cursos/[cursoId]`)

- Server component: valida que el curso exista y esté `publicado = true` (si no, `notFound()`).
- Header del curso: título + descripción (si existe) + barra de progreso general.
- Lista ordenada de lecciones (`orden asc`): cada fila muestra número, ícono de estado (check verde si `completado`, círculo con % si en progreso, círculo vacío si no iniciada), título, duración si se conoce.
- Click en lección → `/cursos/[cursoId]/lecciones/[leccionId]`.

## 8. Reproductor de lección (`/cursos/[cursoId]/lecciones/[leccionId]`)

- Server component para datos (lección, curso, progreso actual) + client component `LeccionPlayer` para el reproductor interactivo.
- Si `mux_asset_id` existe **y** las env vars de Mux (`MUX_TOKEN_ID`/`MUX_TOKEN_SECRET` o el playback token público necesario) están configuradas → `@mux/mux-player-react`, con `onTimeUpdate`/`onEnded` haciendo `upsert` a `progreso` (debounce de escritura, no en cada frame).
- Si no hay `mux_asset_id` o faltan credenciales → estado "Video no disponible todavía" (tarjeta con ícono + texto), y un botón "Marcar como completada" que hace `upsert` directo a `progreso` (`completado = true`) — así el flujo de progreso es probable end-to-end sin depender de tener Mux configurado.
- Navegación inferior: "Lección anterior" / "Siguiente lección" (basado en `orden` dentro del mismo curso), deshabilitados en los extremos.

## 9. Testing

- `lib/db/dashboard.test.ts`, `lib/db/cursos.test.ts` (casos nuevos): agregaciones correctas, manejo de usuario sin actividad.
- Componentes: estados vacíos de Bienvenida y Clases, filtro/buscador de Clases, `EstudianteShell` (mega-menú abre/cierra, ítems `*` deshabilitados no navegan, overlay móvil abre/cierra, `Escape` cierra panel).
- `LeccionPlayer`: fallback sin Mux marca progreso correctamente; no se testea el SDK de Mux en sí (mockeado).

## 10. Fuera de alcance (explícito)

- Stripe/checkout, gating real por `inscripciones`/`membresia`.
- Quiz (`quiz_intentos`) — sin UI en esta fase aunque la tabla exista.
- Cualquiera de los 14 módulos restantes del mapa de referencia.
- Roles coach/admin sobre este contenido (esta fase es 100% vista de estudiante; adaptar para coach/admin es un trabajo posterior según pidió el usuario).
