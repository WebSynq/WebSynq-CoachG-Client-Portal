import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { searchContacts, isGhlConfigured, type GhlContact, type GhlError } from "@/lib/ghl/client";

export const dynamic = "force-dynamic";

async function logSync(kind: string, status: "ok" | "error", message: string, payload?: unknown) {
  const admin = createAdminClient();
  if (!admin) return;
  await admin.from("ghl_sync_log").insert({ kind, status, message, payload: payload ?? null });
}

export async function POST() {
  if (!isGhlConfigured()) {
    return NextResponse.json({ error: "ghl_not_configured" }, { status: 500 });
  }
  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  try {
    const data = await searchContacts({ tags: ["coachg-client"], pageLimit: 100 });
    const contacts = data.contacts ?? [];

    const rows = contacts
      .filter((c: GhlContact) => c.email)
      .map((c: GhlContact) => ({
        email: c.email!.toLowerCase(),
        full_name: [c.firstName, c.lastName].filter(Boolean).join(" ") || null,
        ghl_contact_id: c.id,
        ghl_sub_account_id: process.env.GHL_LOCATION_ID || null,
        tier: "foundation",
      }));

    let imported = 0;
    if (rows.length > 0) {
      // Upsert by ghl_contact_id (preferred) — but profiles.id is the FK to auth.users.
      // For users who haven't yet signed in, we just maintain a side table or skip.
      // For users who have signed in, match by email.
      // Strategy: read existing profiles by email, update ghl_contact_id; leave new contacts as a pending invite list.
      const emails = rows.map((r) => r.email);
      const { data: existing } = await admin
        .from("profiles").select("id, email").in("email", emails);
      const existingMap = Object.fromEntries((existing ?? []).map((p) => [p.email.toLowerCase(), p.id]));

      for (const r of rows) {
        const profileId = existingMap[r.email];
        if (profileId) {
          await admin.from("profiles").update({
            full_name: r.full_name ?? undefined,
            ghl_contact_id: r.ghl_contact_id,
            ghl_sub_account_id: r.ghl_sub_account_id,
          }).eq("id", profileId);
          imported++;
        }
      }
    }

    await logSync("contacts_pull", "ok", `Imported ${imported} of ${contacts.length} contacts`, { count: imported });
    return NextResponse.json({ ok: true, imported, fetched: contacts.length });
  } catch (e) {
    const err = e as GhlError;
    await logSync("contacts_pull", "error", err.message || "GHL fetch failed");
    return NextResponse.json({ error: err.message || "GHL fetch failed" }, { status: 500 });
  }
}
