import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database";
import { env } from "@/env.server";
import { createClient } from "@supabase/supabase-js";

export async function createServiceClient() {
  const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    global: {
      headers: {
        "x-application-name": "fountain",
      },
    },
  });

  return supabase;
}
