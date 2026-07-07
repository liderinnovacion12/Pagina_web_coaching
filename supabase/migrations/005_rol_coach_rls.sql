-- 005_rol_coach_rls.sql
-- Agrega el modelo de propiedad de cursos por coach y las politicas RLS
-- correspondientes. Requiere que 004_rol_coach_enum.sql ya se haya
-- aplicado (el valor 'coach' del enum rol_usuario debe existir).
--
-- Modelo: un curso pertenece a un coach via cursos.coach_id. Un coach
-- solo puede operar sobre sus propios cursos y las lecciones de esos
-- cursos, y solo puede LEER (no escribir) inscripciones/progreso/
-- quiz_intentos de sus estudiantes. Admin conserva acceso total via las
-- politicas *_admin_all ya existentes (001_coachpro_schema.sql), que no
-- se modifican. El trigger prevent_rol_self_escalation_trigger (002/003)
-- ya bloquea que un usuario no-admin se auto-promueva a 'coach'.

alter table cursos add column coach_id uuid references usuarios(id);
create index cursos_coach_id_idx on cursos(coach_id);

create or replace function is_coach()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and rol = 'coach'
  );
$$;

-- CURSOS: el coach ve y gestiona solo lo suyo (incluye no publicados)
create policy "cursos_coach_select_own" on cursos
  for select using (coach_id = auth.uid());
create policy "cursos_coach_write_own" on cursos
  for insert with check (coach_id = auth.uid() and is_coach());
create policy "cursos_coach_update_own" on cursos
  for update using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "cursos_coach_delete_own" on cursos
  for delete using (coach_id = auth.uid());

-- LECCIONES: el coach gestiona lecciones de sus propios cursos
create policy "lecciones_coach_own" on lecciones for all
  using (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()))
  with check (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()));

-- INSCRIPCIONES / PROGRESO / QUIZ_INTENTOS: el coach solo lee (sin insert/update/delete)
create policy "inscripciones_coach_select" on inscripciones for select using (
  exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid())
);

create policy "progreso_coach_select" on progreso for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);

create policy "quiz_intentos_coach_select" on quiz_intentos for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);
