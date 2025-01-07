import { uploadMetadata } from "@/lib/upload-metadata";
import type { ProfileFragment } from "@lens-protocol/client";
import { profile as profileMetadata } from "@lens-protocol/metadata";
import { type Profile, useSetProfileMetadata } from "@lens-protocol/react-web";
import { useState } from "react";
import { toast } from "sonner";

type ProfileSettingsParams = {
  profile: Profile | ProfileFragment;
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
  const { execute: setProfileMetadata } = useSetProfileMetadata();

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
    const handle = profile.handle?.localName;

    if (!handle) {
      toast.error("Error: No handle found for profile");
      return { success: false, error: "No handle found for profile" };
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

      const metadata = profileMetadata({
        name: name ?? currentMetadata?.displayName ?? undefined,
        bio: bio ?? currentMetadata?.bio ?? undefined,
        picture:
          picture ??
          (currentMetadata?.picture?.__typename === "ImageSet"
            ? currentMetadata.picture.raw?.uri
            : currentMetadata?.picture?.image?.raw?.uri) ??
          undefined,
        coverPicture: coverPicture ?? currentMetadata?.coverPicture?.raw?.uri ?? undefined,
        attributes: updatedAttributes,
        appId: "fountain",
      });
      console.log(metadata);

      const metadataURI = await uploadMetadata(metadata, handle);
      const result = await setProfileMetadata({ metadataURI });

      if (result.isFailure()) {
        const error = result.error.message || "Failed to update settings";
        console.error("Failed to update profile metadata:", error);
        toast.error(`Error: ${error}`);
        return { success: false, error };
      }

      toast.success("Settings updated!", {
        description: "Changes may take a few seconds to apply.",
      });

      // Handle transaction completion in background
      result.value.waitForCompletion().catch((error) => {
        console.error("Transaction failed:", error);
        toast.error(`Error: Transaction failed - ${error.message || "Unknown error"}`);
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
