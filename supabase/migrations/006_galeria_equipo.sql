-- 006_galeria_equipo.sql
-- Tabla de fotos de la "Galeria del Equipo" (seccion Cultura y Equipo).
-- Mismo patron que 005_miembros_equipo.sql: contenido gestionado como
-- datos de base de datos (no hardcodeado en el componente), asi se
-- pueden agregar/quitar fotos sin tocar codigo ni hacer deploy.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).

create table galeria_equipo (
  id uuid primary key default gen_random_uuid(),
  url text not null,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);
create index galeria_equipo_orden_idx on galeria_equipo(orden);

alter table galeria_equipo enable row level security;

-- Catalogo publico de lectura (cualquier usuario autenticado); solo un
-- admin gestiona altas/bajas/ediciones.
create policy "galeria_equipo_select_all" on galeria_equipo for select using (true);
create policy "galeria_equipo_admin_all" on galeria_equipo for all using (is_admin()) with check (is_admin());
