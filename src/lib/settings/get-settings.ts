import { cookies } from "next/headers";
import { getTokenClaims } from "../auth/get-token-claims";
import { createClient } from "../supabase/server";
import { createServiceClient } from "../supabase/service";
import { UserMetadata } from "./types";

export async function getSettings(): Promise<UserMetadata | null> {
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
    .select("metadata")
    .eq("profileId", claims.metadata.address)
    .single();

  if (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }

  if (!data) {
    return null;
  }

  return data.metadata as UserMetadata;
}

export async function getUserSettings(address: string): Promise<UserMetadata | null> {
  try {
    const db = await createServiceClient();
    const { data, error } = await db
      .from("users")
      .select("metadata")
      .eq("profileId", address)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return null;
    }

    if (!data?.metadata) {
      return null;
    }

    return data.metadata as UserMetadata;
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
}