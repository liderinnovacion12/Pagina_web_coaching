-- seed-datos-prueba.sql
-- Ejecutar manualmente en el SQL Editor de Supabase, despues de aplicar
-- las migraciones (supabase/migrations/) y de crear/promover la cuenta
-- demo user@test.com (supabase/scripts/seed-demo-users.sql).
--
-- Inserta datos de prueba en todas las tablas EXCEPTO `usuarios`: esa
-- tabla se llena automaticamente via el trigger on_auth_user_created al
-- registrarse en Supabase Auth, no se inserta a mano.
--
-- El contenido (cursos/lecciones) esta basado en los modulos descritos en
-- docs/descripcion_contenido_pagina.txt: los 5 pilares de Sistema 100+ y
-- varias categorias de la videoteca de Clases (Rentas, CRM, Mercadeo,
-- Practica de conversaciones, Construccion de equipo, Transacciones).
--
-- Nota sobre el error "column ... is of type uuid but expression is of
-- type text": ocurria porque, dentro de un UNION ALL, Postgres resuelve
-- el tipo de un literal como 'text' cuando no hay otra pista de tipo en
-- ninguna de las ramas, y no existe cast implicito de text a uuid/enum.
-- Por eso aqui cada literal uuid/enum lleva su cast explicito (::uuid,
-- ::origen_inscripcion, ::estado_membresia).

-- ── Cursos: Sistema 100+ (5 pilares) ─────────────────────────────────────
insert into cursos (id, titulo, precio, publicado, categoria) values
  ('11111111-1111-1111-1111-111111111101'::uuid, 'Pilar 1 · Fundamentos', 0, true, 'sistema_100'),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'Pilar 2 · Nicho', 0, true, 'sistema_100'),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'Pilar 3 · Productividad y Organización', 0, true, 'sistema_100'),
  ('11111111-1111-1111-1111-111111111104'::uuid, 'Pilar 4 · Mercadeo', 0, true, 'sistema_100'),
  ('11111111-1111-1111-1111-111111111105'::uuid, 'Pilar 5 · Ventas', 0, true, 'sistema_100');

-- ── Cursos: Clases (videoteca / catálogo comprable) ──────────────────────
insert into cursos (id, titulo, precio, publicado, categoria) values
  ('11111111-1111-1111-1111-111111111106'::uuid, 'Maestría en Rentas', 149.00, true, 'clases'),
  ('11111111-1111-1111-1111-111111111107'::uuid, 'CRM GoHighLevel para Agentes', 77.00, true, 'clases'),
  ('11111111-1111-1111-1111-111111111108'::uuid, 'Mercadeo Digital e IA', 99.00, true, 'clases'),
  ('11111111-1111-1111-1111-111111111109'::uuid, 'Conversaciones en Venta: Práctica y Objeciones', 89.00, true, 'clases'),
  ('11111111-1111-1111-1111-111111111110'::uuid, 'Construcción de Equipo', 59.00, true, 'clases'),
  ('11111111-1111-1111-1111-111111111111'::uuid, 'Transacciones y BackOffice', 39.00, true, 'clases');

-- ── Lecciones · Pilar 1: Fundamentos ─────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111201'::uuid, '11111111-1111-1111-1111-111111111101'::uuid, 'Mentalidad de empresario', 'video', 1),
  ('11111111-1111-1111-1111-111111111202'::uuid, '11111111-1111-1111-1111-111111111101'::uuid, 'Identidad del equipo y estándar de producción', 'video', 2),
  ('11111111-1111-1111-1111-111111111203'::uuid, '11111111-1111-1111-1111-111111111101'::uuid, 'Disciplina comercial y responsabilidad', 'video', 3),
  ('11111111-1111-1111-1111-111111111204'::uuid, '11111111-1111-1111-1111-111111111101'::uuid, 'Resumen del pilar: Fundamentos', 'video', 4);

-- ── Lecciones · Pilar 2: Nicho ────────────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111205'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, 'Define tu audiencia objetivo', 'video', 1),
  ('11111111-1111-1111-1111-111111111206'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, 'Construye tu Base 100', 'video', 2),
  ('11111111-1111-1111-1111-111111111207'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, 'Conversaciones que abren puertas', 'video', 3),
  ('11111111-1111-1111-1111-111111111208'::uuid, '11111111-1111-1111-1111-111111111102'::uuid, 'Tu producto bandera', 'video', 4);

