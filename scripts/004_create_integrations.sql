-- Create external_integrations table for storing OAuth tokens and connection info
create table if not exists public.external_integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null,
  access_token text,
  refresh_token text,
  token_expires_at timestamp with time zone,
  connected_at timestamp with time zone default now(),
  last_synced_at timestamp with time zone,
  is_active boolean default true,
  metadata jsonb
);

-- Enable RLS
alter table public.external_integrations enable row level security;

-- RLS Policies for external_integrations
create policy "external_integrations_select_own"
  on public.external_integrations for select
  using (auth.uid() = user_id);

create policy "external_integrations_insert_own"
  on public.external_integrations for insert
  with check (auth.uid() = user_id);

create policy "external_integrations_update_own"
  on public.external_integrations for update
  using (auth.uid() = user_id);

create policy "external_integrations_delete_own"
  on public.external_integrations for delete
  using (auth.uid() = user_id);

-- Create unique constraint to prevent duplicate integrations per user
create unique index if not exists external_integrations_user_provider_idx 
  on public.external_integrations(user_id, provider);
