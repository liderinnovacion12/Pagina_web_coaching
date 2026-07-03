create table public.coach_sessions (
  id uuid default gen_random_uuid() primary key,
  coach_id uuid references public.profiles(id) on delete set null,
  user_id uuid references public.profiles(id) on delete cascade,
  scheduled_at timestamp with time zone,
  duration integer default 60,
  status text default 'pending' check (status in ('pending', 'active', 'done', 'cancelled')),
  meeting_url text,
  notes text,
  created_at timestamp with time zone default now()
);

create table public.chat_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  messages jsonb default '[]',
  context text,
  updated_at timestamp with time zone default now()
);

create table public.comments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  content text not null,
  likes integer default 0,
  created_at timestamp with time zone default now()
);

alter table public.coach_sessions enable row level security;
alter table public.chat_sessions enable row level security;
alter table public.comments enable row level security;

create policy "Usuarios ven sus sesiones"
  on coach_sessions for select
  using (auth.uid() = user_id or auth.uid() = coach_id);

create policy "Usuarios crean sesiones"
  on coach_sessions for insert with check (auth.uid() = user_id);

create policy "Admin gestiona sesiones"
  on coach_sessions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Usuarios gestionan su chat"
  on chat_sessions for all using (auth.uid() = user_id);

create policy "Todos ven comentarios"
  on comments for select using (true);

create policy "Usuarios crean comentarios"
  on comments for insert with check (auth.uid() = user_id);

create policy "Usuarios editan sus comentarios"
  on comments for update using (auth.uid() = user_id);