-- ── Lecciones · Pilar 3: Productividad y Organización ────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111209'::uuid, '11111111-1111-1111-1111-111111111103'::uuid, 'Sistemas de organización para escalar', 'video', 1),
  ('11111111-1111-1111-1111-111111111210'::uuid, '11111111-1111-1111-1111-111111111103'::uuid, 'Herramientas de seguimiento diario', 'video', 2),
  ('11111111-1111-1111-1111-111111111211'::uuid, '11111111-1111-1111-1111-111111111103'::uuid, 'Rutinas de alto rendimiento', 'video', 3);

-- ── Lecciones · Pilar 4: Mercadeo ─────────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111212'::uuid, '11111111-1111-1111-1111-111111111104'::uuid, 'Construye tu máquina de leads', 'video', 1),
  ('11111111-1111-1111-1111-111111111213'::uuid, '11111111-1111-1111-1111-111111111104'::uuid, 'Contenido que atrae clientes', 'video', 2),
  ('11111111-1111-1111-1111-111111111214'::uuid, '11111111-1111-1111-1111-111111111104'::uuid, 'Posicionamiento y marca personal', 'video', 3);

-- ── Lecciones · Pilar 5: Ventas ───────────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111215'::uuid, '11111111-1111-1111-1111-111111111105'::uuid, 'De la conversación a la cita', 'video', 1),
  ('11111111-1111-1111-1111-111111111216'::uuid, '11111111-1111-1111-1111-111111111105'::uuid, 'Seguimiento efectivo', 'video', 2),
  ('11111111-1111-1111-1111-111111111217'::uuid, '11111111-1111-1111-1111-111111111105'::uuid, 'Manejo de objeciones y cierre', 'video', 3);

-- ── Lecciones · Maestría en Rentas ────────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111218'::uuid, '11111111-1111-1111-1111-111111111106'::uuid, 'Fundamentos del mercado de rentas', 'video', 1),
  ('11111111-1111-1111-1111-111111111219'::uuid, '11111111-1111-1111-1111-111111111106'::uuid, 'Scripts de llamadas y correos para rentas', 'video', 2),
  ('11111111-1111-1111-1111-111111111220'::uuid, '11111111-1111-1111-1111-111111111106'::uuid, 'Plan de activación de 30 días', 'video', 3);

-- ── Lecciones · CRM GoHighLevel ───────────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111221'::uuid, '11111111-1111-1111-1111-111111111107'::uuid, 'Recorrido guiado por el CRM', 'video', 1),
  ('11111111-1111-1111-1111-111111111222'::uuid, '11111111-1111-1111-1111-111111111107'::uuid, 'Automatizaciones y plantillas listas para usar', 'video', 2);

-- ── Lecciones · Mercadeo Digital e IA ─────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111223'::uuid, '11111111-1111-1111-1111-111111111108'::uuid, '100 Hooks virales para redes', 'video', 1),
  ('11111111-1111-1111-1111-111111111224'::uuid, '11111111-1111-1111-1111-111111111108'::uuid, 'Define tu cliente ideal (avatar)', 'video', 2),
  ('11111111-1111-1111-1111-111111111225'::uuid, '11111111-1111-1111-1111-111111111108'::uuid, 'IA aplicada al marketing inmobiliario', 'video', 3);

-- ── Lecciones · Conversaciones en Venta: Práctica y Objeciones ───────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111226'::uuid, '11111111-1111-1111-1111-111111111109'::uuid, 'Cinco preguntas de precalificación', 'video', 1),
  ('11111111-1111-1111-1111-111111111227'::uuid, '11111111-1111-1111-1111-111111111109'::uuid, 'Técnica EMC y cierres generales', 'video', 2),
  ('11111111-1111-1111-1111-111111111228'::uuid, '11111111-1111-1111-1111-111111111109'::uuid, 'Manejo de objeciones frecuentes', 'video', 3);

-- ── Lecciones · Construcción de Equipo ────────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111229'::uuid, '11111111-1111-1111-1111-111111111110'::uuid, 'De agente a líder: multiplica tus ingresos', 'video', 1),
  ('11111111-1111-1111-1111-111111111230'::uuid, '11111111-1111-1111-1111-111111111110'::uuid, 'Escala tu negocio: de agente a empresario', 'video', 2);

