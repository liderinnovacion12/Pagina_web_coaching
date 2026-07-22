create table leccion_accesos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  pagado_en timestamptz not null default now(),
  unique(usuario_id, leccion_id)
);

alter table leccion_accesos enable row level security;

create policy "leccion_accesos_select_own"
  on leccion_accesos for select
  using (usuario_id = auth.uid() or is_admin());

create policy "leccion_accesos_insert_own"
  on leccion_accesos for insert
  with check (usuario_id = auth.uid() or is_admin());
