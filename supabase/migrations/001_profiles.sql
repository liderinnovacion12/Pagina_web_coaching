create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  role text default 'member' check (role in ('admin', 'instructor', 'member')),
  avatar_url text,
  bio text,
  country text,
  points integer default 0,
  level text default 'beginner' check (level in ('beginner', 'intermediate', 'expert')),
  streak_days integer default 0,
  last_active timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "Usuarios ven su propio perfil"
  on profiles for select
  using (auth.uid() = id);

create policy "Usuarios editan su propio perfil"
  on profiles for update
  using (auth.uid() = id);

create policy "Admin ve todos los perfiles"
  on profiles for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
