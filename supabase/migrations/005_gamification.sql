create table public.achievements (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  icon text,
  points_required integer default 0,
  type text check (type in ('streak', 'completion', 'speed', 'social', 'game')),
  created_at timestamp with time zone default now()
);

create table public.user_achievements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  achievement_id uuid references public.achievements(id) on delete cascade,
  earned_at timestamp with time zone default now(),
  unique(user_id, achievement_id)
);

create table public.leaderboard (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  period text check (period in ('weekly', 'monthly', 'alltime')),
  points integer default 0,
  rank integer,
  updated_at timestamp with time zone default now(),
  unique(user_id, period)
);

create table public.games (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  type text check (type in ('quiz', 'flashcard', 'simulation', 'challenge')),
  title text not null,
  description text,
  content jsonb default '{}',
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

create table public.game_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  game_id uuid references public.games(id) on delete cascade,
  score integer default 0,
  time_spent integer default 0,
  answers jsonb default '[]',
  played_at timestamp with time zone default now()
);

alter table public.achievements enable row level security;
alter table public.user_achievements enable row level security;
alter table public.leaderboard enable row level security;
alter table public.games enable row level security;
alter table public.game_results enable row level security;

create policy "Todos ven logros" on achievements for select using (true);
create policy "Todos ven leaderboard" on leaderboard for select using (true);
create policy "Todos ven juegos activos" on games for select using (is_active = true);

create policy "Usuarios ven sus logros"
  on user_achievements for select using (auth.uid() = user_id);

create policy "Usuarios registran sus resultados"
  on game_results for insert with check (auth.uid() = user_id);

create policy "Usuarios ven sus resultados"
  on game_results for select using (auth.uid() = user_id);

create policy "Admin gestiona todo"
  on achievements for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

insert into public.achievements (name, description, icon, points_required, type) values
  ('Primera sesión', 'Completaste tu primera lección', '🎯', 0, 'completion'),
  ('Racha de 7 días', 'Aprendiste 7 días seguidos', '🔥', 0, 'streak'),
  ('Curso completo', 'Terminaste tu primer curso', '🏆', 0, 'completion'),
  ('Maestro del quiz', 'Obtuviste 100% en un juego', '🧠', 0, 'game'),
  ('Conector', 'Agendaste tu primera sesión con un coach', '🤝', 0, 'social');
