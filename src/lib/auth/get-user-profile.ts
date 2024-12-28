import { getAuthWithCookies } from "./get-auth-clients";
import { getTokenFromCookie } from "./get-token-from-cookie";

export async function getUserProfile() {
  const { lens } = await getAuthWithCookies();
  const { isValid, refreshToken } = getTokenFromCookie();

  if (!refreshToken || !isValid) {
    return { profileId: undefined, profile: undefined, handle: undefined };
  }

  const profileId = await lens.authentication.getProfileId();
  const profile = profileId ? await lens.profile.fetch({ forProfileId: profileId }) : undefined;
  const handle = profile?.handle?.localName;

  return { profileId, profile, handle };
}