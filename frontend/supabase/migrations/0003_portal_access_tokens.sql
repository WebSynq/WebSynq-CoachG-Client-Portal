-- Portal access tokens — for Option B "click a link from GHL, auto-login" flow.
-- The token is stored on the profile and pushed to the GHL contact's
-- portal_access_link custom field. Visiting /enter?token=xxx auto-logs the
-- client in (no email, no password, no friction).

alter table public.profiles
  add column if not exists portal_access_token text unique;

create index if not exists profiles_portal_access_token_idx
  on public.profiles (portal_access_token);
