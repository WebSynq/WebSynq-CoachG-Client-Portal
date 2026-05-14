# CoachG Client Portal — Claude Code Session Context

## Project
Private training portal for COACHG Revenue OS clients (insurance agents).
79 active paying clients. 3 tiers: Foundation ($297), Growth ($497), Domination ($997).
Built by Tim Arnold / Web Synq Design.

## Repo
GitHub: https://github.com/WebSynq/WebSynq-CoachG-Client-Portal.git
Local: E:\Projects\CoachG-Client-Portal

## Stack
- Next.js 14 App Router + TypeScript
- Supabase Auth + PostgreSQL (RLS on all tables)
- Tailwind CSS
- Vercel deployment (auto-deploy from main)

## Auth Model
- Invite-only magic link (email OTP) via Supabase Auth
- No self-registration, no passwords
- Tier stored in profiles.tier — set at invite time
- Middleware protects /dashboard, /training, /resources

## Database Tables
- profiles: id, email, full_name, tier, ghl_contact_id, ghl_sub_account_id, last_seen
- progress: id, user_id, lesson_id, module_id, completed_at

## Content Model
- Static TypeScript files in /content/
- Loom share URLs injected per lesson
- Tier access: foundation sees foundation; growth sees foundation+growth; domination sees all
- Update content files to add/edit lessons — no CMS

## GHL Sync
- Server-side only via /api/progress/route.ts
- Updates: portal_last_lesson_completed, portal_lessons_completed_count
- GHL_API_KEY is server-only — NEVER NEXT_PUBLIC_

## Security Rules
- GHL_API_KEY and SUPABASE_SERVICE_ROLE_KEY are never NEXT_PUBLIC_
- No API calls from client components — use server components or API routes
- Supabase RLS enabled on all tables
- LoomEmbed.tsx is the only way Loom iframes should render
- ASK before running git commands

## Current Session Status
Last completed step: Step 1 (in progress) — repo bootstrapped, Supabase deps installed, awaiting confirmation before git init/push
Next step: Step 2 — Env + Supabase Setup
