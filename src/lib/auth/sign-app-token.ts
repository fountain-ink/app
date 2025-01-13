import { env } from "@/env";
import { sign } from "jsonwebtoken";
import { getLensClient } from "../lens/client";
import { getUserProfile } from "./get-user-profile";

const SUPABASE_JWT_SECRET = env.SUPABASE_JWT_SECRET;

export async function signAppToken(refreshToken: string) {
  const lens = await getLensClient();
  const profile = await getUserProfile();
  console.log(profile);

  if (!profile?.profileId || !profile?.handle) {
    throw new Error("Invalid Lens profile");
  }

  const claims = {
    sub: profile.profileId,
    role: "authenticated",
    user_metadata: {
      isAnonymous: false,
      handle: profile.handle,
      profileId: profile.profileId,
    },
  };

  const jwt = sign(claims, SUPABASE_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "30d",
    issuer: "fountain.ink",
  });
  const account = profile.profile.loggedInAs.account;

  return { jwt, profile: account };
}
