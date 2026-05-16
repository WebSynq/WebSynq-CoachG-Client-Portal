// GHL webhook: contact gets the coachg-client tag → auto-provision portal
// access. Steps:
//   1. Verify the shared-secret header.
//   2. Read GHL contact (id, email, firstName, lastName, tags, etc.)
//   3. Create or fetch a Supabase auth user for that email.
//   4. Update/create the profile, attach ghl_contact_id, set tier.
//   5. Rotate the portal_access_token.
//   6. PUT the resulting access URL back into GHL custom field
//      `portal_access_link` so you can reference {{contact.portal_access_link}}
//      in your GHL emails / client portal menu.
//
// In GHL, build a Workflow trigger: "Contact Tag Added = coachg-client",
// then "Webhook" action with URL:
//   https://your-site.vercel.app/api/ghl/webhooks/contact-tagged
//   Header: X-CoachG-Webhook-Secret: <GHL_WEBHOOK_SECRET>
//   Body (JSON): { "contactId": "{{contact.id}}", "email": "{{contact.email}}",
//                  "firstName": "{{contact.first_name}}", "lastName": "{{contact.last_name}}",
//                  "tags": "{{contact.tags}}" }

import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import {
  ghlFetch,
  isGhlConfigured,
  getContact,
  type GhlError,
} from "@/lib/ghl/client";
import { rotateToken, buildAccessUrl } from "@/lib/access-tokens";

export const dynamic = "force-dynamic";

interface WebhookPayload {
  contactId?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  tags?: string | string[];
  tier?: string;
}

function tierFromTags(tags: string | string[] | undefined): "foundation" | "growth" | "domination" {
  const arr = Array.isArray(tags)
    ? tags
    : (tags || "").split(",").map((t) => t.trim().toLowerCase());
  if (arr.includes("portal-tier-domination") || arr.includes("coachg-domination")) return "domination";
  if (arr.includes("portal-tier-growth") || arr.includes("coachg-growth")) return "growth";
  return "foundation";
}

export async function POST(req: Request) {
  // 1. Verify shared secret
  const expected = process.env.GHL_WEBHOOK_SECRET;
  const provided = req.headers.get("x-coachg-webhook-secret");
  if (!expected) {
    return NextResponse.json({ error: "webhook_secret_not_configured" }, { status: 500 });
  }
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // 2. Parse payload
  let payload: WebhookPayload;
  try {
    payload = (await req.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { contactId } = payload;
  let { email, firstName, lastName, tags } = payload;
  if (!contactId && !email) {
    return NextResponse.json({ error: "contactId_or_email_required" }, { status: 400 });
  }

  // 3. Hydrate missing fields by calling GHL directly (recommended — GHL
  //    workflow merge fields can be unreliable for tags).
  if (contactId && isGhlConfigured()) {
    try {
      const { contact } = await getContact(contactId);
      email = email || contact.email;
      firstName = firstName || contact.firstName;
      lastName = lastName || contact.lastName;
      tags = tags || contact.tags;
    } catch {
      /* fall through and use payload as-is */
    }
  }

  if (!email) {
    return NextResponse.json({ error: "email_required" }, { status: 400 });
  }
  const emailLower = email.toLowerCase();

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });
  }

  // 4. Create or fetch auth user
  let userId: string;
  const { data: existingProfile } = await admin
    .from("profiles").select("id").eq("email", emailLower).maybeSingle();

  if (existingProfile) {
    userId = existingProfile.id;
  } else {
    // Use admin.createUser. email_confirm: true skips the confirmation step.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: emailLower,
      email_confirm: true,
      user_metadata: {
        full_name: [firstName, lastName].filter(Boolean).join(" ") || null,
      },
    });
    if (createErr || !created.user) {
      await admin.from("ghl_sync_log").insert({
        kind: "contact_update",
        status: "error",
        message: `createUser failed for ${emailLower}: ${createErr?.message}`,
      });
      return NextResponse.json({ error: createErr?.message ?? "create_user_failed" }, { status: 500 });
    }
    userId = created.user.id;
  }

  // 5. Upsert profile fields (handle_new_user trigger inserted a stub; we patch it).
  const tier = (payload.tier as "foundation" | "growth" | "domination") || tierFromTags(tags);
  await admin.from("profiles").update({
    email: emailLower,
    full_name: [firstName, lastName].filter(Boolean).join(" ") || null,
    ghl_contact_id: contactId ?? null,
    ghl_sub_account_id: process.env.GHL_LOCATION_ID ?? null,
    tier,
  }).eq("id", userId);

  // 6. Rotate (or create) portal_access_token
  const token = await rotateToken(userId);
  if (!token) {
    return NextResponse.json({ error: "token_rotation_failed" }, { status: 500 });
  }
  const accessUrl = buildAccessUrl(token);

  // 7. Push the access URL back to GHL contact's portal_access_link custom field
  if (contactId && isGhlConfigured()) {
    try {
      const { data: cfMap } = await admin
        .from("ghl_custom_fields").select("field_key, ghl_field_id");
      const fieldId = cfMap?.find((c) => c.field_key === "portal_access_link")?.ghl_field_id;
      if (fieldId) {
        await ghlFetch(`/contacts/${contactId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            customFields: [{ id: fieldId, field_value: accessUrl }],
          }),
        });
        await admin.from("ghl_sync_log").insert({
          kind: "contact_update",
          status: "ok",
          message: `Wrote portal_access_link to ${contactId}`,
        });
      } else {
        await admin.from("ghl_sync_log").insert({
          kind: "contact_update",
          status: "error",
          message: "portal_access_link field not mapped. Run Sync Field Map first.",
        });
      }
    } catch (e) {
      const err = e as GhlError;
      await admin.from("ghl_sync_log").insert({
        kind: "contact_update",
        status: "error",
        message: `GHL push failed: ${err.message}`,
      });
    }
  }

  return NextResponse.json({
    ok: true,
    userId,
    accessUrl,
    tier,
  });
}