-- ── Lecciones · Transacciones y BackOffice ────────────────────────────────
insert into lecciones (id, curso_id, titulo, tipo_contenido, orden) values
  ('11111111-1111-1111-1111-111111111231'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Cómo montar una transacción en BackOffice', 'video', 1),
  ('11111111-1111-1111-1111-111111111232'::uuid, '11111111-1111-1111-1111-111111111111'::uuid, 'Checklist de documentos requeridos', 'video', 2);

-- ── Insignias ─────────────────────────────────────────────────────────────
insert into insignias (id, nombre, descripcion, icono) values
  ('11111111-1111-1111-1111-111111111301'::uuid, 'Primeros pasos', 'Completaste tu primera lección', '🎯'),
  ('11111111-1111-1111-1111-111111111302'::uuid, 'Racha de 7 días', 'Estudiaste 7 días seguidos', '🔥'),
  ('11111111-1111-1111-1111-111111111303'::uuid, 'Cierre Maestro', 'Completaste el pilar de Ventas', '🤝'),
  ('11111111-1111-1111-1111-111111111304'::uuid, 'Prospector Incansable', 'Construiste tu Base 100', '📇'),
  ('11111111-1111-1111-1111-111111111305'::uuid, 'Mentor del Equipo', 'Completaste Construcción de Equipo', '🌟'),
  ('11111111-1111-1111-1111-111111111306'::uuid, 'Experto en Rentas', 'Completaste Maestría en Rentas', '🏠');

-- ── Inscripciones (requiere la cuenta demo user@test.com) ───────────────
insert into inscripciones (usuario_id, curso_id, origen)
select u.id, x.curso_id, x.origen
from usuarios u
cross join (values
  ('11111111-1111-1111-1111-111111111101'::uuid, 'membresia'::origen_inscripcion),
  ('11111111-1111-1111-1111-111111111102'::uuid, 'membresia'::origen_inscripcion),
  ('11111111-1111-1111-1111-111111111103'::uuid, 'membresia'::origen_inscripcion),
  ('11111111-1111-1111-1111-111111111106'::uuid, 'compra_individual'::origen_inscripcion),
  ('11111111-1111-1111-1111-111111111109'::uuid, 'compra_individual'::origen_inscripcion)
) as x(curso_id, origen)
where u.email = 'user@test.com';

-- ── Membresía ─────────────────────────────────────────────────────────────
insert into membresia (usuario_id, estado, periodo_fin)
select id, 'activa'::estado_membresia, now() + interval '30 days'
from usuarios where email = 'user@test.com';

-- ── Progreso (Pilares 1 y 2 completos, Pilar 3 a medias) ────────────────
insert into progreso (usuario_id, leccion_id, segundo_actual, completado)
select u.id, x.leccion_id, x.segundo_actual, x.completado
from usuarios u
cross join (values
  ('11111111-1111-1111-1111-111111111201'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111202'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111203'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111204'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111205'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111206'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111207'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111208'::uuid, 0, true),
  ('11111111-1111-1111-1111-111111111209'::uuid, 180, false),
  ('11111111-1111-1111-1111-111111111218'::uuid, 340, false)
) as x(leccion_id, segundo_actual, completado)
where u.email = 'user@test.com';

-- ── Quiz intentos ─────────────────────────────────────────────────────────
insert into quiz_intentos (usuario_id, leccion_id, calificacion)
select u.id, x.leccion_id, x.calificacion
from usuarios u
cross join (values
  ('11111111-1111-1111-1111-111111111204'::uuid, 90),
  ('11111111-1111-1111-1111-111111111208'::uuid, 85)
) as x(leccion_id, calificacion)
where u.email = 'user@test.com';

-- ── XP eventos ────────────────────────────────────────────────────────────
insert into xp_eventos (usuario_id, origen, puntos)
select u.id, x.origen, x.puntos
from usuarios u
cross join (values
  ('leccion_completada', 10),
  ('leccion_completada', 10),
  ('leccion_completada', 10),
  ('quiz_aprobado', 20),
  ('quiz_aprobado', 15),
  ('racha_semanal', 50)
) as x(origen, puntos)
where u.email = 'user@test.com';

-- ── Insignias del usuario ─────────────────────────────────────────────────
insert into insignias_usuario (usuario_id, insignia_id)
select u.id, x.insignia_id
from usuarios u
cross join (values
  ('11111111-1111-1111-1111-111111111301'::uuid),
  ('11111111-1111-1111-1111-111111111302'::uuid),
  ('11111111-1111-1111-1111-111111111304'::uuid)
) as x(insignia_id)
where u.email = 'user@test.com';

-- ── Intereses del usuario ─────────────────────────────────────────────────
insert into usuario_intereses (usuario_id, sector)
select u.id, s.sector
from usuarios u
cross join unnest(array['ventas', 'liderazgo', 'marketing']) as s(sector)
where u.email = 'user@test.com';
