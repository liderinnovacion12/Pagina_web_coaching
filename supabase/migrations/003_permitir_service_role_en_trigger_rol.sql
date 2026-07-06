-- 003_permitir_service_role_en_trigger_rol.sql
-- El trigger prevent_rol_self_escalation_trigger (002) bloqueaba tambien
-- las conexiones con la service role key (usadas por scripts/seed-admin.mjs
-- via lib/supabase/admin.ts), ya que auth.uid() es NULL en esas conexiones
-- y is_admin() por lo tanto retorna false. Se exime explicitamente a
-- service_role, que ya es una conexion de confianza total.

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
