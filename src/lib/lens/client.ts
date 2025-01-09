import { PublicClient, testnet } from "@lens-protocol/client";
import { cookieStorage } from "./storage";

export const client = PublicClient.create({
  environment: testnet,
  origin: "https://fountain.ink",
  storage: cookieStorage,
});

client.isPublicClient();
