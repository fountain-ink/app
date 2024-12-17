import { uploadMetadata } from "@/lib/upload-utils";
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
      toast.error("No handle found for profile");
      return false;
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
        console.error("Failed to update profile metadata:", result.error);
        toast.error("Failed to update settings. Please try again.");
        return false;
      }

      toast.success("Settings updated!", {
        description: "It might take a few minutes for the changes to take effect.",
      });

      result.value.waitForCompletion().catch((error) => {
        console.error("Transaction failed:", error);
      });
    } finally {
      setIsSaving(false);
    }

    return true;
  };

  return { saveSettings, isSaving };
}
