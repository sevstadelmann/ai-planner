-- Complete Database Setup Script
-- Run this single script in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  display_name TEXT,
  avatar_url TEXT,
  age INTEGER,
  height_cm INTEGER,
  weight_kg NUMERIC,
  activity_level TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER GOALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL,
  target_value NUMERIC,
  current_value NUMERIC DEFAULT 0,
  deadline DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- DIETARY PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.dietary_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKOUTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  scheduled_date TIMESTAMPTZ,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MEALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  meal_type TEXT NOT NULL,
  calories INTEGER,
  protein NUMERIC,
  carbs NUMERIC,
  fats NUMERIC,
  scheduled_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXTERNAL INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.external_integrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dietary_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES FOR USER GOALS
-- ============================================
DROP POLICY IF EXISTS "Users can view own goals" ON public.user_goals;
CREATE POLICY "Users can view own goals" ON public.user_goals 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own goals" ON public.user_goals;
CREATE POLICY "Users can manage own goals" ON public.user_goals 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR DIETARY PREFERENCES
-- ============================================
DROP POLICY IF EXISTS "Users can view own dietary preferences" ON public.dietary_preferences;
CREATE POLICY "Users can view own dietary preferences" ON public.dietary_preferences 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own dietary preferences" ON public.dietary_preferences;
CREATE POLICY "Users can manage own dietary preferences" ON public.dietary_preferences 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR WORKOUTS
-- ============================================
DROP POLICY IF EXISTS "Users can view own workouts" ON public.workouts;
CREATE POLICY "Users can view own workouts" ON public.workouts 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own workouts" ON public.workouts;
CREATE POLICY "Users can manage own workouts" ON public.workouts 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR MEALS
-- ============================================
DROP POLICY IF EXISTS "Users can view own meals" ON public.meals;
CREATE POLICY "Users can view own meals" ON public.meals 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own meals" ON public.meals;
CREATE POLICY "Users can manage own meals" ON public.meals 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR EXTERNAL INTEGRATIONS
-- ============================================
DROP POLICY IF EXISTS "Users can view own integrations" ON public.external_integrations;
CREATE POLICY "Users can view own integrations" ON public.external_integrations 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own integrations" ON public.external_integrations;
CREATE POLICY "Users can manage own integrations" ON public.external_integrations 
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- AUTO-CREATE PROFILE TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
