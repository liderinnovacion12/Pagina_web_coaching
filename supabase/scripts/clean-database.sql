-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Reset completo del proyecto: borra usuarios reales de Auth (incluidas
-- las cuentas demo admin@test.com / user@test.com) y todo el contenido,
-- dejando el esquema intacto. Uso: volver a un estado "recien creado"
-- antes de re-sembrar datos de prueba.
--
-- ADVERTENCIA: esto borra TODOS los usuarios y datos del proyecto.
-- No hay vuelta atras. No correr contra un proyecto con usuarios reales.

-- 1. Usuarios de Auth: profiles.id referencia auth.users(id) on delete
--    cascade, y a su vez todas las tablas de actividad de usuario
--    referencian profiles(id) on delete cascade, asi que este delete
--    arrastra en cascada: profiles, user_progress, certificates,
--    user_achievements, leaderboard, game_results, coach_sessions,
--    chat_sessions, comments, notifications, email_logs, subscriptions.
delete from auth.users;

-- 2. Contenido que no depende de un usuario y por lo tanto no se borra
--    por la cascada anterior.
truncate table
  public.videos,
  public.courses,
  public.categories,
  public.achievements,
  public.games
restart identity cascade;
