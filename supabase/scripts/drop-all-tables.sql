-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Elimina TODA la estructura creada por las migraciones 001-008: tablas,
-- policies (via CASCADE), el trigger de auto-creacion de perfil y las
-- funciones is_admin()/handle_new_user(). Deja el schema "public" vacio,
-- como si ninguna migracion se hubiera corrido todavia.
--
-- NO toca auth.users (las cuentas de Auth sobreviven) ni el schema
-- storage. Para tambien borrar usuarios de Auth, correr antes o despues
-- clean-database.sql / un DELETE FROM auth.users aparte.
--
-- ADVERTENCIA: irreversible. Borra estructura y datos de las 17 tablas.
-- Despues de correr esto hay que volver a aplicar las migraciones
-- 001_profiles.sql ... 008_fix_admin_rls_recursion.sql para reconstruir
-- el schema.

drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();
drop function if exists public.is_admin();

drop table if exists
  public.email_logs,
  public.subscriptions,
  public.notifications,
  public.comments,
  public.chat_sessions,
  public.coach_sessions,
  public.game_results,
  public.games,
  public.leaderboard,
  public.user_achievements,
  public.achievements,
  public.certificates,
  public.user_progress,
  public.courses,
  public.categories,
  public.videos,
  public.profiles
cascade;
