import { LensClient, production } from "@lens-protocol/client";

export const getLensClient = async (refreshToken: string | undefined) => {
  const client = new LensClient({
    environment: production,
    params: {
      profile: { metadataSource: "fountain" },
    },
  });

  if (refreshToken) {
    await client.authentication.authenticateWith({ refreshToken });
  }

  return client;
};
