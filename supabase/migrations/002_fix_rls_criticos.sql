-- 002_fix_rls_criticos.sql
-- Corrige dos huecos criticos de seguridad detectados en revision de codigo
-- sobre 001_coachpro_schema.sql, antes de que existan usuarios reales en
-- produccion:
--   1) Un usuario autenticado podia auto-promoverse a admin actualizando
--      su propia fila en `usuarios` (rol = 'admin'), ya que
--      usuarios_update_own solo verificaba propiedad de la fila, no que
--      `rol` se mantuviera sin cambios.
--   2) Un usuario autenticado podia auto-inscribirse gratis en cualquier
--      curso (incluidos los de pago) via inscripciones_insert_own, sin
--      validacion de pago. Esta fase (Fundacion) no tiene integracion de
--      pagos; las inscripciones solo deben crearse por un admin o, en el
--      futuro, por un flujo de compra con service role (que ya evita RLS).

-- ── 1) Bloquear auto-escalacion de rol en usuarios ──────────────────────────

create or replace function prevent_rol_self_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.rol <> old.rol and not is_admin() then
    raise exception 'No tienes permiso para cambiar el rol de usuario.';
  end if;
  return new;
end;
$$;

create trigger prevent_rol_self_escalation_trigger
  before update on usuarios
  for each row execute function prevent_rol_self_escalation();

drop policy "usuarios_insert_own" on usuarios;
create policy "usuarios_insert_own" on usuarios for insert with check (id = auth.uid() and rol = 'estudiante');

-- ── 2) Quitar auto-inscripcion directa (sin flujo de pago en esta fase) ─────

drop policy "inscripciones_insert_own" on inscripciones;
