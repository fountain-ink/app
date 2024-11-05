import { env } from "@/env.server";
import { createClient } from "@supabase/supabase-js";

export const getDatabase = () => {
  const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY);

  return supabase;
};
