import { LensClient, production } from "@lens-protocol/client";
import { getAuthTokens } from "./get-auth-tokens";


export const getLensClientWithToken = async (refreshToken: string) => {
  const client = getLensClient();

  try {
    await client.authentication.authenticateWith({ refreshToken });
    return client;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to authenticate with token");
  }
};

export const createLensClient = async () => {
  const { refreshToken } = getAuthTokens();
  
  if (!refreshToken ) {
    return getLensClient();
  }

  return getLensClientWithToken(refreshToken);
};

const getLensClient = () => {
  return new LensClient({
    environment: production,
    params: {
      profile: { metadataSource: "fountain" },
    },
  });
};