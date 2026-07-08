-- 002_usuarios.sql
-- Funciones de Coachpro relacionadas con usuarios y roles. Requiere que
-- 001_esquema.sql ya se haya aplicado (usa la tabla `usuarios` y el enum
-- rol_usuario). Estas funciones son consumidas por 003_triggers.sql y
-- 004_rls.sql.

-- Auto-creación de fila en usuarios al registrarse.
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

-- Evita la recursión infinita de RLS al consultar el propio rol del usuario.
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

-- Bloquea que un usuario no-admin se auto-promueva de rol. Se exime a
-- service_role (usada por scripts/seed-admin.mjs vía lib/supabase/admin.ts),
-- ya que auth.uid() es NULL en esas conexiones y is_admin() por lo tanto
-- retornaría false.
create or replace function prevent_rol_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rol <> old.rol and not is_admin() and auth.role() <> 'service_role' then
    raise exception 'No tienes permiso para cambiar el rol de usuario.';
  end if;
  return new;
end;
$$;

-- ── Sincronización de respaldo ───────────────────────────────────────────
-- handle_new_user() (via el trigger on_auth_user_created de
-- 003_triggers.sql) crea la fila en `usuarios` para cada cuenta NUEVA de
-- auth.users. Este insert es un respaldo manual para cuentas que quedaron
-- sin fila: por ejemplo, las creadas antes de que este trigger existiera
-- en la base de datos. Es seguro volver a ejecutarlo cuando haga falta —
-- el join evita duplicar filas que ya existen. Las filas nuevas quedan
-- con rol='estudiante'; usa asignar-rol-usuario.sql después si alguna
-- necesita otro rol.
insert into usuarios (id, email, rol)
select au.id, au.email, 'estudiante'
from auth.users au
left join usuarios u on u.id = au.id
where u.id is null;
