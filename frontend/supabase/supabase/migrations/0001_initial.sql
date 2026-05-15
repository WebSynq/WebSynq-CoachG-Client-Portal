-- CoachG Client Portal — initial schema
-- Run this once the Supabase project for the portal exists.
-- Apply via: supabase db push  (or Supabase MCP apply_migration)

-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  tier text not null check (tier in ('foundation', 'growth', 'domination')),
  ghl_contact_id text,
  ghl_sub_account_id text,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on public.profiles (email);
create index profiles_ghl_contact_idx on public.profiles (ghl_contact_id);

-- ============================================================
-- progress
-- ============================================================
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  module_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index progress_user_idx on public.progress (user_id);
create index progress_module_idx on public.progress (module_id);

-- ============================================================
-- updated_at trigger for profiles
-- ============================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles enable row level security;
alter table public.progress enable row level security;

-- profiles: a user can read and update their own row.
-- Tier changes happen via service role at invite time, never client-side.
create policy "profiles_select_own"
  on public.profiles
  for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- progress: a user can read and write only their own rows.
create policy "progress_select_own"
  on public.progress
  for select
  using (auth.uid() = user_id);

create policy "progress_insert_own"
  on public.progress
  for insert
  with check (auth.uid() = user_id);

create policy "progress_update_own"
  on public.progress
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "progress_delete_own"
  on public.progress
  for delete
  using (auth.uid() = user_id);
