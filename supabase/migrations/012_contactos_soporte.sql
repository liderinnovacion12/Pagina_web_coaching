-- 012_contactos_soporte.sql
-- Directorio de contactos del equipo corporativo de My Realty ("Corporate
-- Allies": CEO, directores, coordinadores), mostrado en /soporte. Tabla
-- nueva y dedicada, separada de miembros_equipo (que alimenta la sección
-- "Team Leaders" del dashboard del estudiante) para no mezclar ambos
-- conceptos sin un campo distintivo — mismo criterio que cada módulo
-- anterior de esta serie (una tabla por catálogo/feature).
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).

create table contactos_soporte (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  cargo text not null,
  descripcion_cargo text not null,
  telefono text not null,
  correo text not null,
  foto_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index contactos_soporte_orden_idx on contactos_soporte(orden);
create index contactos_soporte_activo_idx on contactos_soporte(activo);

alter table contactos_soporte enable row level security;
create policy "contactos_soporte_select_all" on contactos_soporte for select using (true);
create policy "contactos_soporte_admin_all" on contactos_soporte for all using (is_admin()) with check (is_admin());

-- Datos semilla: 9 contactos reales del equipo corporativo (contenido
-- capturado del sitio de referencia, ver
-- docs/superpowers/specs/2026-07-16-soporte-design.md sección 3). Las 9
-- fotos ya están subidas a Supabase Storage.
insert into contactos_soporte (nombre, cargo, descripcion_cargo, telefono, correo, foto_url, orden) values
  ('John Díaz', 'CEO', 'Director ejecutivo de la empresa', '+1 (305) 593-6361', 'jdiaz@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-john-diaz-BpGGZ1rN.jpeg', 1),
  ('Luis Pinto', 'DIRECTOR – EDUCATION & MENTORSHIP', 'Responsable de educación y mentoría para agentes', '+1 (407) 697-5905', 'luisbroker@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-luis-pinto-BVHz9DqY.jpeg', 2),
  ('Gabriela Guerrero', 'DIRECTOR – OPERATIONS & ACCOUNTING', 'Directora de operaciones y contabilidad', '+1 (786) 650-0037', 'support@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-gabriela-guerrero-B9CDv6-Z.jpeg', 3),
  ('Jeimmy Lema', 'COMPLIANCE COORDINATOR', 'Coordinadora de cumplimiento normativo', '+1 (788) 847-0332', 'compliance@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-jeimmy-lema-DcvEASeQ.jpeg', 4),
  ('Marcos Urbina', 'DIRECTOR – EXPANSION & GROWTH', 'Director de expansión y crecimiento del equipo', '+1 (321) 388-3150', 'marcos@marcosurbina.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-marcos-urbina-CzOhg6fK.jpeg', 5),
  ('Pablo Correa', 'DIRECTOR – TECHNOLOGY', 'Director de tecnología y sistemas', '+1 (786) 433-8768', 'pablocorrea@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-pablo-correa-Cdz7x_R2.jpeg', 6),
  ('Andrés Díaz', 'DIRECTOR – MARKETING', 'Director de marketing y comunicaciones', '+1 (305) 593-6376', 'marketing@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-andres-diaz-BxLhqRwR.jpeg', 7),
  ('María Ramírez', 'ONBOARDING COORDINATOR', 'Coordinadora de integración de nuevos agentes', '+1 (305) 851-2353', 'onboarding@teammyrealty.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-maria-ramirez-Dtx8luz2.jpeg', 8),
  ('Julie Meneses', 'MENTORA', 'Mentora del equipo', '+1 (788) 356-3277', 'julieturealtor@gmail.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/soporte/contact-julie-meneses-B3vj4Qim.jpeg', 9);
