import { SessionClient } from "@lens-protocol/client";
import { createApp, fetchApp } from "@lens-protocol/client/actions";
import { app, Platform } from "@lens-protocol/metadata";
import { useAccount, useConnect, useSignMessage } from "wagmi";
import { client } from "./client";
import { storageClient } from "./storage-client";

export const LensAuth = () => {
  const { address } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { connect } = useConnect();

  const uploadMetadata = async () => {
    try {
      const metadata = app({
        name: "Fountain",
        tagline: "Collaborative blogging platform",
        description: "A social network for writers",
        developer: "kualta <contact@kualta.dev>",
        url: "https://fountain.ink",
        termsOfService: "https://fountain.ink/terms",
        privacyPolicy: "https://fountain.ink/privacy",
        platforms: [Platform.WEB],
      });

      const { uri } = await storageClient.uploadAsJson(metadata);
      console.log("Metadata uploaded:", uri);
      return uri;
    } catch (error) {
      console.error("Metadata upload error:", error);
      return null;
    }
  };

  const authenticate = async () => {
    try {
      if (!address) {
        return;
      }

      const authenticated = await client.login({
        builder: {
          address,
        },
        signMessage: async (message) => {
          const signature = await signMessageAsync({ message });
          return signature;
        },
      });

      if (authenticated.isErr()) {
        throw authenticated.error;
      }

      // SessionClient: { ... }
      return authenticated.value;
    } catch (error) {
      console.error("Authentication error:", error);
    }
  };

  const createLensApp = async (sessionClient: SessionClient, metadataUri: string) => {
    try {
      const createResult = await createApp(sessionClient, {
        metadataUri,
      });

      if (createResult.isErr()) {
        throw createResult.error;
      }

      const txHash = "hash" in createResult.value && createResult.value.hash;

      const waitResult = await sessionClient.waitForTransaction(txHash);
      if (waitResult.isErr()) {
        throw waitResult.error;
      }

      const fetchResult = await fetchApp(sessionClient, { txHash });
      if (fetchResult.isErr()) {
        throw fetchResult.error;
      }

      return fetchResult.value;
    } catch (error) {
      console.error("App creation error:", error);
      throw error;
    }
  };

  return {
    authenticate,
    uploadMetadata,
    createLensApp,
  };
};
