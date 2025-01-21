import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";

export async function getEmail(): Promise<string | null> {
  const cookieStore = cookies();
  const token = cookieStore.get("appToken")?.value;

  if (!token) {
    return null;
  }

  const claims = getTokenClaims(token);
  if (!claims?.metadata?.address) {
    return null;
  }

  const db = await createClient();
  const { data, error } = await db
    .from("users")
    .select("email")
    .eq("address", claims.metadata.address)
    .single();

  if (error) {
    console.error("Error fetching user email:", error);
    return null;
  }

  return data?.email || null;
} 