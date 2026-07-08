-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Este script NO es una migracion: promueve cuentas demo ya creadas
-- via Auth (admin@test.com / user@test.com), que se muestran como hint
-- en la pagina de login, para que las verificaciones locales puedan
-- iniciar sesion contra el proyecto real de Supabase.
--
-- El trigger on_auth_user_created (migracion 003_triggers.sql)
-- siempre crea la fila en usuarios con rol='estudiante', asi que este
-- script corrige el rol de admin@test.com.

update usuarios
set rol = 'admin'
where id = (select id from auth.users where email = 'admin@test.com');

update usuarios
set rol = 'estudiante'
where id = (select id from auth.users where email = 'user@test.com');

-- Opcional: promover una cuenta demo a coach y asignarle un curso existente.
-- update usuarios set rol = 'coach' where id = (select id from auth.users where email = 'coach@test.com');
-- update cursos set coach_id = (select id from auth.users where email = 'coach@test.com') where id = '<curso-id>';
