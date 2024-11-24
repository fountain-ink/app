import { getDatabase } from "@/lib/auth/get-database";
import { getLensClient } from "@/lib/auth/get-lens-client";
import { getTokenFromCookie } from "./get-token-from-cookie";

export async function getAuthWithCookies() {
  const { isValid, refreshToken } = getTokenFromCookie();

  const lens = await getLensClient(refreshToken);

  let isAuthenticated = false;
  try {
    isAuthenticated = await lens.authentication.isAuthenticated();
  } catch (error) {
    console.log(error);
  }

  if (!refreshToken || !isValid || !isAuthenticated) {
    return { lens, profileId: undefined, profile: undefined, handle: undefined, db: undefined };
  }

  const profileId = await lens.authentication.getProfileId();
  const profile = profileId ? await lens.profile.fetch({ forProfileId: profileId }) : undefined;
  const handle = profile?.handle?.localName;

  if (!isAuthenticated || !profileId) {
    throw new Error("Unauthenticated");
  }

  const db = getDatabase();

  return { lens, profileId, profile, handle, db };
}

export async function getAuthWithToken(refreshToken: string) {
  const lens = await getLensClient(refreshToken);

  if (!refreshToken) {
    throw new Error("Unauthenticated");
  }

  const isAuthenticated = await lens.authentication.isAuthenticated();
  const profileId = await lens.authentication.getProfileId();
  const profile = profileId ? await lens.profile.fetch({ forProfileId: profileId }) : undefined;
  const handle = profile?.handle?.localName;

  if (!isAuthenticated || !profileId) {
    throw new Error("Unauthenticated");
  }

  const db = getDatabase();

  return { lens, profileId, profile, handle, db };
}
