import { LensClient, production } from "@lens-protocol/client";

export const getLensClient = async (refreshToken: string | null) => {
	const client = new LensClient({ environment: production });

	if (refreshToken) {
		await client.authentication.authenticateWith({ refreshToken });
	}

	return client;
};
