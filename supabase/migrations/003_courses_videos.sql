create table public.courses (
  id uuid default gen_random_uuid() primary key,
  category_id uuid references public.categories(id) on delete set null,
  title_es text not null,
  title_en text,
  description_es text,
  description_en text,
  thumbnail_url text,
  instructor_id uuid references public.profiles(id) on delete set null,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'expert')),
  price numeric default 0,
  is_free boolean default true,
  is_published boolean default false,
  total_videos integer default 0,
  total_duration integer default 0,
  created_at timestamp with time zone default now()
);

create table public.videos (
  id uuid default gen_random_uuid() primary key,
  course_id uuid references public.courses(id) on delete cascade,
  title_es text not null,
  title_en text,
  description_es text,
  url text,
  thumbnail_url text,
  duration integer default 0,
  order_index integer default 0,
  is_published boolean default false,
  resources jsonb default '[]',
  created_at timestamp with time zone default now()
);

alter table public.courses enable row level security;
alter table public.videos enable row level security;

create policy "Todos ven cursos publicados"
  on courses for select
  using (is_published = true);

create policy "Admin gestiona cursos"
  on courses for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'instructor'))
  );

create policy "Todos ven videos publicados"
  on videos for select
  using (is_published = true);

create policy "Admin gestiona videos"
  on videos for all
  using (
    exists (select 1 from profiles where id = auth.uid() and role in ('admin', 'instructor'))
  );
