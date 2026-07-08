-- 004_rls.sql
-- Row Level Security de Coachpro: activación por tabla y todas las
-- políticas de acceso (estudiante propio, admin total, coach por
-- pertenencia). Requiere que 001_esquema.sql y 002_usuarios.sql ya se
-- hayan aplicado (usa is_admin() e is_coach()).

alter table usuarios enable row level security;
alter table cursos enable row level security;
alter table lecciones enable row level security;
alter table inscripciones enable row level security;
alter table membresia enable row level security;
alter table progreso enable row level security;
alter table quiz_intentos enable row level security;
alter table xp_eventos enable row level security;
alter table insignias enable row level security;
alter table insignias_usuario enable row level security;
alter table usuario_intereses enable row level security;

-- usuarios: cada quien ve/edita su fila; el rol solo puede crearse como
-- 'estudiante' (prevent_rol_self_escalation_trigger bloquea el resto).
create policy "usuarios_select_own" on usuarios for select using (id = auth.uid() or is_admin());
create policy "usuarios_update_own" on usuarios for update using (id = auth.uid() or is_admin());
create policy "usuarios_insert_own" on usuarios for insert with check (id = auth.uid() and rol = 'estudiante');

-- cursos: público ve solo publicados; admin gestiona todo; el coach ve y
-- gestiona únicamente los cursos que le pertenecen (incluso no publicados).
create policy "cursos_select_publicado" on cursos for select using (publicado = true or is_admin());
create policy "cursos_admin_all" on cursos for all using (is_admin()) with check (is_admin());
create policy "cursos_coach_select_own" on cursos for select using (coach_id = auth.uid());
create policy "cursos_coach_write_own" on cursos for insert with check (coach_id = auth.uid() and is_coach());
create policy "cursos_coach_update_own" on cursos for update using (coach_id = auth.uid()) with check (coach_id = auth.uid());
create policy "cursos_coach_delete_own" on cursos for delete using (coach_id = auth.uid());

-- lecciones: visibles si el curso está publicado; admin gestiona todo; el
-- coach gestiona las lecciones de sus propios cursos.
create policy "lecciones_select_publicado" on lecciones for select using (
  is_admin() or exists (select 1 from cursos c where c.id = curso_id and c.publicado = true)
);
create policy "lecciones_admin_all" on lecciones for all using (is_admin()) with check (is_admin());
create policy "lecciones_coach_own" on lecciones for all
  using (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()))
  with check (exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid()));

-- inscripciones: sin flujo de pago aún, no hay insert self-service; el
-- alta solo la hace un admin o, a futuro, un flujo de compra con service
-- role (que ya evita RLS). El coach solo lee las de sus estudiantes.
create policy "inscripciones_select_own" on inscripciones for select using (usuario_id = auth.uid() or is_admin());
create policy "inscripciones_admin_all" on inscripciones for all using (is_admin()) with check (is_admin());
create policy "inscripciones_coach_select" on inscripciones for select using (
  exists (select 1 from cursos c where c.id = curso_id and c.coach_id = auth.uid())
);

-- membresia: cada quien ve la suya; admin gestiona todo.
create policy "membresia_select_own" on membresia for select using (usuario_id = auth.uid() or is_admin());
create policy "membresia_admin_all" on membresia for all using (is_admin()) with check (is_admin());

-- progreso: cada quien lee/escribe el suyo; el coach solo lee el de sus
-- estudiantes.
create policy "progreso_select_own" on progreso for select using (usuario_id = auth.uid() or is_admin());
create policy "progreso_insert_own" on progreso for insert with check (usuario_id = auth.uid());
create policy "progreso_update_own" on progreso for update using (usuario_id = auth.uid() or is_admin());
create policy "progreso_coach_select" on progreso for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);

-- quiz_intentos: cada quien lee/escribe el suyo; el coach solo lee el de
-- sus estudiantes.
create policy "quiz_intentos_select_own" on quiz_intentos for select using (usuario_id = auth.uid() or is_admin());
create policy "quiz_intentos_insert_own" on quiz_intentos for insert with check (usuario_id = auth.uid());
create policy "quiz_intentos_coach_select" on quiz_intentos for select using (
  exists (
    select 1 from lecciones l join cursos c on c.id = l.curso_id
    where l.id = leccion_id and c.coach_id = auth.uid()
  )
);

-- xp_eventos: cada quien lee/escribe el suyo.
create policy "xp_eventos_select_own" on xp_eventos for select using (usuario_id = auth.uid() or is_admin());
create policy "xp_eventos_insert_own" on xp_eventos for insert with check (usuario_id = auth.uid() or is_admin());

-- insignias: catálogo público de lectura; admin gestiona todo.
create policy "insignias_select_all" on insignias for select using (true);
create policy "insignias_admin_all" on insignias for all using (is_admin()) with check (is_admin());

-- insignias_usuario: cada quien lee/escribe las suyas.
create policy "insignias_usuario_select_own" on insignias_usuario for select using (usuario_id = auth.uid() or is_admin());
create policy "insignias_usuario_insert_own" on insignias_usuario for insert with check (usuario_id = auth.uid() or is_admin());

-- usuario_intereses: cada quien lee/escribe/borra los suyos.
create policy "usuario_intereses_select_own" on usuario_intereses for select using (usuario_id = auth.uid() or is_admin());
create policy "usuario_intereses_insert_own" on usuario_intereses for insert with check (usuario_id = auth.uid());
create policy "usuario_intereses_delete_own" on usuario_intereses for delete using (usuario_id = auth.uid());
