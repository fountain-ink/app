"use client";

import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import type { Account } from "@lens-protocol/client";
import { setAccountMetadata } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { account } from "@lens-protocol/metadata";
import { useState } from "react";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";

type ProfileSettingsParams = {
  profile: Account;
  name?: string;
  bio?: string;
  picture?: string;
  coverPicture?: string;
  attributes?: any[];
};

type SaveSettingsResult = {
  success: boolean;
  error: string | null;
};
export function useSaveProfileSettings() {
  const [isSaving, setIsSaving] = useState(false);
  const { data: walletClient } = useWalletClient();

  const saveSettings = async ({
    profile,
    name,
    bio,
    picture,
    coverPicture,
    attributes = [],
  }: ProfileSettingsParams) => {
    setIsSaving(true);
    const currentMetadata = profile.metadata;
    const handle = profile.username?.localName;
    const lens = await getLensClient();
    console.log(currentMetadata, handle);

    if (!lens.isSessionClient()) {
      console.error("Error: No session found for profile");
      return { success: false, error: "No session found for profile" };
    }

    if (!handle) {
      toast.error("Error: No handle found for profile");
      return { success: false, error: "No handle found for profile" };
    }

    if (!walletClient) {
      toast.error("Error: No wallet client found");
      return { success: false, error: "No wallet client found" };
    }

    try {
      const mapAttributeType = (type: string) => {
        const typeMap: Record<string, string> = {
          BOOLEAN: "Boolean",
          DATE: "Date",
          NUMBER: "Number",
          STRING: "String",
          JSON: "JSON",
        };
        return typeMap[type.toUpperCase()] || type;
      };

      // Validate attributes
      for (const attr of attributes) {
        if (attr.type === "String" && (!attr.value || attr.value.trim().length === 0)) {
          const error = `Invalid value for attribute "${attr.key}": String must not be empty`;
          toast.error(`Error: ${error}`);
          return { success: false, error };
        }
      }

      // Convert existing attributes to correct format
      const existingAttributes = (currentMetadata?.attributes || []).map((attr) => ({
        ...attr,
        type: mapAttributeType(attr.type),
      }));

      // Merge attributes
      const updatedAttributes = attributes.reduce(
        (acc, attr) => {
          const index = acc.findIndex((a: any) => a.key === attr.key);
          if (index !== -1) {
            acc[index] = attr;
          } else {
            acc.push(attr);
          }
          return acc;
        },
        [...existingAttributes],
      );

      // console.log("NMAE", name, currentMetadata?.name, bio, currentMetadata?.bio, picture, currentMetadata?.picture, coverPicture, currentMetadata?.coverPicture);
      const metadata = account({
        name: name ?? currentMetadata?.name ?? undefined,
        bio: bio ?? currentMetadata?.bio ?? undefined,
        picture: picture ?? currentMetadata?.picture ?? undefined,
        coverPicture: coverPicture ?? currentMetadata?.coverPicture ?? undefined,
        attributes: undefined,
      });
      console.log(metadata);

      const { uri: metadataUri } = await storageClient.uploadAsJson(metadata);
      console.log(metadataUri);

      const result = await setAccountMetadata(lens, { metadataUri }).andThen(handleOperationWith(walletClient as any));

      if (result.isErr()) {
        const error = result.error.message || "Failed to update settings";
        console.error("Failed to update profile metadata:", error);
        toast.error(`Error: ${error}`);
        return { success: false, error };
      }

      toast.success("Settings updated!", {
        description: "Changes may take a few seconds to apply.",
      });

      return { success: true, error: null };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error saving settings:", errorMessage);
      toast.error(`Error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  };

  return { saveSettings, isSaving };
}
