-- 009_proyectos_aliados.sql
-- Catálogo de proyectos inmobiliarios aliados (preconstrucciones con
-- comisión para el equipo), mostrado en /proyectos-inmobiliarios-aliados.
-- Mismo patrón que 008_grupos_comunidad.sql: catálogo de lectura pública
-- (cualquier autenticado), gestionado solo por un admin.
-- Depende de 001_esquema.sql y 002_usuarios.sql (usa is_admin()).
--
-- precio_desde es texto libre (no numérico): el formato varía por
-- proyecto y no hay necesidad de ordenar/filtrar por precio (10 ítems).
-- Es nullable porque 2 de los 10 proyectos no traen precio en el
-- contenido fuente (Elle Residences, GZ Tower).
--
-- whatsapp_url viene completo desde el seed (a diferencia de
-- grupos_comunidad.enlace_url): los 10 enlaces reales ya estaban
-- disponibles al escribir esta migración.
--
-- imagen_url se siembra en NULL: las 10 fotos existen localmente pero se
-- suben manualmente a Supabase Storage después (ver
-- public/images/proyectos-aliados/README.md) y se completan desde
-- /admin/proyectos-inmobiliarios-aliados.

create table proyectos_aliados (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text not null,
  precio_desde text,
  contacto_nombre text not null,
  contacto_telefono text not null,
  whatsapp_url text not null,
  imagen_url text,
  orden int not null default 0,
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);
create index proyectos_aliados_orden_idx on proyectos_aliados(orden);
create index proyectos_aliados_activo_idx on proyectos_aliados(activo);

alter table proyectos_aliados enable row level security;
create policy "proyectos_aliados_select_all" on proyectos_aliados for select using (true);
create policy "proyectos_aliados_admin_all" on proyectos_aliados for all using (is_admin()) with check (is_admin());

-- Datos semilla: 10 proyectos aliados, contenido real capturado del sitio
-- de referencia (ver docs/superpowers/specs/2026-07-15-proyectos-aliados-design.md,
-- sección 2).
insert into proyectos_aliados (nombre, descripcion, precio_desde, contacto_nombre, contacto_telefono, whatsapp_url, orden) values
  ('Domus', 'Una nueva revolución en el lujo urbano, ubicado en el distrito financiero de Miami, Brickell. Estudios y apartamentos de 1 y 2 habitaciones completamente amoblados.', 'Desde $480K', 'Diana Garcia', '+1 (305) 606-4208', 'https://chat.whatsapp.com/GHHgOqknNKgEh2hiEkqo7M?mode=wwc', 1),
  ('Delano', 'Descubre Delano Residences & Hotel Miami, una torre icónica en Downtown que combina lujo, residencias exclusivas y renta corta, con amenidades de primer nivel como rooftop pool, spa, restaurante y acceso a servicios de playa.', 'Desde $725K', 'Christian Tupper', '+1 (786) 351-3342', 'https://chat.whatsapp.com/CsU3wnH91AX0WoPD3PFGOY', 2),
  ('Palma', 'Descubre Palma Miami Beach, residencias de lujo completamente amobladas, con acceso a beach club, amenidades tipo resort y sin restricciones de renta. Vive o invierte en el destino soñado frente al mar.', 'Desde $650K', 'Danny Neumann', '+1 (786) 521-5992', 'https://chat.whatsapp.com/HbFwLGQhZuyBDiTV1zE5wq', 3),
  ('The House of Wellness', 'House of Wellness en Brickell redefine el estilo de vida con un enfoque en bienestar integral, combinando fitness, spa, recuperación y comunidad en un solo lugar. Diseñado para equilibrar la energía de la ciudad con la tranquilidad diaria.', 'Desde $400K', 'Natalia Rojas', '+1 (305) 767-5840', 'https://chat.whatsapp.com/Hf2vxF4QSBBG7xrszLLMia?mode=gi_t', 4),
  ('Meliá', 'Meliá Residences Miami, un proyecto hotelero en Brickell diseñado para generar ingresos pasivos. Unidades amobladas, operación por Meliá y alta demanda turística. Entrega 2027.', 'Desde $539K', 'Luisiana Gamboa', '+1 (786) 707-9944', 'https://chat.whatsapp.com/Bm1SLnpvRmJ76KJDBCvf7u?mode=gi_t', 5),
  ('Edge House', 'Oportunidad de inversión en Miami. Proyecto de 57 pisos con 600 unidades, renta corta permitida desde 1 noche y unidades amobladas por Adriana Hoyos. Estructura flexible desde 5% inicial, con leaseback del 10% anual. Entrega 2028.', 'Desde $495K', 'Jessica Rivera', '+1 (786) 499-9237', 'https://chat.whatsapp.com/JqdXGJDf6OXAplxC8iGtmA?mode=wwc', 6),
  ('Elle Residences', 'Ofrece residencias de lujo completamente amobladas, con renta flexible y amenidades tipo resort. Ubicación estratégica y respaldo de una marca global de lifestyle. Ideal para inversionistas que buscan exclusividad y rentabilidad en Miami.', null, 'Alex Cardona', '+1 (786) 366-2666', 'https://chat.whatsapp.com/FPcCprZSLCaIgOfvoYMOPR?mode=wwc', 7),
  ('GZ Tower', 'Proyecto de renta corta a 5 minutos de Universal Studios con 357 unidades turnkey (studios, 1BR y lockouts). Edificio de 17 pisos con amenidades tipo resort y alta demanda turística.', null, 'Katherine Vargas', '+1 (689) 233-6683', 'https://chat.whatsapp.com/BcYhZZ2gToI8LLs3qoDQr2?mode=gi_t', 8),
  ('Millenia Park', 'Enfocado en renta anual (no short term), en un mercado con +95% de ocupación. Entregas por fases hasta 2028. Estructura flexible según fase (desde 20%–30% inicial + pagos durante construcción). Ideal para inversionistas que buscan estabilidad y flujo constante a largo plazo.', 'Desde $289K', 'Marisol Prada', '+1 (786) 948-4060', 'https://chat.whatsapp.com/IO6ARY3HkljACCTiQwSsvR?mode=wwc', 9),
  ('The Standard', 'The Standard Residences Brickell Miami: torre de 46 pisos con 422 unidades y política de renta flexible (30 días, hasta 12 veces al año). Ubicación estratégica en Brickell con alto potencial de inversión.', 'Desde $621K', 'Nathalie Fernandez', '+1 (305) 331-3151', 'https://chat.whatsapp.com/EmUIqBubafQCaO47DOB8WM?mode=wwc', 10);

update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/domus-brickell-DHlkSPs2.png' where nombre = 'Domus';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/delano-miami-CpKrHLsz.png' where nombre = 'Delano';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/palma-miami-CCNcd5kC.png' where nombre = 'Palma';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/house-of-wellness-D2aPMcsG.png' where nombre = 'The House of Wellness';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/melia-miami-DGN_m5sT.png' where nombre = 'Meliá';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/edge-house-BBDirAd2.png' where nombre = 'Edge House';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/elle-residences-YDZjDmyu.png' where nombre = 'Elle Residences';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/gz-tower-BRxY1Npk.png' where nombre = 'GZ Tower';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/millenia-park-Cp6M3j55.png' where nombre = 'Millenia Park';
update proyectos_aliados set imagen_url = 'https://evyrxbimjqieqthingtm.supabase.co/storage/v1/object/public/Fotografias/aliados_inmobiliarios/the-standard-BrL7yoZp.png' where nombre = 'The Standard';
