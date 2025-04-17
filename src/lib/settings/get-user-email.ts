import { createClient } from "../db/server";

export async function getEmail(address: string): Promise<string | null> {
  const db = await createClient();
  const { data, error } = await db.from("users").select("email").eq("address", address).single();

  if (error) {
    console.error("Error fetching user email:", error);
    return null;
  }

  return data.email ?? null;
}
