import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";

export async function getSettings() {
  const cookieStore = cookies();
  const token = cookieStore.get("appToken")?.value;

  if (!token) {
    return {};
  }

  const claims = getTokenClaims(token);
  if (!claims?.user_metadata?.profileId) {
    return {};
  }

  const db = await createClient();
  const { data, error } = await db
    .from("users")
    .select("metadata, email")
    .eq("profileId", claims.user_metadata.profileId)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return {};
  }

  return data;
}
