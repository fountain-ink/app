import { createClient } from "@supabase/supabase-js";
import { env } from "@/env";
import { Database } from "./database";

export async function createServiceClient() {
  const supabase = createClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
    global: {
      headers: {
        "x-application-name": "fountain",
      },

      fetch: ((url: any, options = {}) => {
        return fetch(url, { ...options, cache: "no-store" });
      }) as typeof fetch,
    },
  });

  return supabase;
}
