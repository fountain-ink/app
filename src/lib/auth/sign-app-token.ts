import { sign } from "jsonwebtoken";
import { env } from "@/env";
import { AppToken, TokenClaims } from "./app-token";
import { getUserAccount } from "./get-user-profile";
import { getAppAdmins } from "./is-admin";

const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET;

export async function signAppToken(): Promise<AppToken> {
  const account = await getUserAccount();

  if (!account?.address || !account?.username) {
    throw new Error("Invalid Lens profile");
  }

  const admins = await getAppAdmins();
  const isAdmin = admins.includes(account.address);

  const claims: TokenClaims = {
    sub: account.address,
    role: "authenticated",
    metadata: {
      isAnonymous: false,
      isAdmin,
      username: account.username,
      address: account.address,
    },
  };

  return sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });
}
