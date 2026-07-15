-- 010_aliados.sql
-- Directorio de aliados estratégicos (proveedores externos que dan soporte
-- al negocio del agente: LLC/impuestos, hipotecas, transaction coordinator,
-- marketing digital), mostrado en /aliados.
-- Mismo patrón que 009_proyectos_aliados.sql: catálogo de lectura pública
-- (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- contacto_nombre / contacto_telefono / contacto_correo son texto libre
-- donde cada línea es un contacto, alineadas por índice entre las tres
-- columnas — evita una tabla relacional aparte solo para el caso de "Keep
-- It Simple" (dos contactos: Anahis y Antonio). Los otros 3 aliados tienen
-- una sola línea en cada columna (un solo contacto).
--
-- imagen_url viene completo desde el seed (a diferencia de
-- proyectos_aliados.imagen_url, que se sembró en NULL): las 4 fotos ya
-- estaban subidas a Supabase Storage al escribir esta migración.

create table aliados (
  id uuid primary key default gen_random_uuid(),
  servicio text not null,
  descripcion text not null,
  contacto_nombre text not null,
  contacto_telefono text not null,
  contacto_correo text not null,
  imagen_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index aliados_orden_idx on aliados(orden);
create index aliados_activo_idx on aliados(activo);

alter table aliados enable row level security;
create policy "aliados_select_all" on aliados for select using (true);
create policy "aliados_admin_all" on aliados for all using (is_admin()) with check (is_admin());

-- Exige que las tres columnas de contacto tengan el mismo número de líneas
-- (separadas por \n): un desajuste asociaría en silencio el teléfono o
-- correo de un contacto con el nombre incorrecto.
alter table aliados add constraint aliados_contactos_alineados check (
  array_length(regexp_split_to_array(contacto_nombre, E'\n'), 1) =
    array_length(regexp_split_to_array(contacto_telefono, E'\n'), 1)
  and array_length(regexp_split_to_array(contacto_nombre, E'\n'), 1) =
    array_length(regexp_split_to_array(contacto_correo, E'\n'), 1)
);

-- Datos semilla: 4 aliados estratégicos, contenido real capturado del sitio
-- de referencia (ver docs/superpowers/specs/2026-07-15-aliados-design.md,
-- sección 2).
insert into aliados (servicio, descripcion, contacto_nombre, contacto_telefono, contacto_correo, imagen_url, orden) values
  ('Tributaria LLC', 'Asistencia integral en la creación y renovación de sociedades LLC, actualización del Operating Agreement y presentación de taxes (impuestos anuales). Acompañamiento continuo durante todo el proceso de venta y soporte postventa personalizado.', 'Ricardo Fernandez de Cordoba Martos', '+1 (305) 458-6559', 'ricardo.fernandez@firstglobalfinanceus.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-ricardo-fernandez-c4k6Rpie.jpeg', 1),
  ('Préstamos Hipotecarios - Cornerstone First Mortgage', 'Con 23 años de experiencia, es gerente en First Mortgage y una guía clave para primeros compradores. Se especializa en explicar de forma clara el proceso financiero, ayudando especialmente a clientes del extranjero a entender cómo invertir en una propiedad puede generar capital a largo plazo y brindar estabilidad financiera.', 'Rafael Aguilera', '+1 (305) 297-5104', 'raguilera@cfmtg.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-rafael-aguilera-HW7GQnh0.jpeg', 2),
  ('Keep It Simple - Transaction Coordinator', 'Keep It Simple surge con el objetivo de brindar apoyo remoto a agentes inmobiliarios, acompañándolos durante todo el proceso de compraventa. Actuamos como un puente clave entre el cliente y el agente para coordinar tiempos, avisos y depósitos, y también entre el agente y el broker en temas de cobro y pago de comisiones. Nuestro compromiso es proteger siempre los intereses del agente, asegurando que cada paso del proceso se realice de manera clara, documentada, conforme a la normativa vigente y dentro de los plazos establecidos.', E'Anahis\nAntonio', E'+1 (478) 412-5213\n+1 (832) 299-5129', E'Anahis@keepitsimple.properties\nAntonio@keepitsimple.properties', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-keep-it-simple-CfsV0J1H.png', 3),
  ('Grow Marketing - Agencia de Marketing Digital Inmobiliario', 'Especialista en gerencia de mercadeo y experta en marketing digital inmobiliario. Desde hace más de cuatro años ayuda a agentes de bienes raíces a generar leads calificados mediante campañas efectivas en Facebook Ads. Ofrece servicios de configuración, optimización y gestión de campañas digitales, con un enfoque estratégico en el sector inmobiliario.', 'Carolina Sanabria', '+57 313 339 6751', 'Carolina.Sanabria@growmarketing.com', 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados/aliado-carolina-sanabria-D1bm9UDi.jpeg', 4);
