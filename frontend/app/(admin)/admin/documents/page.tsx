import { createClient, createAdminClient } from "@/lib/supabase/server";
import DocumentsManager from "@/components/admin/DocumentsManager";
import type { DocumentRow } from "@/lib/database.types";

export const dynamic = "force-dynamic";

export default async function AdminDocumentsPage() {
  const supabase = createClient() || createAdminClient();
  let documents: DocumentRow[] = [];
  if (supabase) {
    const { data } = await supabase
      .from("documents").select("*")
      .order("sort_order", { ascending: true });
    documents = (data ?? []) as DocumentRow[];
  }

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-danger">Control Room · Documents</p>
        <h1 className="mt-2 font-display text-4xl tracking-wide text-white">Field Guide Manager</h1>
        <p className="mt-2 text-sm text-white/60">
          Upload PDFs (Cloudinary), paste external links, and tier-gate every resource.
        </p>
      </header>

      <DocumentsManager initialDocuments={documents} />
    </div>
  );
}
