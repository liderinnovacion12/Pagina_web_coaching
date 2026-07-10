-- 008_grupos_comunidad.sql
-- Directorio de comunidades (WhatsApp/Dropbox) del equipo, mostrado en
-- /herramientas. Mismo patrón que 007_calendario.sql: catálogo de lectura
-- pública (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- categoria agrupa los grupos por zona/tipo real (ver
-- docs/Estructura_Herramientas.md): un único grupo_principal (canal
-- maestro del equipo) + 4 categorías de proyecto. tipo_canal distingue
-- WhatsApp (mayoría) de Dropbox (Casa Bella, que es documental).
--
-- Los 51 grupos se siembran con enlace_url = NULL: los enlaces reales de
-- invitación no estaban disponibles al escribir esta migración y se
-- cargan después desde /admin/herramientas.

create type categoria_grupo_comunidad as enum
  ('grupo_principal', 'miami', 'orlando_centro_florida', 'venta_renta', 'otros');
create type canal_grupo_comunidad as enum ('whatsapp', 'dropbox');

create table grupos_comunidad (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  categoria categoria_grupo_comunidad not null,
  detalle text,
  tipo_canal canal_grupo_comunidad not null default 'whatsapp',
  enlace_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index grupos_comunidad_categoria_idx on grupos_comunidad(categoria);
create index grupos_comunidad_activo_idx on grupos_comunidad(activo);

alter table grupos_comunidad enable row level security;
create policy "grupos_comunidad_select_all" on grupos_comunidad for select using (true);
create policy "grupos_comunidad_admin_all" on grupos_comunidad for all using (is_admin()) with check (is_admin());

-- Datos semilla: 51 grupos parseados de docs/Estructura_Herramientas.md
-- (1 Grupo Principal + 35 Miami + 8 Orlando/Centro FL + 2 Venta y Renta +
-- 5 Otros). enlace_url queda NULL en todos — completar desde
-- /admin/herramientas.
insert into grupos_comunidad (nombre, categoria, detalle, tipo_canal, orden) values
  ('Grupo Principal del Equipo', 'grupo_principal', null, 'whatsapp', 1),

  ('Bentley Residences', 'miami', 'Miami', 'whatsapp', 1),
  ('Botanic Residences', 'miami', 'Miami', 'whatsapp', 2),
  ('Cassia Coral', 'miami', 'Miami', 'whatsapp', 3),
  ('COVE', 'miami', 'Miami', 'whatsapp', 4),
  ('DELANO Residences', 'miami', 'Miami Beach', 'whatsapp', 5),
  ('Domus', 'miami', 'Miami', 'whatsapp', 6),
  ('Doppio', 'miami', 'Miami', 'whatsapp', 7),
  ('Edge House', 'miami', 'Miami', 'whatsapp', 8),
  ('Elle Residences', 'miami', 'Miami', 'whatsapp', 9),
  ('Frida Kahlo', 'miami', 'Miami', 'whatsapp', 10),
  ('GAIA Residences', 'miami', 'Miami', 'whatsapp', 11),
  ('House of Wellness 2029', 'miami', 'Miami', 'whatsapp', 12),
  ('HQ Residences', 'miami', 'Miami', 'whatsapp', 13),
  ('ICON 192', 'miami', 'Miami', 'whatsapp', 14),
  ('Jean Georges', 'miami', 'Miami', 'whatsapp', 15),
  ('Mandarin Residences', 'miami', 'Miami', 'whatsapp', 16),
  ('Melia Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 17),
  ('Mercedes-Benz Residences', 'miami', 'Miami', 'whatsapp', 18),
  ('Midtown Park', 'miami', 'Miami', 'whatsapp', 19),
  ('Mondrian Hallandale', 'miami', 'Hallandale Beach', 'whatsapp', 20),
  ('Nexo', 'miami', 'Miami', 'whatsapp', 21),
  ('NoBe Parc', 'miami', 'North Beach', 'whatsapp', 22),
  ('Okan Tower', 'miami', 'Miami', 'whatsapp', 23),
  ('One Hollywood', 'miami', 'Hollywood, FL', 'whatsapp', 24),
  ('One Twenty Signature Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 25),
  ('PALMA', 'miami', 'Miami', 'whatsapp', 26),
  ('River District', 'miami', 'Miami', 'whatsapp', 27),
  ('Seven Park', 'miami', 'Miami', 'whatsapp', 28),
  ('Shoma Bay', 'miami', 'Miami', 'whatsapp', 29),
  ('Standard Residences', 'miami', 'Miami', 'whatsapp', 30),
  ('The William', 'miami', 'Miami', 'whatsapp', 31),
  ('VICEROY Brickell', 'miami', 'Brickell, Miami', 'whatsapp', 32),
  ('Vista Harbor', 'miami', 'Miami', 'whatsapp', 33),
  ('Visions', 'miami', 'Miami', 'whatsapp', 34),
  ('W Pompano Beach', 'miami', 'Pompano Beach', 'whatsapp', 35),

  ('14 ROC - Team Wilmar Sosa', 'orlando_centro_florida', 'Residencial', 'whatsapp', 1),
  ('DR Horton con Angel Acosta', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 2),
  ('GZ Tower Orlando', 'orlando_centro_florida', 'Torre', 'whatsapp', 3),
  ('Lennar Group – Orlando Division', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 4),
  ('Millenia Park', 'orlando_centro_florida', 'Residencial', 'whatsapp', 5),
  ('NICKELODEON Orlando', 'orlando_centro_florida', 'Proyecto temático', 'whatsapp', 6),
  ('Taylor Morrison Orlando', 'orlando_centro_florida', 'Constructor nacional', 'whatsapp', 7),
  ('Watersong Lotes', 'orlando_centro_florida', 'Lotes / tierra', 'whatsapp', 8),

  ('Listing de Venta / Team 100 Real', 'venta_renta', 'Propiedades activas en venta', 'whatsapp', 1),
  ('Community Rental – Team Wilmar Sosa', 'venta_renta', 'Segmento de rentas', 'whatsapp', 2),

  ('26th & 2nd', 'otros', null, 'whatsapp', 1),
  ('Parkside', 'otros', null, 'whatsapp', 2),
  ('SEVENTEEN GABLES', 'otros', null, 'whatsapp', 3),
  ('Casa Bella', 'otros', 'Archivos del proyecto', 'dropbox', 4),
  ('Lennar Miami', 'otros', 'División Miami del constructor Lennar', 'whatsapp', 5);
