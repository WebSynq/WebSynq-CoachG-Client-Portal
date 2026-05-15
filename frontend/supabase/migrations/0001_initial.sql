-- CoachG Client Portal — full schema for v2 (admin + content + GHL + documents)
-- Apply via Supabase SQL editor or `supabase db push`.
-- Idempotent: safe to re-run.

create extension if not exists "pgcrypto";

-- ============================================================
-- profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  tier text not null default 'foundation' check (tier in ('foundation', 'growth', 'domination')),
  is_admin boolean not null default false,
  ghl_contact_id text,
  ghl_sub_account_id text,
  last_seen timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);
create index if not exists profiles_ghl_contact_idx on public.profiles (ghl_contact_id);
create index if not exists profiles_tier_idx on public.profiles (tier);
create index if not exists profiles_is_admin_idx on public.profiles (is_admin);

-- ============================================================
-- modules + lessons (dynamic content, replaces static TS files)
-- ============================================================
create table if not exists public.modules (
  id text primary key,
  slug text not null unique,
  title text not null,
  description text not null default '',
  tier text not null default 'foundation' check (tier in ('foundation', 'growth', 'domination')),
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id text primary key,
  module_id text not null references public.modules(id) on delete cascade,
  slug text not null,
  title text not null,
  description text not null default '',
  video_url text not null default '',
  duration_min int not null default 0,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create index if not exists lessons_module_idx on public.lessons (module_id);

-- ============================================================
-- progress
-- ============================================================
create table if not exists public.progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  module_id text not null,
  completed_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create index if not exists progress_user_idx on public.progress (user_id);
create index if not exists progress_module_idx on public.progress (module_id);

-- ============================================================
-- documents (Field Guide resources — links + Cloudinary PDFs)
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  type text not null default 'link' check (type in ('pdf', 'link', 'template', 'video')),
  url text not null,
  tier text not null default 'foundation' check (tier in ('foundation', 'growth', 'domination')),
  sort_order int not null default 0,
  cloudinary_public_id text,
  cloudinary_resource_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists documents_tier_idx on public.documents (tier);

-- ============================================================
-- ghl_custom_fields (mapping name → ghl field id)
-- ============================================================
create table if not exists public.ghl_custom_fields (
  id uuid primary key default gen_random_uuid(),
  field_key text not null unique,
  ghl_field_id text not null,
  field_name text not null,
  field_type text,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ghl_sync_log
-- ============================================================
create table if not exists public.ghl_sync_log (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  status text not null,
  message text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists ghl_sync_log_created_idx on public.ghl_sync_log (created_at desc);

-- ============================================================
-- updated_at trigger
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists modules_set_updated_at on public.modules;
create trigger modules_set_updated_at before update on public.modules
  for each row execute function public.set_updated_at();

drop trigger if exists lessons_set_updated_at on public.lessons;
create trigger lessons_set_updated_at before update on public.lessons
  for each row execute function public.set_updated_at();

drop trigger if exists documents_set_updated_at on public.documents;
create trigger documents_set_updated_at before update on public.documents
  for each row execute function public.set_updated_at();

-- ============================================================
-- RLS
-- ============================================================
alter table public.profiles enable row level security;
alter table public.progress enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.documents enable row level security;
alter table public.ghl_custom_fields enable row level security;
alter table public.ghl_sync_log enable row level security;

-- helper: is_admin()
create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and is_admin = true
  );
$$;

-- profiles: self select/update, admin full read/update
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_update_own_or_admin" on public.profiles;
create policy "profiles_update_own_or_admin" on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

drop policy if exists "profiles_insert_self_or_admin" on public.profiles;
create policy "profiles_insert_self_or_admin" on public.profiles
  for insert with check (auth.uid() = id or public.is_admin());

-- progress: self CRUD, admin full read
drop policy if exists "progress_select_own_or_admin" on public.progress;
create policy "progress_select_own_or_admin" on public.progress
  for select using (auth.uid() = user_id or public.is_admin());

drop policy if exists "progress_insert_own_or_admin" on public.progress;
create policy "progress_insert_own_or_admin" on public.progress
  for insert with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "progress_update_own_or_admin" on public.progress;
create policy "progress_update_own_or_admin" on public.progress
  for update using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists "progress_delete_own_or_admin" on public.progress;
create policy "progress_delete_own_or_admin" on public.progress
  for delete using (auth.uid() = user_id or public.is_admin());

-- modules + lessons + documents: any authenticated user can read; admin can write
drop policy if exists "modules_select_auth" on public.modules;
create policy "modules_select_auth" on public.modules
  for select to authenticated using (true);

drop policy if exists "modules_admin_write" on public.modules;
create policy "modules_admin_write" on public.modules
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lessons_select_auth" on public.lessons;
create policy "lessons_select_auth" on public.lessons
  for select to authenticated using (true);

drop policy if exists "lessons_admin_write" on public.lessons;
create policy "lessons_admin_write" on public.lessons
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "documents_select_auth" on public.documents;
create policy "documents_select_auth" on public.documents
  for select to authenticated using (true);

drop policy if exists "documents_admin_write" on public.documents;
create policy "documents_admin_write" on public.documents
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ghl_* — admin only
drop policy if exists "ghl_cf_admin_all" on public.ghl_custom_fields;
create policy "ghl_cf_admin_all" on public.ghl_custom_fields
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ghl_log_admin_all" on public.ghl_sync_log;
create policy "ghl_log_admin_all" on public.ghl_sync_log
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, tier, is_admin)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'tier', 'foundation'),
    coalesce((new.raw_user_meta_data->>'is_admin')::boolean, false)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
