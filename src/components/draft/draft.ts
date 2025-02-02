import type { Database } from "@/lib/supabase/database";

type BaseDraft = Database["public"]["Tables"]["drafts"]["Row"];

// Extended draft type with local-only fields
export interface Draft extends BaseDraft {
  tags?: string[];
}
