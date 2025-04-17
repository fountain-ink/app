import { createClient } from "../db/server";
import { UserSettings } from "./user-settings";

export async function getUserSettings(address: string): Promise<UserSettings | null> {
  try {
    const db = await createClient();
    const { data, error } = await db.from("users").select("settings").eq("address", address).single();

    if (error) {
      console.error("Error fetching user metadata:", error);
      return null;
    }

    if (!data?.settings) {
      return null;
    }

    return data.settings as UserSettings;
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    return null;
  }
}
