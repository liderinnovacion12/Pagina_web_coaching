create table public.categories (
  id uuid default gen_random_uuid() primary key,
  name_es text not null,
  name_en text not null,
  icon text,
  color text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.categories enable row level security;

create policy "Todos ven categorías activas"
  on categories for select
  using (is_active = true);

create policy "Admin gestiona categorías"
  on categories for all
  using (
    exists (
      select 1 from profiles
      where id = auth.uid() and role = 'admin'
    )
  );

insert into public.categories (name_es, name_en, icon, color, order_index) values
  ('Liderazgo', 'Leadership', '👑', '#0EA5E9', 1),
  ('Comunicación', 'Communication', '💬', '#8B5CF6', 2),
  ('Gestión', 'Management', '🔄', '#10B981', 3),
  ('Desarrollo Personal', 'Personal Development', '🧠', '#F97316', 4),
  ('Estrategia', 'Strategy', '🎯', '#C9A84C', 5),
  ('Negociación', 'Negotiation', '🤝', '#06B6D4', 6),
  ('Bienestar', 'Wellbeing', '🧘', '#EC4899', 7),
  ('Juegos', 'Games', '🎮', '#8B5CF6', 8);
