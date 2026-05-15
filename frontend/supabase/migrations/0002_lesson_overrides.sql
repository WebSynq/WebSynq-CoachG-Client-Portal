-- Optional secondary migration: lesson_overrides table (admin can swap
-- video URLs and metadata per lesson without redeploying). Run after 0001.

create table if not exists public.lesson_overrides (
  lesson_id text primary key,
  title text,
  description text,
  video_url text,
  updated_at timestamptz not null default now()
);

alter table public.lesson_overrides enable row level security;

drop policy if exists "lesson_overrides_select_auth" on public.lesson_overrides;
create policy "lesson_overrides_select_auth" on public.lesson_overrides
  for select to authenticated using (true);

drop policy if exists "lesson_overrides_admin_write" on public.lesson_overrides;
create policy "lesson_overrides_admin_write" on public.lesson_overrides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists lesson_overrides_set_updated_at on public.lesson_overrides;
create trigger lesson_overrides_set_updated_at before update on public.lesson_overrides
  for each row execute function public.set_updated_at();
