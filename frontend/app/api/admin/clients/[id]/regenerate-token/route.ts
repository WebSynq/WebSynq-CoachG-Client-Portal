import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { rotateToken, buildAccessUrl } from "@/lib/access-tokens";

export const dynamic = "force-dynamic";

async function requireAdmin() {
  const supabase = createClient();
  if (!supabase) return { admin: createAdminClient(), allowed: true };
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { admin: null, allowed: false, status: 401 };
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
  if (!profile?.is_admin) return { admin: null, allowed: false, status: 403 };
  return { admin: createAdminClient() ?? supabase, allowed: true };
}

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });

  const token = await rotateToken(params.id);
  if (!token) return NextResponse.json({ error: "rotation_failed" }, { status: 500 });

  return NextResponse.json({ ok: true, token, accessUrl: buildAccessUrl(token) });
}
