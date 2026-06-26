-- ============================================================
-- CoachPro - Supabase Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Videos
CREATE TABLE IF NOT EXISTS public.videos (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title_es TEXT NOT NULL,
  title_en TEXT NOT NULL,
  description_es TEXT,
  description_en TEXT,
  url TEXT NOT NULL,
  thumbnail TEXT,
  category TEXT,
  order_index INTEGER DEFAULT 0,
  published BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User video progress
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE NOT NULL,
  progress_pct INTEGER DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  completed BOOLEAN DEFAULT FALSE,
  last_watched_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, video_id)
);

-- Coaches (geographic directory)
CREATE TABLE IF NOT EXISTS public.coaches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  bio_es TEXT,
  bio_en TEXT,
  city TEXT,
  country_code CHAR(2),
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  avatar_url TEXT,
  email TEXT,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions
CREATE TABLE IF NOT EXISTS public.chat_sessions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- PROFILES policies
CREATE POLICY "Admin full access on profiles"
  ON public.profiles FOR ALL
  USING (public.is_admin());

CREATE POLICY "Members read own profile"
  ON public.profiles FOR SELECT
  USING (id = auth.uid());

CREATE POLICY "Members update own profile"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid());

-- VIDEOS policies
CREATE POLICY "Admin full access on videos"
  ON public.videos FOR ALL
  USING (public.is_admin());

CREATE POLICY "Members read published videos"
  ON public.videos FOR SELECT
  USING (published = TRUE);

-- USER_PROGRESS policies
CREATE POLICY "Admin full access on user_progress"
  ON public.user_progress FOR ALL
  USING (public.is_admin());

CREATE POLICY "Members manage own progress"
  ON public.user_progress FOR ALL
  USING (user_id = auth.uid());

-- COACHES policies
CREATE POLICY "Admin full access on coaches"
  ON public.coaches FOR ALL
  USING (public.is_admin());

CREATE POLICY "Members read active coaches"
  ON public.coaches FOR SELECT
  USING (active = TRUE);

-- CHAT_SESSIONS policies
CREATE POLICY "Admin full access on chat_sessions"
  ON public.chat_sessions FOR ALL
  USING (public.is_admin());

CREATE POLICY "Members manage own chat sessions"
  ON public.chat_sessions FOR ALL
  USING (user_id = auth.uid());

-- ============================================================
-- TRIGGER: Auto-create profile on signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'member')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO public.coaches (name, city, country_code, lat, lng) VALUES
  ('Ana García',    'Ciudad de México', 'MX',  19.4326, -99.1332),
  ('Carlos Ruiz',   'Bogotá',           'CO',   4.7110, -74.0721),
  ('María López',   'Santiago',         'CL', -33.4489, -70.6693),
  ('John Smith',    'New York',         'US',  40.7128, -74.0060),
  ('Laura Torres',  'Barcelona',        'ES',  41.3851,   2.1734)
ON CONFLICT DO NOTHING;

INSERT INTO public.videos (title_es, title_en, category, url, thumbnail, order_index) VALUES
  ('Fundamentos del Liderazgo',   'Leadership Fundamentals',   'Liderazgo',    'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v1/400/225', 1),
  ('Comunicación Efectiva',       'Effective Communication',   'Comunicación', 'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v2/400/225', 2),
  ('Gestión del Cambio',          'Change Management',         'Gestión',      'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v3/400/225', 3),
  ('Inteligencia Emocional',      'Emotional Intelligence',    'Desarrollo',   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v4/400/225', 4),
  ('Equipos de Alto Rendimiento', 'High Performance Teams',    'Liderazgo',    'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v5/400/225', 5),
  ('Visión Estratégica',          'Strategic Vision',          'Estrategia',   'https://www.youtube.com/embed/dQw4w9WgXcQ', 'https://picsum.photos/seed/v6/400/225', 6)
ON CONFLICT DO NOTHING;
