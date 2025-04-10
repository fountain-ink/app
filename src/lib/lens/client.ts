import { mainnet, PublicClient, staging, testnet } from "@lens-protocol/client";
import { clientCookieStorage, cookieStorage } from "./storage";
import { env } from "@/env";

const isServer = typeof window === "undefined";

const publicClient = PublicClient.create({
  environment: env.NEXT_PUBLIC_ENVIRONMENT === "development" ? testnet : mainnet,
  origin: "https://fountain.ink",
  storage: isServer ? cookieStorage : clientCookieStorage,
  apiKey: env.NEXT_PUBLIC_ENVIRONMENT === "development" ? env.LENS_API_KEY_TESTNET : env.LENS_API_KEY,
});

export const getPublicClient = () => {
  return publicClient;
};

export const getBuilderClient = async (address: string, signMessage: (message: string) => Promise<string>) => {
  if (!address) return null;

  const authenticated = await publicClient.login({
    builder: {
      address: address,
    },
    signMessage,
  });

  if (authenticated.isErr()) {
    throw authenticated.error;
  }

  return authenticated.value;
};

export const getLensClient = async () => {
  const resumed = await publicClient.resumeSession();
  if (resumed.isErr()) {
    return publicClient;
  }

  return resumed.value;
};
