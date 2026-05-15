import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { listCustomFields, isGhlConfigured, type GhlError } from "@/lib/ghl/client";

export const dynamic = "force-dynamic";

const PORTAL_FIELDS = [
  "portal_last_lesson_completed",
  "portal_lessons_completed_count",
  "portal_last_login_at",
  "portal_tier",
];

export async function POST() {
  if (!isGhlConfigured()) {
    return NextResponse.json({ error: "ghl_not_configured" }, { status: 500 });
  }
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  try {
    const data = await listCustomFields();
    const all = data.customFields ?? [];

    const rows = all.map((f) => {
      const key = f.fieldKey || f.name?.toLowerCase().replace(/\s+/g, "_") || f.id;
      return {
        field_key: key,
        ghl_field_id: f.id,
        field_name: f.name,
        field_type: f.dataType ?? null,
      };
    });

    if (rows.length > 0) {
      await admin.from("ghl_custom_fields").upsert(rows, { onConflict: "field_key" });
    }

    const { data: stored } = await admin.from("ghl_custom_fields").select("*");

    await admin.from("ghl_sync_log").insert({
      kind: "custom_fields_pull",
      status: "ok",
      message: `Mapped ${rows.length} fields. Portal fields expected: ${PORTAL_FIELDS.join(", ")}`,
    });

    return NextResponse.json({ ok: true, mapped: rows.length, fields: stored ?? [] });
  } catch (e) {
    const err = e as GhlError;
    await admin.from("ghl_sync_log").insert({
      kind: "custom_fields_pull",
      status: "error",
      message: err.message || "GHL fetch failed",
    });
    return NextResponse.json({ error: err.message || "GHL fetch failed" }, { status: 500 });
  }
}
