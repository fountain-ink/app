import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";
import { createServiceClient } from "../supabase/service";
import { UserMetadata } from "./types";

export async function getMetadata(): Promise<UserMetadata | null> {
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
    .select("metadata")
    .eq("profileId", claims.user_metadata.profileId)
    .single();

  if (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }

  return data?.metadata as UserMetadata || null;
}

export async function getUserMetadata(address: string): Promise<UserMetadata | null> {
  try {
    const db = await createServiceClient();
    const { data, error } = await db
      .from("users")
      .select("metadata")
      .eq("profileId", address)
      .single();

    if (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }

    if (!data?.metadata) {
      return null;
    }

    return data.metadata as UserMetadata;
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
} 