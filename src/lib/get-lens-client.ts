import { LensClient, production } from "@lens-protocol/client";
import { appId } from "@lens-protocol/react-web";

export const getLensClient = async (refreshToken: string | null) => {
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
