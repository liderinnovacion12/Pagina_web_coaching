-- asignar-rol-usuario.sql
-- Ejecutar manualmente en el SQL Editor de Supabase para asignar un rol a
-- UN usuario real (no de prueba). Úsalo cuando necesites promover a
-- alguien a 'coach' o 'admin' después de que ya se haya registrado en la
-- plataforma (via /registro) o lo hayas creado desde el dashboard de
-- Supabase Auth (Authentication → Users).
--
-- El trigger on_auth_user_created (002_usuarios.sql / 003_triggers.sql)
-- ya creó su fila en `usuarios` con rol='estudiante' por defecto; este
-- script solo actualiza el rol. No inserta nada nuevo.
--
-- Antes de ejecutar: reemplaza el correo y el rol en las líneas marcadas
-- con <<<.

-- Consulta de ayuda: ver el UUID real de un usuario a partir de su
-- correo (útil si necesitas copiarlo para pegarlo en otro lugar, p. ej.
-- para revisarlo en el dashboard de Supabase Auth o en otra tabla).
-- select id, email, rol from usuarios where email = 'correo-real-del-usuario@ejemplo.com';

update usuarios
set rol = 'coach' -- <<< 'admin' | 'coach' | 'estudiante'
where email = 'correo-real-del-usuario@ejemplo.com' -- <<< reemplaza por el correo real
returning id, email, rol;

-- Opcional: si lo promoviste a coach, asígnale un curso existente para
-- que las políticas RLS "coach_*" tengan sobre qué trabajar. No hace
-- falta que sepas el UUID de nadie: tanto el usuario como el curso se
-- buscan por un dato humano-legible (correo y título).
-- update cursos
-- set coach_id = (select id from usuarios where email = 'correo-real-del-usuario@ejemplo.com')
-- where titulo = 'Título exacto del curso'; -- <<< reemplaza por el título real
