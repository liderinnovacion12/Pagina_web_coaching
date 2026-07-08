-- 003_triggers.sql
-- Triggers de Coachpro. Requiere que 001_esquema.sql y 002_usuarios.sql
-- ya se hayan aplicado (usa handle_new_user y prevent_rol_self_escalation).

-- Crea la fila en usuarios cuando se registra alguien via Supabase Auth.
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Bloquea que un usuario cambie su propio rol sin ser admin/service_role.
create trigger prevent_rol_self_escalation_trigger
  before update on usuarios
  for each row execute function prevent_rol_self_escalation();
