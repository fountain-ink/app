import { getDatabase } from "@/lib/getDatabase";
import { getLensClient } from "@/lib/getLensClient";
import { getCookieAuth } from "./getCookieAuth";

export async function getAuthorizedClients() {

  const {isValid, refreshToken }= getCookieAuth()

	if (!refreshToken || !isValid) {
		throw new Error("Unauthorized");
	}

	const lens = await getLensClient(refreshToken);
	const isAuthenticated = await lens.authentication.isAuthenticated();
	const profileId = await lens.authentication.getProfileId();

	if (!isAuthenticated || !profileId) {
		throw new Error("Unauthenticated");
	}

	const db = getDatabase();

	return { lens, profileId, db };
}
