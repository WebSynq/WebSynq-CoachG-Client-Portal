import { NextResponse } from "next/server";

// TODO: when Supabase is connected:
//  1. Read the current user from a Supabase server client (cookie-based)
//  2. Upsert into public.progress (user_id, lesson_id, module_id)
//  3. Fetch the profile row for ghl_contact_id + ghl_sub_account_id
//  4. PATCH GHL contact custom fields:
//       portal_last_lesson_completed = lessonId
//       portal_lessons_completed_count = count(progress where user_id = uid)
//  5. Use GHL_API_KEY from process.env — never NEXT_PUBLIC_.
//
// In stub mode this route exists only so the client fetch in
// MarkCompleteButton has a real endpoint to call. It accepts the payload
// and returns ok. Progress is tracked client-side in localStorage.

type Body = {
  lessonId?: unknown;
  moduleId?: unknown;
};

export async function POST(request: Request) {
  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (typeof body.lessonId !== "string" || typeof body.moduleId !== "string") {
    return NextResponse.json(
      { error: "missing_fields", required: ["lessonId", "moduleId"] },
      { status: 400 }
    );
  }

  // No-op in stub mode.
  return NextResponse.json({ ok: true, stub: true });
}
