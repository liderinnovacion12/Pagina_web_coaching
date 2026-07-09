-- seed-miembros-equipo.sql
-- Ejecutar manualmente en el SQL Editor de Supabase, despues de aplicar
-- supabase/migrations/005_miembros_equipo.sql.
--
-- Inserta los dos Team Leaders actuales para la seccion "Cultura y Equipo".
-- IMPORTANTE: telefono y correo quedan con un valor PLACEHOLDER (aun no
-- se proporcionaron los reales) -- reemplazalos con un UPDATE antes de
-- publicar la pagina:
--
--   update miembros_equipo set telefono = '+1...', correo = '...'
--   where nombre = 'Wilmar Sosa';
--
-- foto_url asume que subiste las fotos con los nombres documentados en
-- public/images/cultura/README.md (wilmar-sosa.jpg / samuel-oropeza.jpg).
--
-- Es seguro correrlo una sola vez: no tiene proteccion de duplicados, asi
-- que si necesitas re-ejecutarlo primero borra estas dos filas.

insert into miembros_equipo (nombre, cargo, descripcion_cargo, telefono, correo, foto_url, orden) values
  (
    'Wilmar Sosa',
    'Ventas y Liderazgo',
    'Agente inmobiliario, top producer y coach en liderazgo y ventas. Ayuda a agentes a fortalecer su influencia, claridad y capacidad de cierre.',
    '+00000000000',
    'pendiente@teamwilmarsosa.com',
    '/images/cultura/wilmar-sosa.jpg',
    1
  ),
  (
    'Samuel Oropeza',
    'Marketing e Inteligencia Artificial',
    'Agente inmobiliario, coach en mercadeo, ventas y crecimiento de equipos. Especialista en sistemas y automatizaciones que generan prospectos.',
    '+00000000000',
    'pendiente@teamwilmarsosa.com',
    '/images/cultura/samuel-oropeza.jpg',
    2
  );
