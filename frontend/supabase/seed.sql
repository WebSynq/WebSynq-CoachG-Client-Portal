-- Seed: ensure admin profile exists for timarnold@grueninghealthwealth.com
-- This runs *after* the auth user is created (manually or via invite).
-- If the auth.users row exists, we mirror it into profiles with is_admin=true.

insert into public.profiles (id, email, full_name, tier, is_admin)
select u.id,
       u.email,
       coalesce(u.raw_user_meta_data->>'full_name', 'Tim Arnold'),
       'domination',
       true
from auth.users u
where u.email = 'timarnold@grueninghealthwealth.com'
on conflict (id) do update set is_admin = true, tier = 'domination';
