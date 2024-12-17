import { LensClient, production } from "@lens-protocol/client";

export const getLensClient = async (refreshToken: string | undefined) => {
  const client = new LensClient({
    environment: production,
    params: {
      profile: { metadataSource: "fountain" },
    },
  });

  if (!refreshToken) return client;

  try {
    await client.authentication.authenticateWith({ refreshToken });
  } catch (error) {
    console.error(error);
  }

  return client;
};
