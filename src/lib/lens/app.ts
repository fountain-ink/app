"use client";

import { SessionClient } from "@lens-protocol/client";
import { createApp, fetchApp } from "@lens-protocol/client/actions";
import { app, Platform } from "@lens-protocol/metadata";
import { storageClient } from "./storage-client";

export const useUploadMetadata = () => {
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

  return uploadMetadata;
};

export const useCreateLensApp = () => {
  const createLensApp = async (sessionClient: SessionClient, metadataUri: string) => {
    try {
      const createResult = await createApp(sessionClient, {
        metadataUri,
        namespace: {
          globalNamespace: true,
        },
        defaultFeed: {
          globalFeed: true,
        },
        graph: {
          globalGraph: true,
        },
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

  return createLensApp;
};
