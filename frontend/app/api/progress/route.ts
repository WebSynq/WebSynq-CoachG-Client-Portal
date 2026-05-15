// Lesson-completion endpoint. Writes progress to Supabase and (if configured)
// PATCHes the linked GHL contact's portal_* custom fields.

import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { isGhlConfigured, updateContactCustomFields, type GhlError } from "@/lib/ghl/client";

export const dynamic = "force-dynamic";

interface Body {
  lessonId?: unknown;
  moduleId?: unknown;
}

export async function POST(request: Request) {
  let body: Body;
  try { body = (await request.json()) as Body; }
  catch { return NextResponse.json({ error: "invalid_json" }, { status: 400 }); }

  if (typeof body.lessonId !== "string" || typeof body.moduleId !== "string") {
    return NextResponse.json({ error: "missing_fields", required: ["lessonId", "moduleId"] }, { status: 400 });
  }
  const lessonId = body.lessonId;
  const moduleId = body.moduleId;

  const supabase = createClient();
  if (!supabase) {
    // Preview / stub mode — accept and no-op.
    return NextResponse.json({ ok: true, stub: true });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { error: insertErr } = await supabase.from("progress").upsert(
    { user_id: user.id, lesson_id: lessonId, module_id: moduleId },
    { onConflict: "user_id,lesson_id" }
  );
  if (insertErr) return NextResponse.json({ error: insertErr.message }, { status: 500 });

  // Update last_seen
  await supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", user.id);

  // Fire-and-forget GHL push (don't block the response).
  if (isGhlConfigured()) {
    void pushToGhl(user.id, lessonId);
  }

  return NextResponse.json({ ok: true });
}

async function pushToGhl(userId: string, lessonId: string) {
  const admin = createAdminClient();
  if (!admin) return;

  try {
    const { data: profile } = await admin
      .from("profiles").select("ghl_contact_id, tier").eq("id", userId).maybeSingle();
    if (!profile?.ghl_contact_id) return;

    // Count completions
    const { count } = await admin
      .from("progress").select("*", { count: "exact", head: true }).eq("user_id", userId);

    // Look up field IDs from mapping table
    const { data: cfMap } = await admin
      .from("ghl_custom_fields").select("field_key, ghl_field_id");
    const idByKey: Record<string, string> = {};
    for (const c of cfMap ?? []) idByKey[c.field_key] = c.ghl_field_id;

    const updates: Array<{ id: string; field_value: string | number | null }> = [];
    if (idByKey.portal_last_lesson_completed) {
      updates.push({ id: idByKey.portal_last_lesson_completed, field_value: lessonId });
    }
    if (idByKey.portal_lessons_completed_count) {
      updates.push({ id: idByKey.portal_lessons_completed_count, field_value: count ?? 0 });
    }
    if (idByKey.portal_last_login_at) {
      updates.push({ id: idByKey.portal_last_login_at, field_value: new Date().toISOString() });
    }
    if (idByKey.portal_tier && profile.tier) {
      updates.push({ id: idByKey.portal_tier, field_value: profile.tier });
    }

    if (updates.length === 0) {
      await admin.from("ghl_sync_log").insert({
        kind: "contact_update", status: "error",
        message: "No mapped custom fields. Run Sync Field Map first.",
      });
      return;
    }

    await updateContactCustomFields(profile.ghl_contact_id, updates);
    await admin.from("ghl_sync_log").insert({
      kind: "contact_update", status: "ok",
      message: `Pushed lesson ${lessonId} to ${profile.ghl_contact_id}`,
    });
  } catch (e) {
    const err = e as GhlError;
    await admin.from("ghl_sync_log").insert({
      kind: "contact_update", status: "error", message: err.message || "GHL update failed",
    });
  }
}
