import { getDatabase } from "@/lib/get-database";
import { getLensClient } from "@/lib/get-lens-client";
import { getCookieAuth } from "./get-auth-cookies";

export async function getAuthorizedClients() {
	const { isValid, refreshToken } = getCookieAuth();

	const lens = await getLensClient(refreshToken);

	if (!refreshToken || !isValid) {
		return { lens, profileId: null, profile: null, handle: null, db: null };
	}

	const isAuthenticated = await lens.authentication.isAuthenticated();
	const profileId = await lens.authentication.getProfileId();
	const profile = profileId
		? await lens.profile.fetch({ forProfileId: profileId })
		: null;
	const handle = profile?.handle?.localName;

	if (!isAuthenticated || !profileId) {
		throw new Error("Unauthenticated");
	}

	const db = getDatabase();

	return { lens, profileId, profile, handle, db };
}
