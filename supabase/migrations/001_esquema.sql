-- 001_esquema.sql
-- Esquema base de Coachpro: extensión, tipos enumerados, tablas e índices.
-- No incluye funciones, triggers ni políticas RLS — ver 002_usuarios.sql,
-- 003_triggers.sql y 004_rls.sql. Aplicar sobre una base de datos vacía
-- en este orden: 001 -> 002 -> 003 -> 004 (ver README.md de esta carpeta).

create extension if not exists "pgcrypto";

-- ── Tipos ────────────────────────────────────────────────────────────────

create type rol_usuario as enum ('admin', 'estudiante', 'coach');
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
  coach_id uuid references usuarios(id),
  categoria text not null default 'clases'
    check (categoria in ('sistema_100', 'clases')),
  creado_en timestamptz not null default now()
);
create index cursos_coach_id_idx on cursos(coach_id);

create table lecciones (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references cursos(id) on delete cascade,
  titulo text not null,
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
