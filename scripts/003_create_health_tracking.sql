-- Create sleep_tracking table
create table if not exists public.sleep_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  duration_hours numeric(4,2) not null,
  quality_rating integer check (quality_rating >= 1 and quality_rating <= 5),
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.sleep_tracking enable row level security;

-- RLS Policies for sleep_tracking
create policy "sleep_tracking_select_own"
  on public.sleep_tracking for select
  using (auth.uid() = user_id);

create policy "sleep_tracking_insert_own"
  on public.sleep_tracking for insert
  with check (auth.uid() = user_id);

create policy "sleep_tracking_update_own"
  on public.sleep_tracking for update
  using (auth.uid() = user_id);

create policy "sleep_tracking_delete_own"
  on public.sleep_tracking for delete
  using (auth.uid() = user_id);

-- Create weight_tracking table
create table if not exists public.weight_tracking (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  weight_kg numeric(5,2) not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.weight_tracking enable row level security;

-- RLS Policies for weight_tracking
create policy "weight_tracking_select_own"
  on public.weight_tracking for select
  using (auth.uid() = user_id);

create policy "weight_tracking_insert_own"
  on public.weight_tracking for insert
  with check (auth.uid() = user_id);

create policy "weight_tracking_update_own"
  on public.weight_tracking for update
  using (auth.uid() = user_id);

create policy "weight_tracking_delete_own"
  on public.weight_tracking for delete
  using (auth.uid() = user_id);

-- Create water_intake table
create table if not exists public.water_intake (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  amount_ml integer not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.water_intake enable row level security;

-- RLS Policies for water_intake
create policy "water_intake_select_own"
  on public.water_intake for select
  using (auth.uid() = user_id);

create policy "water_intake_insert_own"
  on public.water_intake for insert
  with check (auth.uid() = user_id);

create policy "water_intake_update_own"
  on public.water_intake for update
  using (auth.uid() = user_id);

create policy "water_intake_delete_own"
  on public.water_intake for delete
  using (auth.uid() = user_id);

-- Create achievements table
create table if not exists public.achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  icon text,
  achieved_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.achievements enable row level security;

-- RLS Policies for achievements
create policy "achievements_select_own"
  on public.achievements for select
  using (auth.uid() = user_id);

create policy "achievements_insert_own"
  on public.achievements for insert
  with check (auth.uid() = user_id);

create policy "achievements_delete_own"
  on public.achievements for delete
  using (auth.uid() = user_id);
