create table public.user_progress (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  video_id uuid references public.videos(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  completed boolean default false,
  watch_time integer default 0,
  updated_at timestamp with time zone default now(),
  unique(user_id, video_id)
);

create table public.certificates (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  certificate_url text,
  issued_at timestamp with time zone default now(),
  unique(user_id, course_id)
);

alter table public.user_progress enable row level security;
alter table public.certificates enable row level security;

create policy "Usuarios ven su propio progreso"
  on user_progress for select
  using (auth.uid() = user_id);

create policy "Usuarios actualizan su propio progreso"
  on user_progress for insert with check (auth.uid() = user_id);

create policy "Usuarios editan su propio progreso"
  on user_progress for update using (auth.uid() = user_id);

create policy "Admin ve todo el progreso"
  on user_progress for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Usuarios ven sus certificados"
  on certificates for select
  using (auth.uid() = user_id);

create policy "Admin gestiona certificados"
  on certificates for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
