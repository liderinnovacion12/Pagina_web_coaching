# Migraciones de Coachpro

Estas migraciones se ejecutan **manualmente en el SQL Editor de Supabase**
(no se usa el CLI de Supabase para aplicarlas). Cada archivo agrupa un tipo
de configuración para que las actualizaciones futuras sean quirúrgicas: si
solo necesitas tocar una política de RLS, editas/agregas un archivo de RLS,
sin tener que releer todo el esquema.

## Orden de aplicación (base de datos vacía)

0. **`000_drop_all.sql`** — solo si necesitas reiniciar desde cero (ver
   más abajo). No forma parte del flujo normal hacia adelante.
1. **`001_esquema.sql`** — extensión, tipos enumerados, tablas e índices.
   No define comportamiento, solo estructura de datos.
2. **`002_usuarios.sql`** — funciones relacionadas con usuarios y roles:
   `handle_new_user()`, `is_admin()`, `is_coach()`,
   `prevent_rol_self_escalation()`. Depende de `001`.
3. **`003_triggers.sql`** — los triggers que conectan las tablas con las
   funciones de `002` (`on_auth_user_created`,
   `prevent_rol_self_escalation_trigger`). Depende de `002`.
4. **`004_rls.sql`** — activa Row Level Security en cada tabla y define
   todas las políticas de acceso (estudiante propio, admin total, coach
   por pertenencia). Depende de `001` y `002`.

Aplica los 4 archivos en ese orden, pegando cada uno en el SQL Editor.

## Reiniciar desde cero

Si necesitas volver a dejar la base de datos vacía antes de re-aplicar
estos archivos, usa `000_drop_all.sql`. Bórralo todo con ese script y
vuelve a aplicar `001` → `004`.

## Cómo agregar cambios futuros

No edites estos 4 archivos una vez aplicados en producción — son la
fotografía del estado inicial. Cada cambio nuevo va en un archivo aparte,
numerado a partir de `005`, nombrado según el tipo de cambio que domina:

- Un cambio de estructura (tabla/columna nueva) → `005_<algo>.sql` con el
  `alter table` / `create table` correspondiente.
- Un cambio de función/lógica de usuarios → `006_<algo>.sql`.
- Un cambio de políticas RLS → `007_<algo>.sql`.

Si un cambio toca varias capas a la vez (p. ej. una tabla nueva con su
propia RLS), está bien que un mismo archivo numerado incluya ambas partes
— la separación por tipo aplica sobre todo a esta base inicial, para que
sea fácil de auditar; los incrementos posteriores pueden agruparse por
feature si es más claro para el cambio en cuestión.

## Otros scripts relacionados

- `supabase/scripts/seed-demo-users.sql` — promueve cuentas demo ya
  creadas vía Auth a los roles `admin`/`estudiante`/`coach`.
- `scripts/seed-admin.mjs` / `scripts/seed-contenido.mjs` — scripts Node
  que usan la service role key para poblar datos iniciales.
