import { LensClient, production } from "@lens-protocol/client";

export const getLensClient = async (refreshToken: string) => {
	const client = new LensClient({ environment: production });
	await client.authentication.authenticateWith({ refreshToken });

	return client;
};
