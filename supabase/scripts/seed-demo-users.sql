-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Este script NO es una migracion: promueve las cuentas demo ya creadas
-- via Auth (admin@test.com / user@test.com) que se muestran como hint
-- en la pagina de login, para que las verificaciones locales puedan
-- iniciar sesion contra el proyecto real de Supabase.
--
-- El trigger on_auth_user_created (migracion 001_profiles.sql) no lee
-- el rol desde los metadatos del usuario, asi que siempre crea el
-- profile con role='member'. Este script corrige el rol de admin@test.com.

update profiles
set role = 'admin'
where id = (select id from auth.users where email = 'admin@test.com');

update profiles
set role = 'member'
where id = (select id from auth.users where email = 'user@test.com');
