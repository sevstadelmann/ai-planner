-- Complete Updated Database Setup Script
-- Run this script to create all tables with the correct schema
-- This supersedes the 000_complete_database_setup.sql script

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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
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
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_type TEXT NOT NULL,
  value TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WORKOUTS TABLE (UPDATED SCHEMA)
-- ============================================
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  workout_type TEXT NOT NULL,
  duration_minutes INTEGER,
  calories_burned INTEGER,
  intensity TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  exercises JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for exercises column
CREATE INDEX IF NOT EXISTS idx_workouts_exercises ON public.workouts USING gin (exercises);

-- ============================================
-- MEALS TABLE (UPDATED SCHEMA)
-- ============================================
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  meal_type TEXT NOT NULL,
  calories INTEGER,
  protein_g NUMERIC(6,2),
  carbs_g NUMERIC(6,2),
  fat_g NUMERIC(6,2),
  ingredients JSONB,
  recipe_url TEXT,
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- HEALTH METRICS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.health_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL,
  value NUMERIC NOT NULL,
  unit TEXT,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- EXTERNAL INTEGRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.external_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.external_integrations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS POLICIES FOR USER GOALS
-- ============================================
DROP POLICY IF EXISTS "user_goals_select_own" ON public.user_goals;
CREATE POLICY "user_goals_select_own" ON public.user_goals 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_goals_insert_own" ON public.user_goals;
CREATE POLICY "user_goals_insert_own" ON public.user_goals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_goals_update_own" ON public.user_goals;
CREATE POLICY "user_goals_update_own" ON public.user_goals 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_goals_delete_own" ON public.user_goals;
CREATE POLICY "user_goals_delete_own" ON public.user_goals 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR DIETARY PREFERENCES
-- ============================================
DROP POLICY IF EXISTS "dietary_preferences_select_own" ON public.dietary_preferences;
CREATE POLICY "dietary_preferences_select_own" ON public.dietary_preferences 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dietary_preferences_insert_own" ON public.dietary_preferences;
CREATE POLICY "dietary_preferences_insert_own" ON public.dietary_preferences 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dietary_preferences_update_own" ON public.dietary_preferences;
CREATE POLICY "dietary_preferences_update_own" ON public.dietary_preferences 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dietary_preferences_delete_own" ON public.dietary_preferences;
CREATE POLICY "dietary_preferences_delete_own" ON public.dietary_preferences 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR WORKOUTS
-- ============================================
DROP POLICY IF EXISTS "workouts_select_own" ON public.workouts;
CREATE POLICY "workouts_select_own" ON public.workouts 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workouts_insert_own" ON public.workouts;
CREATE POLICY "workouts_insert_own" ON public.workouts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "workouts_update_own" ON public.workouts;
CREATE POLICY "workouts_update_own" ON public.workouts 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "workouts_delete_own" ON public.workouts;
CREATE POLICY "workouts_delete_own" ON public.workouts 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR MEALS
-- ============================================
DROP POLICY IF EXISTS "meals_select_own" ON public.meals;
CREATE POLICY "meals_select_own" ON public.meals 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_insert_own" ON public.meals;
CREATE POLICY "meals_insert_own" ON public.meals 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_update_own" ON public.meals;
CREATE POLICY "meals_update_own" ON public.meals 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "meals_delete_own" ON public.meals;
CREATE POLICY "meals_delete_own" ON public.meals 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR HEALTH METRICS
-- ============================================
DROP POLICY IF EXISTS "health_metrics_select_own" ON public.health_metrics;
CREATE POLICY "health_metrics_select_own" ON public.health_metrics 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_metrics_insert_own" ON public.health_metrics;
CREATE POLICY "health_metrics_insert_own" ON public.health_metrics 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_metrics_update_own" ON public.health_metrics;
CREATE POLICY "health_metrics_update_own" ON public.health_metrics 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "health_metrics_delete_own" ON public.health_metrics;
CREATE POLICY "health_metrics_delete_own" ON public.health_metrics 
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR EXTERNAL INTEGRATIONS
-- ============================================
DROP POLICY IF EXISTS "external_integrations_select_own" ON public.external_integrations;
CREATE POLICY "external_integrations_select_own" ON public.external_integrations 
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "external_integrations_insert_own" ON public.external_integrations;
CREATE POLICY "external_integrations_insert_own" ON public.external_integrations 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "external_integrations_update_own" ON public.external_integrations;
CREATE POLICY "external_integrations_update_own" ON public.external_integrations 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "external_integrations_delete_own" ON public.external_integrations;
CREATE POLICY "external_integrations_delete_own" ON public.external_integrations 
  FOR DELETE USING (auth.uid() = user_id);

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
