-- 005_miembros_equipo.sql
-- Tabla de miembros del equipo (Team Leaders y, a futuro, otros roles del
-- equipo) para la sección "Cultura y Equipo". Contenido gestionado como
-- datos de base de datos (no hardcodeado en el componente), ya que crece
-- con el tiempo. Depende de 001_esquema.sql y 002_usuarios.sql (usa
-- is_admin()).

create table miembros_equipo (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text not null,
  descripcion_cargo text not null,
  telefono text not null,
  correo text not null,
  foto_url text,
  orden int not null default 0,
  creado_en timestamptz not null default now()
);
create index miembros_equipo_orden_idx on miembros_equipo(orden);

alter table miembros_equipo enable row level security;

-- Catálogo público de lectura (cualquier usuario autenticado), igual que
-- el patrón de "insignias_select_all" en 004_rls.sql. Solo un admin
-- gestiona altas/bajas/ediciones.
create policy "miembros_equipo_select_all" on miembros_equipo for select using (true);
create policy "miembros_equipo_admin_all" on miembros_equipo for all using (is_admin()) with check (is_admin());
