import { env } from "@/env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "./database";

export async function createClient() {
  const cookieStore = cookies();
  const appToken = cookieStore.get("appToken");
  console.log(appToken);

  const supabase = createServerClient<Database>(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing
          // user sessions.
        }
      },
    },
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
    },
    global: {
      headers: {
        "x-application-name": "fountain",
        Authorization: `Bearer ${appToken?.value}`,
      },
    },
  });

  return supabase;
}
