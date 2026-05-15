# PRD — COACHG Client Portal

## Original Problem Statement
> "I would like to add some images from coachghuddle.com to add to this client portal, we need to make the ux/ui more advanced. I would like for you to analyze this code base and lets come up with a better more advanced look for the clients. I need a step by step break down of what to do to make this completely functional and be able to have it connected to ghl. I would like an admin portal so we can monitor everyones progress and troubleshoot and add things easily. We need to be able to change out the video by adding them from the system or a link. Same thing with the documents we want to add to help the client."

## User Choices (verbatim)
- Stack: Stay with existing Next.js + Supabase (built by Claude), deploy to Vercel
- Branding: Use coachghuddle.com colors/branding only
- GHL: 2-way sync — pull contacts, push portal activity to custom fields/tags
- Admin scope: view all clients & progress, upload/replace videos, upload/replace documents
- Storage: URL-only + Cloudinary
- First admin: `timarnold@grueninghealthwealth.com`

## Architecture
- **Frontend**: Next.js 14 App Router + TypeScript + Tailwind
- **Auth/DB**: Supabase (Postgres + magic-link Auth + RLS)
- **Media**: Cloudinary (signed direct browser uploads)
- **CRM**: GoHighLevel v2 API via Private Integration Token
- **Deploy**: Vercel (Next.js native)
- **Layout**: Two route groups — `(client)` sidebar shell, `(admin)` war-room shell

## Personas
1. **Client (Insurance Agent)** — 79 active paid users across 3 tiers (Foundation $297, Growth $497, Domination $997). Watches Loom/YouTube lessons, marks complete, downloads PDFs/templates.
2. **Admin (Tim Arnold / Chase / coaches)** — monitor progress, swap videos when content updates, upload new documents, sync with GHL contacts.

## Core Requirements (static)
- Invite-only magic-link auth
- Tier-gated content
- Static module catalog (Foundation, Growth, Domination) with override capability
- 2-way GHL sync (contacts pull + custom-field push on completion)
- Admin can swap video by URL or Cloudinary upload
- Admin can add documents (links, PDFs via Cloudinary)
- Admin can view all clients with progress + drill-down timeline

## What's Been Implemented (2026-01)

### Phase 1: Foundation
- ✅ Restructured repo: Next.js moved to `/app/frontend`, stub `/app/backend` keeps Emergent supervisor happy
- ✅ Design system upgrade per design_guidelines.json — JetBrains Mono for IDs, semantic admin colors, jersey-number watermarks, glass effects, locker-room imagery from coachghuddle aesthetic
- ✅ New landing page with locker-room hero image + COACHG framework pillars
- ✅ Public client layout (sidebar with tier ladder) + Admin "war room" layout (red live indicator, mono nav)
- ✅ Supabase schema migration (`0001_initial.sql`) — profiles (with `is_admin`), modules, lessons, progress, documents, ghl_custom_fields, ghl_sync_log + RLS + signup trigger
- ✅ Lesson overrides table (`0002_lesson_overrides.sql`)
- ✅ Magic-link login form (`/login`) + auth callback handler
- ✅ Middleware: route protection, admin guards, preview-mode fallback
- ✅ Supabase server/client factories with graceful no-credentials fallback

### Phase 2: Admin Portal
- ✅ `/admin` — Operations Console with integration status, churn risk, recent activity
- ✅ `/admin/clients` — searchable/filterable client table with progress bars
- ✅ `/admin/clients/[id]` — client detail with full lesson timeline + GHL deep link
- ✅ `/admin/content` — module/lesson list with inline editor: swap video URL or upload to Cloudinary, override title/desc per lesson, revert button
- ✅ `/admin/documents` — Field Guide manager: add/edit/delete documents, paste link or upload PDF, tier-gate, type-classify
- ✅ `/admin/ghl` — Sync panel with manual buttons, custom-field mapping table, last 20 log entries

### Phase 3: Integrations (code complete, awaits credentials)
- ✅ GHL v2 typed client (`lib/ghl/client.ts`) — Bearer auth, Location-Id header, contacts search/update, custom-field discovery, tag add/remove
- ✅ Cloudinary signed-upload route (`/api/cloudinary/sign-upload`)
- ✅ Cloudinary Upload Widget React wrapper with brand styling
- ✅ `/api/ghl/sync-from-contacts` — pull tagged contacts, upsert profiles
- ✅ `/api/ghl/sync-custom-fields` — discover GHL custom field IDs, persist mapping
- ✅ `/api/ghl/logs` — sync log viewer endpoint
- ✅ `/api/progress` — Supabase write + fire-and-forget GHL push on lesson completion
- ✅ `/api/admin/lesson-override` (POST/DELETE)
- ✅ `/api/admin/documents` (POST/PUT/DELETE)

### Polish
- ✅ Upgraded VideoEmbed: supports Loom, YouTube, Vimeo, Wistia, Cloudinary, HTML5 mp4/webm
- ✅ Sidebar redesign with active border indicator, tier ladder, sign-out
- ✅ Dashboard bento grid with jersey-number watermarks + Next Play CTA
- ✅ All data-testid attributes per design guidelines
- ✅ TypeScript: 0 errors, ESLint clean

## Next Action Items (P0 — needs user input)
- ⏳ **User to provide credentials**: Supabase project URL + keys, Cloudinary cloud/key/secret, GHL PIT + Location ID
- ⏳ Once credentials in: run migrations 0001 + 0002 in Supabase SQL editor
- ⏳ Invite first admin (timarnold@grueninghealthwealth.com) → run seed.sql
- ⏳ Create the 4 GHL custom fields (`portal_last_lesson_completed`, `portal_lessons_completed_count`, `portal_last_login_at`, `portal_tier`)
- ⏳ Admin → GHL Sync → "Sync Field Map" to map IDs
- ⏳ Admin → GHL Sync → "Sync Contacts Now" to pull tagged contacts
- ⏳ End-to-end test with real data
- ⏳ Push to GitHub → Vercel deploy

## Backlog (P1 — future iterations)
- 📋 Real-time progress updates via Supabase Realtime channels
- 📋 In-portal admin invite UI (server action calling `auth.admin.inviteUserByEmail`)
- 📋 Bulk import/export of clients (CSV)
- 📋 Email digests via Supabase Cron + Resend (weekly progress reports to clients)
- 📋 Mobile push notifications when admin posts a new lesson
- 📋 Comment threads on lessons for community Q&A
- 📋 AI summarization of lesson transcripts (Emergent LLM key)
- 📋 Video transcripts via OpenAI Whisper for accessibility
- 📋 Stripe billing integration for self-service tier upgrades

## P2 — Nice-to-have
- 📋 Module reordering via drag-drop in admin
- 📋 Per-lesson completion confetti animation
- 📋 Leaderboard / top performers (with opt-in)
- 📋 Reduced motion preference toggle

## Test Credentials
See `/app/memory/test_credentials.md` — empty until user provides them.

## Tech Debt
- Static content in `/content/*.ts` could move to DB. Current approach: static is source of truth, DB has overrides. Migrate to fully dynamic when admin requests it.
- `lib/mock-user.ts` is a backwards-compat shim; new code should use `lib/auth.ts` only.
