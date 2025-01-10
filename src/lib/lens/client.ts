import { PublicClient, testnet } from "@lens-protocol/client";
import { cookieStorage } from "./storage";

const publicClient = PublicClient.create({
  environment: testnet,
  origin: "https://fountain.ink",
  storage: cookieStorage,
});

export const getPublicClient = async () => {
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
      app: "0xF9F360bb2bFA920a19cB5DedFd4d2d9e7ecc5904", 
      wallet: address
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
    console.error(resumed.error);
    return publicClient;
  }

  return resumed.value;
};
