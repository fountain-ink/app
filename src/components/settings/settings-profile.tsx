"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadFile, uploadMetadata } from "@/lib/upload-utils";
import type { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType, profile as profileMetadata } from "@lens-protocol/metadata";
import { type Profile, useSetProfileMetadata } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";

const getImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? `https://fountain.4everland.link/ipfs/${uri.slice(7)}` : uri;
};

export function ProfileSettings({ profile }: { profile: Profile | ProfileFragment | null }) {
  if (!profile) return null;

  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const { execute: setProfileMetadata } = useSetProfileMetadata();

  const [profileTitle, setProfileTitle] = useState(currentMetadata?.displayName || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const [coverPicture, setCoverPicture] = useState(currentMetadata?.coverPicture?.raw?.uri || "");

  const [profilePicture, setProfilePicture] = useState(
    currentMetadata?.picture?.__typename === "ImageSet"
      ? currentMetadata?.picture?.raw?.uri
      : currentMetadata?.picture?.image?.raw?.uri,
  );

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

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && handle) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("handle", handle);

      const uploadedUri = await uploadFile(formData);

      setProfilePicture(uploadedUri);
    }
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && handle) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("handle", handle);

      const uploadedUri = await uploadFile(formData);

      setCoverPicture(uploadedUri);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Profile Picture</Label>
            {profilePicture && (
              <div className="relative w-32 h-32 rounded-full overflow-hidden">
                <img src={getImageUrl(profilePicture)} alt="Profile" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex space-x-2">
              <Input id="profile-picture" type="file" accept="image/*" onChange={handleProfilePictureChange} />
              <Button onClick={() => setProfilePicture("")} variant="outline">
                Delete
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Cover Picture</Label>
            {coverPicture && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden">
                <img src={getImageUrl(coverPicture)} alt="Cover" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex space-x-2">
              <Input id="profile-background" type="file" accept="image/*" onChange={handleCoverChange} />
              <Button onClick={() => setCoverPicture("")} variant="outline">
                Delete
              </Button>
            </div>
          </div>
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
