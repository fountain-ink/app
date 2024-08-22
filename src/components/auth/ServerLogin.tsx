"use server";

import { LensClient, production } from "@lens-protocol/client";
import { toast } from "sonner";

const client = new LensClient({
	environment: production,
});

export async function serverLogin(refreshToken: string) {
	"use server";

	// Check lens JWT token
	await client.authentication.authenticateWith({ refreshToken });
	const isAuthenticated = await client.authentication.isAuthenticated();

	if (!isAuthenticated) {
		throw new Error("Invalid identity token");
	}

	const profileId = await client.authentication.getProfileId();

	console.log(`Logged in as ${profileId}`);
}
