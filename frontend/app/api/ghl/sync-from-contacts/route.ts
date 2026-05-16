// Bulk onboarding: pull every GHL contact tagged with `coachg-client`,
// create Supabase auth users for any new ones, generate access tokens,
// and PATCH each contact's portal_access_link custom field. Idempotent —
// safe to run repeatedly (existing accounts are updated, not duplicated).

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ghlFetch,
  searchContacts,
  isGhlConfigured,
  type GhlContact,
  type GhlError,
} from "@/lib/ghl/client";
import { rotateToken, buildAccessUrl } from "@/lib/access-tokens";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function tierFromTags(tags: string[] | undefined): "foundation" | "growth" | "domination" {
  const arr = (tags ?? []).map((t) => t.toLowerCase());
  if (arr.some((t) => t.includes("domination"))) return "domination";
  if (arr.some((t) => t.includes("growth"))) return "growth";
  return "foundation";
}

export async function POST() {
  if (!isGhlConfigured()) {
    return NextResponse.json({ error: "ghl_not_configured" }, { status: 500 });
  }
  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });
  }

  let imported = 0;
  let created = 0;
  let updated = 0;
  let pushedToGhl = 0;
  const errors: string[] = [];

  // Find the portal_access_link field id once
  const { data: cfMap } = await admin
    .from("ghl_custom_fields").select("field_key, ghl_field_id");
  const accessLinkFieldId =
    cfMap?.find((c) => c.field_key === "portal_access_link")?.ghl_field_id;

  try {
    const data = await searchContacts({ tags: ["coachg-client"], pageLimit: 100 });
    const contacts = (data.contacts ?? []).filter((c) => !!c.email);

    for (const contact of contacts as GhlContact[]) {
      try {
        const emailLower = contact.email!.toLowerCase();
        const fullName = [contact.firstName, contact.lastName].filter(Boolean).join(" ") || null;
        const tier = tierFromTags(contact.tags);

        // Find or create auth user
        let userId: string | null = null;
        const { data: existing } = await admin
          .from("profiles").select("id").eq("email", emailLower).maybeSingle();

        if (existing) {
          userId = existing.id;
          await admin.from("profiles").update({
            full_name: fullName,
            ghl_contact_id: contact.id,
            ghl_sub_account_id: process.env.GHL_LOCATION_ID ?? null,
            tier,
          }).eq("id", userId);
          updated++;
        } else {
          const { data: createRes, error: createErr } = await admin.auth.admin.createUser({
            email: emailLower,
            email_confirm: true,
            user_metadata: { full_name: fullName },
          });
          if (createErr || !createRes.user) {
            errors.push(`${emailLower}: ${createErr?.message ?? "create_failed"}`);
            continue;
          }
          userId = createRes.user.id;
          // The handle_new_user trigger inserted a profile stub; patch the rest.
          await admin.from("profiles").update({
            full_name: fullName,
            ghl_contact_id: contact.id,
            ghl_sub_account_id: process.env.GHL_LOCATION_ID ?? null,
            tier,
          }).eq("id", userId);
          created++;
        }

        imported++;

        // Rotate / set access token
        if (!userId) continue;
        const token = await rotateToken(userId);
        if (!token) {
          errors.push(`${emailLower}: token_rotation_failed`);
          continue;
        }
        const accessUrl = buildAccessUrl(token);

        // Push to GHL contact's portal_access_link custom field
        if (accessLinkFieldId && contact.id) {
          try {
            await ghlFetch(`/contacts/${contact.id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                customFields: [{ id: accessLinkFieldId, field_value: accessUrl }],
              }),
            });
            pushedToGhl++;
          } catch (e) {
            const err = e as GhlError;
            errors.push(`${emailLower}: GHL push failed - ${err.message}`);
          }
        }
      } catch (e) {
        errors.push(`${contact.email}: ${e instanceof Error ? e.message : "unknown_error"}`);
      }
    }

    await admin.from("ghl_sync_log").insert({
      kind: "contacts_pull",
      status: errors.length === 0 ? "ok" : "error",
      message: `Imported ${imported} (${created} new, ${updated} updated). Pushed access links to ${pushedToGhl} contacts. ${errors.length} error(s).`,
      payload: { imported, created, updated, pushedToGhl, errors: errors.slice(0, 10) },
    });

    return NextResponse.json({
      ok: true,
      imported,
      created,
      updated,
      pushedToGhl,
      missingAccessLinkField: !accessLinkFieldId,
      errors: errors.slice(0, 20),
    });
  } catch (e) {
    const err = e as GhlError;
    await admin.from("ghl_sync_log").insert({
      kind: "contacts_pull", status: "error",
      message: err.message || "GHL fetch failed",
    });
    return NextResponse.json({ error: err.message || "GHL fetch failed" }, { status: 500 });
  }
}
