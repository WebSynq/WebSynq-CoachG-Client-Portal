# Test Credentials

## Admin User
- **Email**: `timarnold@grueninghealthwealth.com`
- **Auth method**: Magic-link (Supabase email OTP). No password.
- **Setup**: Invite via Supabase Auth dashboard → user signs in once → run `supabase/seed.sql` to set `is_admin = true`.

## External Service Credentials
All credentials needed by the user — NOT yet provided. Once available, populate `frontend/.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=             # https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=        # eyJ... (publishable key)
SUPABASE_SERVICE_ROLE_KEY=            # eyJ... (server-only)

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
NEXT_PUBLIC_CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

GHL_PIT_TOKEN=                        # pit-...
GHL_LOCATION_ID=                      # GHL sub-account ID
GHL_API_VERSION=2021-07-28
```

## Preview Mode
When the above are empty, the app falls back to a mock user `preview@coachg.com` with `is_admin=true`, `tier=domination`. This is for **local preview only** — middleware DOES NOT enforce auth without Supabase credentials.
