import { env } from "@/env";
import { sign } from "jsonwebtoken";
import { getLensClient } from "../lens/client";
import { getUserProfile } from "./get-user-profile";
import { AppToken, TokenClaims } from "./app-token";
import { getAppAdmins } from "./is-admin";
const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET;

export async function signAppToken(): Promise<AppToken> {
  const profile = await getUserProfile();

  if (!profile?.address || !profile?.username) {
    throw new Error("Invalid Lens profile");
  }

  const admins = await getAppAdmins();
  const isAdmin = admins.includes(profile.address);

  const claims: TokenClaims = {
    sub: profile.address,
    role: "authenticated",
    metadata: {
      isAnonymous: false,
      isAdmin,
      username: profile.username,
      address: profile.address,
    },
  };

  return sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });
}
