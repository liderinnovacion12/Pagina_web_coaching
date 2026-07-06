-- Fix: infinite recursion (Postgres 42P17) in RLS policies that subquery
-- "profiles" from within a policy defined on "profiles" itself (and, by
-- extension, any other table whose admin policy subqueries "profiles").
--
-- Root cause: policy "Admin ve todos los perfiles" on profiles queries
-- profiles directly from its own USING clause, so Postgres cannot resolve
-- the self-reference and raises 42P17 on any select against profiles
-- (including a user reading their own row right after login).
--
-- Fix: route the admin check through a SECURITY DEFINER function, which
-- runs with the function owner's privileges and bypasses RLS on profiles,
-- breaking the recursive dependency. Same pattern already used in
-- supabase/schema.sql, just never applied to the real migrations.

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Admin ve todos los perfiles" on public.profiles;
create policy "Admin ve todos los perfiles"
  on public.profiles for all
  using (public.is_admin());

drop policy if exists "Admin gestiona categorías" on public.categories;
create policy "Admin gestiona categorías"
  on public.categories for all
  using (public.is_admin());

drop policy if exists "Admin ve todo el progreso" on public.user_progress;
create policy "Admin ve todo el progreso"
  on public.user_progress for all
  using (public.is_admin());

drop policy if exists "Admin gestiona certificados" on public.certificates;
create policy "Admin gestiona certificados"
  on public.certificates for all
  using (public.is_admin());

drop policy if exists "Admin gestiona todo" on public.achievements;
create policy "Admin gestiona todo"
  on public.achievements for all
  using (public.is_admin());

drop policy if exists "Admin gestiona sesiones" on public.coach_sessions;
create policy "Admin gestiona sesiones"
  on public.coach_sessions for all
  using (public.is_admin());

drop policy if exists "Admin gestiona todo" on public.notifications;
create policy "Admin gestiona todo"
  on public.notifications for all
  using (public.is_admin());

drop policy if exists "Admin gestiona suscripciones" on public.subscriptions;
create policy "Admin gestiona suscripciones"
  on public.subscriptions for all
  using (public.is_admin());
