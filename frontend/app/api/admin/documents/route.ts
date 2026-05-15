import { NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

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

interface DocumentInput {
  id?: string;
  title?: string;
  description?: string;
  type?: string;
  url?: string;
  tier?: string;
  sort_order?: number;
  cloudinary_public_id?: string | null;
  cloudinary_resource_type?: string | null;
}

export async function POST(req: Request) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });
  const supabase = guard.admin;
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = (await req.json()) as DocumentInput;
  const row = {
    title: body.title ?? "",
    description: body.description ?? "",
    type: body.type ?? "link",
    url: body.url ?? "",
    tier: body.tier ?? "foundation",
    sort_order: body.sort_order ?? 0,
    cloudinary_public_id: body.cloudinary_public_id ?? null,
    cloudinary_resource_type: body.cloudinary_resource_type ?? null,
  };
  const { data, error } = await supabase.from("documents").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });
  const supabase = guard.admin;
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const body = (await req.json()) as DocumentInput;
  if (!body.id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  const { id, ...patch } = body;
  // Strip undefined keys
  const clean = Object.fromEntries(Object.entries(patch).filter(([, v]) => v !== undefined));
  const { data, error } = await supabase.from("documents").update(clean).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function DELETE(req: Request) {
  const guard = await requireAdmin();
  if (!guard.allowed) return NextResponse.json({ error: "forbidden" }, { status: guard.status });
  const supabase = guard.admin;
  if (!supabase) return NextResponse.json({ error: "supabase_not_configured" }, { status: 500 });

  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id_required" }, { status: 400 });
  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
