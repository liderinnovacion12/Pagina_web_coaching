# Base de datos

Postgres gestionado por Supabase. El esquema vive en `supabase/migrations/*.sql` y se aplica **manualmente** en el SQL editor de Supabase, en orden numérico (no se usa el CLI de Supabase para migraciones — ver `supabase/migrations/README.md`).

## Cómo aplicar el esquema desde cero

```
000_drop_all.sql        -- opcional: destruye todo (tablas, funciones, triggers, tipos)
001_esquema.sql         -- tipos, tablas, índices
002_usuarios.sql        -- funciones (auto-alta, chequeo de rol, anti-escalada)
003_triggers.sql        -- conecta los triggers a las funciones de 002
004_rls.sql             -- activa RLS y define todas las políticas
005_miembros_equipo.sql -- tabla de Team Leaders
006_galeria_equipo.sql  -- tabla de fotos de galería
```

## Tipos enumerados

| Tipo | Valores |
|---|---|
| `rol_usuario` | `admin`, `estudiante`, `coach` |
| `origen_inscripcion` | `compra_individual`, `membresia` |
| `estado_membresia` | `activa`, `cancelada`, `vencida` |

## Tablas

### `usuarios` — espejo 1:1 de `auth.users`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | `references auth.users(id) on delete cascade` |
| `email` | text | `unique`, indexado |
| `rol` | `rol_usuario` | default `estudiante` |
| `stripe_customer_id` | text | reservado para integración de pagos (no usada aún) |
| `registrado_en` | timestamptz | default `now()` |

Se crea automáticamente vía el trigger `on_auth_user_created` → `handle_new_user()` cada vez que alguien se registra en Supabase Auth (rol inicial siempre `estudiante`; el rol `admin`/`coach` se asigna después manualmente, ver `supabase/scripts/asignar-rol-usuario.sql`).

### `cursos`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `titulo` | text | |
| `precio` | numeric(10,2) | default 0 |
| `publicado` | boolean | default false — controla visibilidad pública/estudiante |
| `coach_id` | uuid | FK a `usuarios`, indexado — dueño del curso |
| `categoria` | text | check `in ('sistema_100', 'clases')` |
| `creado_en` | timestamptz | |

### `lecciones`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `curso_id` | uuid | FK a `cursos`, `on delete cascade`, indexado |
| `titulo` | text | |
| `tipo_contenido` | text | |
| `mux_asset_id` | text | id del asset en Mux (video) |
| `storage_key` | text | ruta en Supabase Storage (contenido no-Mux) |
| `orden` | int | orden dentro del curso |

### `inscripciones` — compra/alta de un curso
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `usuario_id` | uuid | FK `usuarios`, cascade |
| `curso_id` | uuid | FK `cursos`, cascade |
| `stripe_payment_id` | text | reservado, Stripe no integrado aún |
| `origen` | `origen_inscripcion` | compra individual o membresía |
| `creado_en` | timestamptz | |

`unique(usuario_id, curso_id)`. **No hay ningún código en `app/`/`lib` que lea o escriba esta tabla todavía** — el acceso a contenido hoy solo depende de `cursos.publicado` (ver gap en [ARQUITECTURA.md](./ARQUITECTURA.md)).

### `membresia` — suscripción activa por usuario
| Columna | Tipo | Notas |
|---|---|---|
| `usuario_id` | uuid PK | FK `usuarios`, cascade |
| `stripe_subscription_id` | text | reservado |
| `estado` | `estado_membresia` | default `vencida` |
| `periodo_fin` | timestamptz | |

Sin código de aplicación que la consuma aún.

### `progreso` — avance de un usuario en una lección
| Columna | Tipo | Notas |
|---|---|---|
| `usuario_id` | uuid | FK `usuarios`, cascade |
| `leccion_id` | uuid | FK `lecciones`, cascade |
| `segundo_actual` | int | posición del reproductor |
| `completado` | boolean | |
| `actualizado_en` | timestamptz | |

PK compuesta `(usuario_id, leccion_id)`. Usada por `lib/db/lecciones.ts` (`marcarProgreso`) desde la página de lección.

