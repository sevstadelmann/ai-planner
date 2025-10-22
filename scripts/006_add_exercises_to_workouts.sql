-- Add exercises column to workouts table to store exercise details as JSON
alter table public.workouts
add column if not exists exercises jsonb;

-- Add index for better query performance
create index if not exists idx_workouts_exercises on public.workouts using gin (exercises);
