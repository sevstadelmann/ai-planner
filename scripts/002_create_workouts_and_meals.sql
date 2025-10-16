-- Create workouts table
create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  workout_type text not null,
  duration_minutes integer,
  calories_burned integer,
  intensity text,
  scheduled_date date not null,
  scheduled_time time,
  completed boolean default false,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.workouts enable row level security;

-- RLS Policies for workouts
create policy "workouts_select_own"
  on public.workouts for select
  using (auth.uid() = user_id);

create policy "workouts_insert_own"
  on public.workouts for insert
  with check (auth.uid() = user_id);

create policy "workouts_update_own"
  on public.workouts for update
  using (auth.uid() = user_id);

create policy "workouts_delete_own"
  on public.workouts for delete
  using (auth.uid() = user_id);

-- Create meals table
create table if not exists public.meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  meal_type text not null,
  calories integer,
  protein_g numeric(6,2),
  carbs_g numeric(6,2),
  fat_g numeric(6,2),
  ingredients jsonb,
  recipe_url text,
  scheduled_date date not null,
  scheduled_time time,
  completed boolean default false,
  completed_at timestamp with time zone,
  notes text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.meals enable row level security;

-- RLS Policies for meals
create policy "meals_select_own"
  on public.meals for select
  using (auth.uid() = user_id);

create policy "meals_insert_own"
  on public.meals for insert
  with check (auth.uid() = user_id);

create policy "meals_update_own"
  on public.meals for update
  using (auth.uid() = user_id);

create policy "meals_delete_own"
  on public.meals for delete
  using (auth.uid() = user_id);
