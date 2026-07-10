-- 007_calendario.sql
-- Tabla de clases/reuniones del calendario semanal del equipo. Mismo
-- patrón que 005_miembros_equipo.sql y 006_galeria_equipo.sql: catálogo de
-- lectura pública (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- hora_inicio/hora_fin se interpretan como hora de pared en
-- America/New_York (EST/EDT según la fecha); la conversión a la zona
-- horaria del navegador ocurre en el frontend (lib/calendario/recurrencia.ts).
--
-- La recurrencia no genera una fila por semana: fecha_ancla marca la
-- primera ocurrencia (y define el día de la semana) y `recurrencia`
-- indica cada cuánto se repite. El cálculo de en qué semanas aplica cada
-- clase vive en lib/calendario/recurrencia.ts (getOcurrenciaEnSemana).

create type modalidad_clase as enum ('online', 'presencial', 'hibrida');
create type recurrencia_clase as enum ('semanal', 'quincenal', 'unica');

create table clases_calendario (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  fecha_ancla date not null,
  hora_inicio time not null,
  hora_fin time not null,
  dirigido_por text,
  modalidad modalidad_clase not null default 'online',
  enlace_sesion text,
  enlace_preguntas text,
  imagen_url text,
  recurrencia recurrencia_clase not null default 'semanal',
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index clases_calendario_activo_idx on clases_calendario(activo);

alter table clases_calendario enable row level security;
create policy "clases_calendario_select_all" on clases_calendario for select using (true);
create policy "clases_calendario_admin_all" on clases_calendario for all using (is_admin()) with check (is_admin());

-- Datos semilla: reuniones semanales del equipo para 2026. fecha_ancla usa
-- la primera semana completa de enero 2026 (lunes 5 a viernes 9) como
-- referencia del día de la semana de cada clase. Los enlaces (Zoom,
-- preguntas, imagen) quedan en NULL — se completan desde /admin/calendario.
insert into clases_calendario
  (nombre, fecha_ancla, hora_inicio, hora_fin, dirigido_por, modalidad, recurrencia)
values
  ('Reunión de Equipo – Estrategia y Dirección', '2026-01-05', '09:00', '10:00', null, 'online', 'semanal'),
  ('Reunión Modelo de Rentas', '2026-01-05', '10:00', '11:00', 'Wilmar Sosa', 'online', 'quincenal'),
  ('Conversaciones en Ventas', '2026-01-06', '09:00', '10:00', 'Wilmar Sosa', 'online', 'semanal'),
  ('Mercadeo y IA', '2026-01-06', '10:00', '11:00', 'Samuel Oropeza', 'online', 'semanal'),
  ('Reunión Visas para Inversionistas', '2026-01-06', '18:00', '19:00', 'Katterin Rendon', 'online', 'semanal'),
  ('Prácticas y Objeciones en Conversaciones de Venta', '2026-01-07', '09:00', '10:00', 'Carolina de la Cruz', 'online', 'semanal'),
  ('Créditos Hipotecarios', '2026-01-07', '10:00', '11:00', 'Claudia Aparicio', 'online', 'semanal'),
  ('Visita Oficina Orlando My Realty', '2026-01-07', '14:00', '15:00', 'Líderes del Team', 'presencial', 'semanal'),
  ('Prácticas y Objeciones en Conversaciones de Venta', '2026-01-09', '09:00', '10:00', 'Carolina de la Cruz', 'online', 'semanal'),
  ('Onboarding Team 100% Real Estate', '2026-01-09', '10:00', '11:00', 'Yusleidy Mesa y Ruby Moyeda', 'online', 'semanal');
