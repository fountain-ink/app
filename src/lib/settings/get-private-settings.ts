import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";

export interface Settings {
  app?: {
    isSmoothScrolling?: boolean;
    isBlurEnabled?: boolean;
  };
}

export async function getSettings(): Promise<Settings | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("appToken")?.value;

  if (!token) {
    return null;
  }

  const claims = getTokenClaims(token);
  if (!claims?.user_metadata?.profileId) {
    return null;
  }

  const db = await createClient();
  const { data, error } = await db
    .from("users")
    .select("settings")
    .eq("profileId", claims.user_metadata.profileId)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  return data?.settings as Settings || null;
} 
