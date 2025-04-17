import { fetchAdminsFor } from "@lens-protocol/client/actions";
import { TokenClaims } from "./app-token";
import { getLensClient } from "../lens/client";
import { env } from "@/env";

export const ADMINS = [
  "0x1C03475F4ceA795F255282774A762979f9550611",
  "0xaAd118e88CC813b9915243db41909A2ee4559300",
  "0xdB49CA48058680B2DeD6c44E65DEe912b3d7Fa4d",
  "0x0C7Ac913d7D2932cbF0fae66e5CDF53E71bB9Ad5"
];

/**
 * Checks if a user is an admin based on their address
 * @param address The user's address
 * @returns True if the user is an admin, false otherwise
 */
export async function isAdmin(address?: string): Promise<boolean> {
  if (!address) {
    return false;
  }
  const lens = await getLensClient();
  const app = env.NEXT_PUBLIC_APP_ADDRESS;

  const admins = await fetchAdminsFor(lens, {
    address: app,
  })

  if (admins.isErr()) {
    return false;
  }

  const adminAdresses = admins.value.items.map((admin) => admin.account.address);

  return adminAdresses.includes(address);
} 