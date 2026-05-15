import { NextResponse, type NextRequest } from "next/server";
import { configureCloudinary, isCloudinaryConfigured } from "@/lib/cloudinary";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isCloudinaryConfigured()) {
    return NextResponse.json({ error: "cloudinary_not_configured" }, { status: 500 });
  }

  // Require an authenticated admin (in production). Skip the check when Supabase
  // is not configured (preview mode).
  const supabase = createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }
  }

  const body = (await req.json().catch(() => ({}))) as { paramsToSign?: Record<string, unknown> };
  const paramsToSign = body.paramsToSign ?? {};
  if (!paramsToSign.timestamp) {
    paramsToSign.timestamp = Math.floor(Date.now() / 1000);
  }

  const cloudinary = configureCloudinary();
  const signature = cloudinary.utils.api_sign_request(
    paramsToSign as Record<string, string | number | boolean>,
    process.env.CLOUDINARY_API_SECRET!
  );

  return NextResponse.json({ signature, timestamp: paramsToSign.timestamp });
}
