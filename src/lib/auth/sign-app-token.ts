import { env } from "@/env";
import { sign } from "jsonwebtoken";
import { getLensClient } from "../lens/client";
import { getUserProfile } from "./get-user-profile";

const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET;

export async function signAppToken(refreshToken: string) {
  const lens = await getLensClient();
  const profile = await getUserProfile();

  if (!profile?.address || !profile?.username) {
    throw new Error("Invalid Lens profile");
  }

  const claims = {
    sub: profile.address,
    role: "authenticated",
    metadata: {
      isAnonymous: false,
      username: profile.username,
      address: profile.address,
    },
  };

  const jwt = sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });

  const account = profile.profile.loggedInAs.account;

  return { jwt, account };
}
