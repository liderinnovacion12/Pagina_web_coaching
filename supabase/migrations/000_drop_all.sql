-- 000_drop_all.sql
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Este script NO agrega nada nuevo: borra todos los objetos de Coachpro
-- (tablas, funciones, triggers y tipos) para dejar la base de datos vacia
-- antes de re-aplicar las migraciones en orden
-- (001_esquema.sql -> 002_usuarios.sql -> 003_triggers.sql -> 004_rls.sql).
-- Se numera 000 para que quede primero en la carpeta, pero solo debe
-- ejecutarse cuando quieras reiniciar todo desde cero, no como parte del
-- flujo normal de migraciones hacia adelante.
--
-- ADVERTENCIA: destruye todos los datos de forma irreversible. No afecta
-- las cuentas de supabase auth.users, solo el esquema `public` y el
-- trigger que public define sobre auth.users.

drop trigger if exists on_auth_user_created on auth.users;

drop table if exists usuario_intereses cascade;
drop table if exists insignias_usuario cascade;
drop table if exists insignias cascade;
drop table if exists xp_eventos cascade;
drop table if exists quiz_intentos cascade;
drop table if exists progreso cascade;
drop table if exists membresia cascade;
drop table if exists inscripciones cascade;
drop table if exists lecciones cascade;
drop table if exists cursos cascade;
drop table if exists usuarios cascade;

drop function if exists prevent_rol_self_escalation() cascade;
drop function if exists is_coach() cascade;
drop function if exists is_admin() cascade;
drop function if exists handle_new_user() cascade;

drop type if exists estado_membresia;
drop type if exists origen_inscripcion;
drop type if exists rol_usuario;
