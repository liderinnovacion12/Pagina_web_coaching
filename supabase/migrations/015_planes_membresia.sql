create table planes_membresia (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  precio numeric(10,2) not null,
  duracion_dias int not null default 30,
  activo boolean not null default true,
  destacado boolean not null default false,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);

alter table planes_membresia enable row level security;

create policy "planes_select_all" on planes_membresia
  for select using (true);

create policy "planes_admin_all" on planes_membresia
  for all using (is_admin()) with check (is_admin());

insert into planes_membresia (nombre, descripcion, precio, duracion_dias, activo, destacado, orden)
values (
  'Plan Ilimitado',
  'Acceso a todos los cursos, certificados y contenido nuevo sin restricciones.',
  100,
  30,
  true,
  true,
  0
);
