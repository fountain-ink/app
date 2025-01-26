import { createServiceClient } from "../supabase/service";
import { UserMetadata } from "./types";

export async function getUserMetadata(address: string): Promise<UserMetadata | null> {
  try {
    const db = await createServiceClient();
    const { data, error } = await db
      .from("users")
      .select("metadata")
      .eq("address", address)
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
