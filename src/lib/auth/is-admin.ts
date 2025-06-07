import { fetchAdminsFor } from "@lens-protocol/client/actions";
import { TokenClaims } from "./app-token";
import { getLensClient } from "../lens/client";
import { env } from "@/env";

/**
 * Checks if a user is an admin based on their address
 * @param address The user's address
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(address?: string): Promise<boolean> {
  if (!address) {
    return false;
  }

  const adminAdresses = await getAppAdmins();

  return adminAdresses.includes(address);
}

export async function getAppAdmins(): Promise<string[]> {
  const lens = await getLensClient();
  const app = env.NEXT_PUBLIC_APP_ADDRESS;

  const admins = await fetchAdminsFor(lens, {
    address: app,
  });

  if (admins.isErr()) {
    return [];
  }

  return admins.value.items.map((admin) => admin.account.address);
}
