-- 011_eventos.sql
-- Catálogo de eventos del equipo (conferencias, entrenamientos,
-- networking), mostrado en /eventos. Mismo patrón de catálogo público
-- (lectura) / admin (escritura) que las migraciones anteriores, pero con
-- una tabla hija real (eventos_fechas) en vez de columnas de texto
-- paralelas (el truco usado en 010_aliados.sql): cada evento tiene un
-- número variable de fechas (2 a 6) y cada fecha necesita datos
-- estructurados (fecha de inicio, fecha de fin, ubicación), así que una
-- tabla relacional es la opción correcta acá.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- El estado de cada fecha ("Realizado con éxito" / "En ejecución" /
-- próximo) NO se guarda en ninguna columna — se calcula en tiempo de
-- render comparando fecha_inicio/fecha_fin con la fecha actual (ver
-- calcularEstadoFecha() en lib/db/eventos.types.ts). Por eso las fechas
-- semilla de abajo van a mostrar estados distintos a las capturas de
-- pantalla del sitio de referencia (que están "congeladas" en un momento
-- del tiempo) — es el comportamiento esperado, no un error.

create type categoria_evento as enum ('internacional', 'nacional_eeuu');

create table eventos (
  id uuid primary key default gen_random_uuid(),
  categoria categoria_evento not null,
  titulo text not null,
  subtitulo text not null,
  youtube_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index eventos_categoria_idx on eventos(categoria);
create index eventos_activo_idx on eventos(activo);

alter table eventos enable row level security;
create policy "eventos_select_all" on eventos for select using (true);
create policy "eventos_admin_all" on eventos for all using (is_admin()) with check (is_admin());

create table eventos_fechas (
  id uuid primary key default gen_random_uuid(),
  evento_id uuid not null references eventos(id) on delete cascade,
  fecha_inicio date not null,
  fecha_fin date not null,
  ubicacion text not null,
  creado_en timestamptz not null default now()
);
create index eventos_fechas_evento_id_idx on eventos_fechas(evento_id);

-- Exige que fecha_fin no sea anterior a fecha_inicio: un par invertido
-- haría que calcularEstadoFecha() calcule un estado sin sentido (o una
-- duración negativa) al renderizar.
alter table eventos_fechas add constraint eventos_fechas_fin_no_antes_de_inicio
  check (fecha_fin >= fecha_inicio);

alter table eventos_fechas enable row level security;
create policy "eventos_fechas_select_all" on eventos_fechas for select using (true);
create policy "eventos_fechas_admin_all" on eventos_fechas for all using (is_admin()) with check (is_admin());

-- Datos semilla: 4 eventos reales (contenido capturado del sitio de
-- referencia, ver docs/superpowers/specs/2026-07-16-eventos-design.md
-- sección 3). UUIDs literales para poder referenciarlos en el segundo
-- insert (mismo patrón que supabase/scripts/seed-datos-prueba.sql usa
-- para lecciones -> cursos).
insert into eventos (id, categoria, titulo, subtitulo, youtube_url, orden) values
  ('a1000000-0000-0000-0000-000000000001'::uuid, 'internacional', 'Florida como destino inmobiliario', 'Cronograma de eventos 2026 · Bogotá, Distrito Capital', 'https://www.youtube.com/watch?v=jV468IGkYtg', 1),
  ('a1000000-0000-0000-0000-000000000002'::uuid, 'nacional_eeuu', 'Eventos New York', 'Conferencias y networking en la Gran Manzana', 'https://www.youtube.com/watch?v=gSeIYfPnJ40', 1),
  ('a1000000-0000-0000-0000-000000000003'::uuid, 'nacional_eeuu', 'Legacy Impact 360', 'Planificación trimestral · Conferencias, entrenamientos y networking', null, 2),
  ('a1000000-0000-0000-0000-000000000004'::uuid, 'nacional_eeuu', 'Tu sueño, tu casa Fest', 'Evento especial de fin de semana · Orlando, Florida', 'https://www.youtube.com/watch?v=b1ae3zIeE1k', 3);

insert into eventos_fechas (evento_id, fecha_inicio, fecha_fin, ubicacion) values
  -- Florida como destino inmobiliario
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-01-30', '2026-01-31', 'Bogotá, Colombia'),
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-03-13', '2026-03-14', 'Bogotá, Colombia'),
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-05-22', '2026-05-23', 'Bogotá, Colombia'),
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-07-24', '2026-07-25', 'Bogotá, Colombia'),
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-09-25', '2026-09-26', 'Bogotá, Colombia'),
  ('a1000000-0000-0000-0000-000000000001'::uuid, '2026-11-20', '2026-11-21', 'Bogotá, Colombia'),
  -- Eventos New York
  ('a1000000-0000-0000-0000-000000000002'::uuid, '2026-04-25', '2026-04-26', 'New York, NY'),
  ('a1000000-0000-0000-0000-000000000002'::uuid, '2026-08-22', '2026-08-23', 'New York, NY'),
  ('a1000000-0000-0000-0000-000000000002'::uuid, '2026-10-24', '2026-10-25', 'New York, NY'),
  -- Legacy Impact 360
  ('a1000000-0000-0000-0000-000000000003'::uuid, '2026-04-06', '2026-04-06', 'Evento On line'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, '2026-06-29', '2026-06-29', 'Evento On line'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, '2026-11-05', '2026-11-05', 'Orlando, FL'),
  ('a1000000-0000-0000-0000-000000000003'::uuid, '2027-01-21', '2027-01-27', 'Miami, FL'),
  -- Tu sueño, tu casa Fest
  ('a1000000-0000-0000-0000-000000000004'::uuid, '2026-06-06', '2026-06-07', 'Orlando, FL'),
  ('a1000000-0000-0000-0000-000000000004'::uuid, '2026-09-26', '2026-09-27', 'Orlando, FL');
