create table public.notifications (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('achievement', 'reminder', 'new_course', 'session', 'game', 'certificate')),
  title text not null,
  body text,
  read boolean default false,
  created_at timestamp with time zone default now()
);

create table public.email_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  template text check (template in ('welcome', 'reminder', 'certificate', 'achievement', 'session_confirm')),
  status text default 'pending' check (status in ('sent', 'failed', 'pending')),
  metadata jsonb default '{}',
  sent_at timestamp with time zone default now()
);

create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  status text default 'active' check (status in ('active', 'cancelled', 'expired')),
  stripe_customer_id text,
  stripe_subscription_id text,
  started_at timestamp with time zone default now(),
  expires_at timestamp with time zone,
  unique(user_id)
);

alter table public.notifications enable row level security;
alter table public.email_logs enable row level security;
alter table public.subscriptions enable row level security;

create policy "Usuarios ven sus notificaciones"
  on notifications for select using (auth.uid() = user_id);

create policy "Usuarios marcan notificaciones leídas"
  on notifications for update using (auth.uid() = user_id);

create policy "Usuarios ven su suscripción"
  on subscriptions for select using (auth.uid() = user_id);

create policy "Admin gestiona todo"
  on notifications for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));

create policy "Admin gestiona suscripciones"
  on subscriptions for all
  using (exists (select 1 from profiles where id = auth.uid() and role = 'admin'));
