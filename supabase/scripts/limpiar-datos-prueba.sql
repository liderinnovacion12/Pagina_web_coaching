-- limpiar-datos-prueba.sql
-- Ejecutar manualmente en el SQL Editor de Supabase.
-- Vacía todas las tablas de contenido/actividad (no toca `usuarios`, que
-- depende de las cuentas reales de Supabase Auth y no debe borrarse por
-- aquí). Usalo antes de volver a correr seed-datos-prueba.sql.
--
-- A diferencia de 000_drop_all.sql (que borra tablas, funciones, triggers
-- y tipos), este script solo vacía los datos: el esquema queda intacto.

truncate table
  usuario_intereses,
  insignias_usuario,
  insignias,
  xp_eventos,
  quiz_intentos,
  progreso,
  membresia,
  inscripciones,
  lecciones,
  cursos
cascade;
