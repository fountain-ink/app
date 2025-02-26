import { PublicClient, staging } from "@lens-protocol/client";
import { clientCookieStorage, cookieStorage } from "./storage";

const isServer = typeof window === "undefined";

const publicClient = PublicClient.create({
  environment: staging,
  origin: "https://fountain.ink",
  storage: isServer ? cookieStorage : clientCookieStorage,
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

export const getOnboardingClient = async (address: string, signMessage: (message: string) => Promise<string>) => {
  if (!address) return null;

  const authenticated = await publicClient.login({
    onboardingUser: {
      app: "0x22977162A92F74e0860565B0981Cbe7FDfb34220",
      wallet: address,
    },
    signMessage,
  });

  if (authenticated.isErr()) {
    console.error(authenticated.error);
    return null;
  }

  return authenticated.value;
};

export const getAccountOwnerClient = async (
  ownerAddress: string,
  accountAddress: string,
  signMessage: (message: string) => Promise<string>,
) => {
  if (!ownerAddress || !accountAddress) return null;

  const authenticated = await publicClient.login({
    accountOwner: {
      account: accountAddress,
      app: "0x22977162A92F74e0860565B0981Cbe7FDfb34220",
      owner: ownerAddress,
    },
    signMessage,
  });

  if (authenticated.isErr()) {
    console.error(authenticated.error);
    return null;
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
