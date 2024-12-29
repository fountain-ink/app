import { LensClient, production } from "@lens-protocol/client";
import { getTokenFromCookie } from "./get-token-from-cookie";

export const createLensClient = () => {
  return new LensClient({
    environment: production,
    params: {
      profile: { metadataSource: "fountain" },
    },
  });
};

export const getLensClientWithToken = async (refreshToken: string) => {
  const client = createLensClient();

  try {
    await client.authentication.authenticateWith({ refreshToken });
    return client;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to authenticate with token");
  }
};

export const getLensClientWithCookies = async () => {
  const { isValid, refreshToken } = getTokenFromCookie();
  
  if (!refreshToken || !isValid) {
    return createLensClient();
  }

  return getLensClientWithToken(refreshToken);
};