### `quiz_intentos`, `xp_eventos`, `insignias`, `insignias_usuario` — gamificación
Esquema y RLS completos, poblados por `supabase/scripts/seed-datos-prueba.sql`, pero **sin ningún `lib/db/*` ni página que los use**. Diseñados pero no construidos en la app.

### `usuario_intereses`
| Columna | Tipo | Notas |
|---|---|---|
| `usuario_id` | uuid | FK `usuarios`, cascade |
| `sector` | text | |

PK compuesta `(usuario_id, sector)`. Se escribe desde `/registro` (`lib/db/intereses.ts` → `guardarIntereses`).

### `miembros_equipo` (migración 005)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `nombre`, `cargo`, `descripcion_cargo`, `telefono`, `correo` | text | |
| `foto_url` | text | nullable |
| `orden` | int | indexado |
| `creado_en` | timestamptz | |

Lectura pública (`select using (true)`), escritura solo admin. Consumida por `lib/db/equipo.ts` → dashboard del estudiante.

### `galeria_equipo` (migración 006)
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `url` | text | |
| `orden` | int | indexado |
| `creado_en` | timestamptz | |

Mismo patrón que `miembros_equipo`. Consumida por `lib/db/galeria.ts` → dashboard del estudiante.

## Funciones y triggers

| Función | Tipo | Qué hace |
|---|---|---|
| `handle_new_user()` | trigger (`security definer`) | Crea la fila en `usuarios` al insertar en `auth.users`, rol `estudiante` |
| `is_admin()` / `is_coach()` | helper (`security definer`) | Chequeo de rol sin recursión de RLS (consultan `usuarios` con privilegio elevado) |
| `prevent_rol_self_escalation()` | trigger (`security definer`) | Bloquea que alguien cambie su propio `rol` salvo que ya sea admin o la conexión sea `service_role` |

Triggers conectados en `003_triggers.sql`: `on_auth_user_created` (after insert en `auth.users`) y `prevent_rol_self_escalation_trigger` (before update en `usuarios`).

## Row Level Security — patrón general

Todas las tablas tienen RLS activo. El patrón se repite:
- **Dueño de la fila** (`usuario_id = auth.uid()` o equivalente) puede leer/escribir lo suyo.
- **Admin** (`is_admin()`) tiene acceso total a todo, en todas las tablas.
- **Coach** (`coach_id = auth.uid()` en `cursos`, o join a través de `cursos`/`lecciones` en las demás) puede leer/gestionar únicamente lo relacionado a sus propios cursos — incluye `cursos`, `lecciones`, `inscripciones` (solo lectura), `progreso` y `quiz_intentos` (solo lectura vía join).
- **Catálogos públicos de solo lectura**: `insignias`, `miembros_equipo`, `galeria_equipo` (`select using (true)`), gestionables solo por admin.
- **`cursos`/`lecciones`** son visibles al público solo si `publicado = true` (o eres admin/dueño).

## Scripts SQL de mantenimiento (`supabase/scripts/`, no son migraciones)

| Script | Uso |
|---|---|
| `asignar-rol-usuario.sql` | Promover un usuario real a `coach`/`admin` por email (plantilla con placeholders) |
| `seed-demo-users.sql` | Promueve cuentas demo pre-creadas (`admin@test.com`, `user@test.com`) a sus roles |
| `seed-datos-prueba.sql` | Dataset completo de demo: cursos, lecciones, insignias, inscripciones, membresía, progreso, XP |
| `seed-miembros-equipo.sql` | Inserta los 2 Team Leaders reales — **con teléfono/correo placeholder** (`+00000000000`, `pendiente@teamwilmarsosa.com`), pendiente de actualizar con los datos reales antes de producción |
| `limpiar-datos-prueba.sql` | Trunca tablas de contenido/actividad (no `usuarios`) para resetear antes de re-seedear |

## Scripts Node de seed (`scripts/`, sí están en `package.json`)

| Script | Comando npm | Qué hace |
|---|---|---|
| `seed-admin.mjs` | `npm run seed:admin` | Crea un usuario Auth vía `auth.admin.createUser` y le pone `rol='admin'` |
| `seed-contenido.mjs` | `npm run seed:contenido` | Siembra cursos/lecciones de "Sistema 100+" y "Clases", idempotente |

Ninguno corre en CI (requieren credenciales service-role reales de Supabase).
