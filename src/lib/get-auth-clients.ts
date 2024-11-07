import { getDatabase } from "@/lib/get-database";
import { getLensClient } from "@/lib/get-lens-client";
import { getCookieAuth } from "./get-auth-cookies";

export async function getAuth() {
  const { isValid, refreshToken } = getCookieAuth();

  const lens = await getLensClient(refreshToken);

  if (!refreshToken || !isValid) {
    return { lens, profileId: undefined, profile: undefined, handle: undefined, db: undefined };
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
