-- 004_rol_coach_enum.sql
-- Agrega el valor 'coach' al enum rol_usuario. Debe aplicarse en su propia
-- ejecucion, separado de 005_rol_coach_rls.sql: Postgres no permite usar
-- un valor de enum recien agregado dentro de la misma transaccion en la
-- que se agrego, y 005 usa el literal 'coach' en is_coach().

alter type rol_usuario add value 'coach';
