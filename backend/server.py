"""
Placeholder FastAPI backend for the CoachG Client Portal.

The portal is a Next.js 14 + Supabase application. All API routes are served
by Next.js Route Handlers under /app/frontend/app/api/*. This backend exists
only to satisfy the Emergent supervisor process. It serves a single health
check endpoint so the platform reports the service as alive.

When you deploy to Vercel, this backend is not used.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="CoachG Backend (placeholder)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "coachg-backend-placeholder"}


@app.get("/api/")
async def root():
    return {
        "message": "CoachG Portal is served by Next.js. This is a placeholder.",
    }
