// Supabase database type stubs. Hand-maintained until we run
// `supabase gen types typescript --project-id "$PROJECT_REF"` against a
// real project. Keep in sync with /supabase/migrations/*.sql.

export type Tier = "foundation" | "growth" | "domination";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  tier: Tier;
  is_admin: boolean;
  ghl_contact_id: string | null;
  ghl_sub_account_id: string | null;
  last_seen: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProgressRow {
  id: string;
  user_id: string;
  lesson_id: string;
  module_id: string;
  completed_at: string;
}

export interface ModuleRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  tier: Tier;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  description: string;
  video_url: string;
  duration_min: number;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export type DocumentType = "pdf" | "link" | "template" | "video";

export interface DocumentRow {
  id: string;
  title: string;
  description: string;
  type: DocumentType;
  url: string;
  tier: Tier;
  sort_order: number;
  cloudinary_public_id: string | null;
  cloudinary_resource_type: string | null;
  created_at: string;
  updated_at: string;
}

export interface GhlCustomFieldRow {
  id: string;
  field_key: string;
  ghl_field_id: string;
  field_name: string;
  field_type: string | null;
  updated_at: string;
}

export interface GhlSyncLogRow {
  id: string;
  kind: "contacts_pull" | "contact_update" | "custom_fields_pull";
  status: "ok" | "error";
  message: string | null;
  payload: unknown;
  created_at: string;
}
