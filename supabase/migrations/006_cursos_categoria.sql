-- 006_cursos_categoria.sql
-- Fase 1 de páginas interiores de estudiante: diferencia los cursos "pilares"
-- del Sistema 100+ del resto del catálogo (Clases), y agrega el título de
-- lección que faltaba en el esquema original (001_coachpro_schema.sql) --
-- necesario para listar lecciones en la UI de curso/reproductor.

alter table cursos add column categoria text not null default 'clases'
  check (categoria in ('sistema_100', 'clases'));

alter table lecciones add column titulo text not null default 'Lección sin título';
alter table lecciones alter column titulo drop default;
