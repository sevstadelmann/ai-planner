-- Create profiles table for user information
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  height_cm integer,
  weight_kg numeric(5,2),
  age integer,
  gender text,
  activity_level text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- RLS Policies for profiles
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Create user_goals table
create table if not exists public.user_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  goal_type text not null,
  target_value numeric(10,2),
  current_value numeric(10,2),
  unit text,
  deadline date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_goals enable row level security;

-- RLS Policies for user_goals
create policy "user_goals_select_own"
  on public.user_goals for select
  using (auth.uid() = user_id);

create policy "user_goals_insert_own"
  on public.user_goals for insert
  with check (auth.uid() = user_id);

create policy "user_goals_update_own"
  on public.user_goals for update
  using (auth.uid() = user_id);

create policy "user_goals_delete_own"
  on public.user_goals for delete
  using (auth.uid() = user_id);

-- Create dietary_preferences table
create table if not exists public.dietary_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  preference_type text not null,
  value text not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.dietary_preferences enable row level security;

-- RLS Policies for dietary_preferences
create policy "dietary_preferences_select_own"
  on public.dietary_preferences for select
  using (auth.uid() = user_id);

create policy "dietary_preferences_insert_own"
  on public.dietary_preferences for insert
  with check (auth.uid() = user_id);

create policy "dietary_preferences_update_own"
  on public.dietary_preferences for update
  using (auth.uid() = user_id);

create policy "dietary_preferences_delete_own"
  on public.dietary_preferences for delete
  using (auth.uid() = user_id);
