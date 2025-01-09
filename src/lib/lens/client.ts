import { PublicClient, testnet } from "@lens-protocol/client";
import { cookieStorage } from "./storage";

export const publicClient = PublicClient.create({
  environment: testnet,
  origin: "https://fountain.ink",
  storage: cookieStorage,
});

export const getLensClient = async () => {
  const resumed = await publicClient.resumeSession();
  if (resumed.isErr()) {
    console.error(resumed.error);
    return publicClient;
  }

  return resumed.value;
};
