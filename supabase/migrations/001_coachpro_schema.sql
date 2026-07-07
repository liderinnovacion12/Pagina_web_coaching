-- 001_coachpro_schema.sql
-- Esquema completo de Coachpro: usuarios, cursos, lecciones, inscripciones,
-- membresia, progreso, quiz_intentos, xp_eventos, insignias, usuario_intereses.
-- Incluye RLS y la función is_admin() (SECURITY DEFINER) para evitar la
-- recursión infinita ya resuelta antes en el proyecto de coaching anterior.

create extension if not exists "pgcrypto";

create type rol_usuario as enum ('admin', 'estudiante');
create type origen_inscripcion as enum ('compra_individual', 'membresia');
create type estado_membresia as enum ('activa', 'cancelada', 'vencida');

-- ── Tablas ────────────────────────────────────────────────────────────────

create table usuarios (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  rol rol_usuario not null default 'estudiante',
  stripe_customer_id text,
  registrado_en timestamptz not null default now()
);
create index usuarios_email_idx on usuarios(email);

create table cursos (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  precio numeric(10,2) not null default 0,
  publicado boolean not null default false,
  creado_en timestamptz not null default now()
);

create table lecciones (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos(id) on delete cascade,
  tipo_contenido text not null,
  mux_asset_id text,
  storage_key text,
  orden int not null default 0
);
create index lecciones_curso_id_idx on lecciones(curso_id);

create table inscripciones (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  curso_id uuid not null references cursos(id) on delete cascade,
  stripe_payment_id text,
  origen origen_inscripcion not null,
  creado_en timestamptz not null default now(),
  unique (usuario_id, curso_id)
);
create index inscripciones_usuario_curso_idx on inscripciones(usuario_id, curso_id);

create table membresia (
  usuario_id uuid primary key references usuarios(id) on delete cascade,
  stripe_subscription_id text,
  estado estado_membresia not null default 'vencida',
  periodo_fin timestamptz
);

create table progreso (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  segundo_actual int not null default 0,
  completado boolean not null default false,
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, leccion_id)
);
create index progreso_usuario_leccion_idx on progreso(usuario_id, leccion_id);

create table quiz_intentos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  leccion_id uuid not null references lecciones(id) on delete cascade,
  calificacion int not null,
  creado_en timestamptz not null default now()
);

create table xp_eventos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references usuarios(id) on delete cascade,
  origen text not null,
  puntos int not null,
  creado_en timestamptz not null default now()
);
create index xp_eventos_usuario_idx on xp_eventos(usuario_id);

create table insignias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  descripcion text,
  icono text
);

create table insignias_usuario (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  insignia_id uuid not null references insignias(id) on delete cascade,
  obtenida_en timestamptz not null default now(),
  primary key (usuario_id, insignia_id)
);

create table usuario_intereses (
  usuario_id uuid not null references usuarios(id) on delete cascade,
  sector text not null,
  primary key (usuario_id, sector)
);

-- ── Auto-creación de fila en usuarios al registrarse ────────────────────────

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.usuarios (id, email, rol)
  values (new.id, new.email, 'estudiante');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ── is_admin() sin recursión ────────────────────────────────────────────────

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from usuarios
    where id = auth.uid() and rol = 'admin'
  );
$$;

-- ── RLS ──────────────────────────────────────────────────────────────────

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

create policy "usuarios_select_own" on usuarios for select using (id = auth.uid() or is_admin());
create policy "usuarios_update_own" on usuarios for update using (id = auth.uid() or is_admin());
create policy "usuarios_insert_own" on usuarios for insert with check (id = auth.uid());

create policy "cursos_select_publicado" on cursos for select using (publicado = true or is_admin());
create policy "cursos_admin_all" on cursos for all using (is_admin()) with check (is_admin());

create policy "lecciones_select_publicado" on lecciones for select using (
  is_admin() or exists (select 1 from cursos c where c.id = curso_id and c.publicado = true)
);
create policy "lecciones_admin_all" on lecciones for all using (is_admin()) with check (is_admin());

create policy "inscripciones_select_own" on inscripciones for select using (usuario_id = auth.uid() or is_admin());
create policy "inscripciones_insert_own" on inscripciones for insert with check (usuario_id = auth.uid() or is_admin());
create policy "inscripciones_admin_all" on inscripciones for all using (is_admin()) with check (is_admin());

create policy "membresia_select_own" on membresia for select using (usuario_id = auth.uid() or is_admin());
create policy "membresia_admin_all" on membresia for all using (is_admin()) with check (is_admin());

create policy "progreso_select_own" on progreso for select using (usuario_id = auth.uid() or is_admin());
create policy "progreso_insert_own" on progreso for insert with check (usuario_id = auth.uid());
create policy "progreso_update_own" on progreso for update using (usuario_id = auth.uid() or is_admin());

create policy "quiz_intentos_select_own" on quiz_intentos for select using (usuario_id = auth.uid() or is_admin());
create policy "quiz_intentos_insert_own" on quiz_intentos for insert with check (usuario_id = auth.uid());

create policy "xp_eventos_select_own" on xp_eventos for select using (usuario_id = auth.uid() or is_admin());
create policy "xp_eventos_insert_own" on xp_eventos for insert with check (usuario_id = auth.uid() or is_admin());

create policy "insignias_select_all" on insignias for select using (true);
create policy "insignias_admin_all" on insignias for all using (is_admin()) with check (is_admin());

create policy "insignias_usuario_select_own" on insignias_usuario for select using (usuario_id = auth.uid() or is_admin());
create policy "insignias_usuario_insert_own" on insignias_usuario for insert with check (usuario_id = auth.uid() or is_admin());

create policy "usuario_intereses_select_own" on usuario_intereses for select using (usuario_id = auth.uid() or is_admin());
create policy "usuario_intereses_insert_own" on usuario_intereses for insert with check (usuario_id = auth.uid());
create policy "usuario_intereses_delete_own" on usuario_intereses for delete using (usuario_id = auth.uid());
