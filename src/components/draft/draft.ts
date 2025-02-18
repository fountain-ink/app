import type { Database } from "@/lib/supabase/database";

export type Draft = Database["public"]["Tables"]["drafts"]["Row"];
