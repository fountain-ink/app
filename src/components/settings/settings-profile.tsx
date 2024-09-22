"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadMetadata } from "@/lib/upload-utils";
import { type ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import { type Profile, useSetProfileMetadata } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import { ImageUploader } from "./ImageUploader";

import { profile as profileMetadata } from "@lens-protocol/metadata";

const getImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? `https://fountain.4everland.link/ipfs/${uri.slice(7)}` : uri;
};

export function ProfileSettings({ profile }: { profile: Profile | ProfileFragment | null }) {
  const [profilePicture, setProfilePicture] = useState(
    profile?.metadata?.picture?.__typename === "ImageSet"
      ? profile.metadata.picture.raw?.uri
      : profile?.metadata?.picture?.image?.raw?.uri,
  );
  const [coverPicture, setCoverPicture] = useState(profile?.metadata?.coverPicture?.raw?.uri || "");

  if (!profile) return null;

  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const { execute: setProfileMetadata } = useSetProfileMetadata();

  const [profileTitle, setProfileTitle] = useState(currentMetadata?.displayName || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const [tempProfilePicture, setTempProfilePicture] = useState<string | null>(null);
  const [isCroppingProfile, setIsCroppingProfile] = useState(false);

  const [tempCoverPicture, setTempCoverPicture] = useState<string | null>(null);
  const [isCroppingCover, setIsCroppingCover] = useState(false);

  const [enableComments, setEnableComments] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "enableComments")?.value === "true",
  );
  const [autoPublish, setAutoPublish] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "autoPublish")?.value === "true",
  );
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = useCallback(async () => {
    const attributes: Array<
      | { value: string; type: MetadataAttributeType.STRING; key: string }
      | {
          value: "true" | "false";
          type: MetadataAttributeType.BOOLEAN;
          key: string;
        }
    > = [
      {
        key: "enableComments",
        type: MetadataAttributeType.BOOLEAN,
        value: enableComments ? "true" : "false",
      },
      {
        key: "autoPublish",
        type: MetadataAttributeType.BOOLEAN,
        value: autoPublish ? "true" : "false",
      },
    ];
    const metadata = profileMetadata({
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      coverPicture: coverPicture || undefined,
      picture: profilePicture || undefined,
      attributes,
      appId: "fountain",
    });

    setIsSaving(true);
    try {
      const metadataURI = await uploadMetadata(metadata, handle);
      const result = await setProfileMetadata({ metadataURI });

      if (result.isFailure()) {
        console.error("Failed to update profile metadata:", result.error);
        toast.error("Failed to update profile settings. Please try again.");
      } else {
        console.log("Profile metadata updated successfully");
        toast.success("Profile settings updated successfully!");
      }
    } catch (error) {
      console.error("Error updating profile metadata:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [
    handle,
    profileTitle,
    profileDescription,
    coverPicture,
    profilePicture,
    enableComments,
    autoPublish,
    setProfileMetadata,
  ]);
  const handleProfilePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTempProfilePicture(e.target.result as string);
          setIsCroppingProfile(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUploader
          label="Profile Picture"
          initialImage={profilePicture || ""}
          aspectRatio={1}
          handle={profile?.handle?.localName || ""}
          onImageChange={setProfilePicture}
        />
        <ImageUploader
          label="Cover Picture"
          initialImage={coverPicture || ""}
          aspectRatio={3}
          handle={profile?.handle?.localName || ""}
          onImageChange={setCoverPicture}
        />
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder={handle} disabled />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-title">Display name</Label>
          <Input
            id="profile-title"
            value={profileTitle}
            onChange={(e) => setProfileTitle(e.target.value)}
            placeholder="Your profile title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-description">Profile Description</Label>
          <Textarea
            id="profile-description"
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            placeholder="Your profile description"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="comments" checked={enableComments} onCheckedChange={setEnableComments} />
          <Label htmlFor="comments">Enable comments on articles</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="auto-publish" checked={autoPublish} onCheckedChange={setAutoPublish} />
          <Label htmlFor="auto-publish">Auto-publish scheduled articles</Label>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
