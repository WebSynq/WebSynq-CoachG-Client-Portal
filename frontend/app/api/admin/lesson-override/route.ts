import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = createClient();
  if (!supabase) return { admin: createAdminClient(), allowed: true }; // preview mode
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, allowed: false, status: 401 };
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return { admin: null, allowed: false, status: 403 };
  return { admin: createAdminClient() ?? supabase, allowed: true };
}

interface OverrideBody {
  lessonId?: string;
  title?: string | null;
  description?: string | null;
  videoUrl?: string | null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });
  const supabase = guard.admin;
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = (await req.json().catch(() => ({}))) as OverrideBody;
  if (!body.lessonId) return NextResponse.json({ error: "lessonId_required" }, { status: 400 });

  const row = {
    lesson_id: body.lessonId,
    title: body.title ?? null,
    description: body.description ?? null,
    video_url: body.videoUrl ?? null,
  };

  const { error } = await supabase.from("lesson_overrides").upsert(row, { onConflict: "lesson_id" });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, override: row });
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });
  const supabase = guard.admin;
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const url = new URL(req.url);
  const lessonId = url.searchParams.get("lessonId");
  if (!lessonId) return NextResponse.json({ error: "lessonId_required" }, { status: 400 });

  const { error } = await supabase.from("lesson_overrides").delete().eq("lesson_id", lessonId);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
