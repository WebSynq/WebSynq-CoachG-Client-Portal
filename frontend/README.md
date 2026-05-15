# COACHG Client Portal — The Coach's Office

Premium training portal for COACHG Revenue OS clients with a **War Room admin console** for monitoring 79+ insurance agents.

## Stack

- **Next.js 14** App Router + TypeScript
- **Supabase** Postgres + Auth (magic-link, invite-only)
- **Tailwind CSS** with custom design system
- **GoHighLevel v2 API** for 2-way contact + progress sync
- **Cloudinary** for video & document hosting
- **Vercel** deploy target

## Quick Start

### 1. Install
```bash
cd frontend
yarn install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in credentials:

```bash
# Supabase (required) — get from https://supabase.com/dashboard/project/<id>/settings/api
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Cloudinary (required for uploads) — get from https://console.cloudinary.com/settings/api-keys
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud
NEXT_PUBLIC_CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# GoHighLevel (required for sync) — create a Private Integration in Sub-account Settings
GHL_PIT_TOKEN=pit-...
GHL_LOCATION_ID=...
GHL_API_VERSION=2021-07-28

# Required by Next.js
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> **Important:** Never prefix `SUPABASE_SERVICE_ROLE_KEY`, `CLOUDINARY_API_SECRET`, or `GHL_PIT_TOKEN` with `NEXT_PUBLIC_`. Those secrets are server-only.

### 3. Database migrations

Run both SQL files in your Supabase SQL editor (in order):

1. `supabase/migrations/0001_initial.sql` — profiles, modules, lessons, progress, documents, GHL tables, RLS, signup trigger
2. `supabase/migrations/0002_lesson_overrides.sql` — admin video swap overrides

### 4. Seed the first admin

In Supabase Authentication → Users, click **Invite User** and enter:
```
timarnold@grueninghealthwealth.com
```

After Tim accepts the invite and signs in once, run `supabase/seed.sql` in the SQL editor to flip his `is_admin` flag.

### 5. Run dev server

```bash
yarn dev
```

Open <http://localhost:3000> — the portal works in **preview mode** without Supabase wired up (mock user, localStorage progress). Plug in credentials to unlock real auth & GHL.

## GoHighLevel Private Integration Scopes

When creating the PIT in GHL Sub-account → Settings → Private Integrations:

- ✅ View Contacts
- ✅ Edit Contacts
- ✅ View Custom Fields
- ✅ Edit Custom Fields
- ✅ View Tags
- ✅ Edit Tags
- ✅ View Locations

### GHL Custom Fields to Create

Create these contact custom fields in GHL (Settings → Custom Fields → Contact):

| Field Name | Field Key | Type |
|---|---|---|
| Portal Last Lesson Completed | `portal_last_lesson_completed` | Single Line |
| Portal Lessons Completed Count | `portal_lessons_completed_count` | Number |
| Portal Last Login At | `portal_last_login_at` | Date/Time |
| Portal Tier | `portal_tier` | Single Line |

After creating, go to **Admin → GHL Sync** in the portal and click **Sync Field Map** to map them automatically.

## Admin Workflows

### Onboard new clients
1. In GHL, tag contact with `coachg-client`
2. Admin → GHL Sync → **Sync Contacts Now**
3. Invite that email via Supabase Auth (or the portal's invite flow, when added)

### Swap a lesson's video
1. Admin → Content → click **Edit** next to any lesson
2. Paste a URL (Loom, YouTube, Vimeo, Cloudinary) OR click **Upload** to push a file to Cloudinary
3. Click **Save Override**
4. Click **Revert** to remove the override and restore static content

### Add a Field Guide document
1. Admin → Documents → **Add Document**
2. Enter title/description, set tier, paste URL or upload PDF
3. **Create**

### Monitor client progress
- Admin → Overview shows churn risk, active 7d, total plays
- Admin → Clients → searchable/filterable table
- Click any client → full lesson timeline + GHL deep link

## Deploy to Vercel

1. Push to GitHub
2. Connect repo on Vercel
3. Add all env vars from `.env.local` to Vercel project settings (Production + Preview)
4. Deploy

Vercel + Next.js + Supabase is the canonical combo — no special config needed.

## Architecture Notes

- **Magic-link auth** via Supabase email OTP. Invite-only — `shouldCreateUser: false`.
- **Middleware** (`middleware.ts`) refreshes the session, enforces `/admin/*` admin-only, redirects unauth users to `/login`.
- **RLS** policies on every table. Admins can read all profiles + progress. Users see only their own.
- **GHL sync** is server-only — `GHL_PIT_TOKEN` never reaches the browser. Push happens on lesson completion (fire-and-forget) and via manual buttons.
- **Cloudinary signed uploads** — files go browser → Cloudinary directly, bypassing Vercel's 4.5MB function limit.

## File Tree

```
frontend/
├── app/
│   ├── (client)/         # Sidebar layout — dashboard, training, resources
│   ├── (admin)/admin/    # War Room layout — overview, clients, content, documents, ghl
│   ├── api/              # Route handlers
│   ├── auth/callback/    # Supabase magic-link callback
│   ├── login/            # Magic-link sign-in
│   └── page.tsx          # Public landing
├── components/
│   ├── admin/            # Admin-only widgets
│   └── ...               # Shared widgets
├── content/              # Static module/lesson catalog (overridable from admin)
├── lib/
│   ├── ghl/client.ts     # GHL v2 API client
│   ├── supabase/         # Server, client, middleware Supabase factories
│   ├── auth.ts           # Profile fetching + tier gating
│   ├── content.ts        # Static content + admin overrides
│   └── cloudinary.ts     # Signed upload helper
└── supabase/migrations/  # SQL schema
```
