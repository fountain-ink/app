"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadFileFormData, uploadMetadata } from "@/lib/upload-utils";
import type { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType } from "@lens-protocol/metadata";
import { type Profile, useSetProfileMetadata } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { Button } from "../ui/button";

import { profile as profileMetadata } from "@lens-protocol/metadata";
import { ImageUploader } from "../images/image-uploader";
import { useTheme } from "../theme/theme-context";
import { useStorage } from "@/hooks/use-storage";
import { themeNames, type ThemeType } from "@/styles/themes";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ProfileSettings({ profile }: { profile: Profile | ProfileFragment | null }) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPicture, setCoverPicture] = useState<File | null>(null);

  if (!profile) return null;

  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const { execute: setProfileMetadata } = useSetProfileMetadata();

  const [profileTitle, setProfileTitle] = useState(currentMetadata?.displayName || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const [enableComments, setEnableComments] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "enableComments")?.value === "true",
  );
  const [autoPublish, setAutoPublish] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "autoPublish")?.value === "true",
  );
  const [isSaving, setIsSaving] = useState(false);

  const { theme, setTheme } = useTheme();
  const { setTheme: setStoredTheme } = useStorage();
  const [selectedTheme, setSelectedTheme] = useState<ThemeType>(theme);

  const handleThemeChange = (newTheme: ThemeType) => {
    setSelectedTheme(newTheme);
    setTheme(newTheme);
    setStoredTheme(newTheme);
  };

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      let profilePictureUri =
        currentMetadata?.picture?.__typename === "ImageSet"
          ? currentMetadata.picture.raw?.uri
          : currentMetadata?.picture?.image?.raw?.uri;
      let coverPictureUri = currentMetadata?.coverPicture?.raw?.uri;

      if (profilePicture) {
        const formData = new FormData();
        formData.append("file", profilePicture);
        formData.append("handle", handle);
        profilePictureUri = await uploadFileFormData(formData);
      }

      if (coverPicture) {
        const formData = new FormData();
        formData.append("file", coverPicture);
        formData.append("handle", handle);
        coverPictureUri = await uploadFileFormData(formData);
      }
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
        {
          key: "theme",
          type: MetadataAttributeType.STRING,
          value: selectedTheme,
        },
      ];

      const metadata = profileMetadata({
        name: profileTitle || undefined,
        bio: profileDescription || undefined,
        coverPicture: coverPictureUri || undefined,
        picture: profilePictureUri || undefined,
        attributes,
        appId: "fountain",
      });

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
    currentMetadata,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <ImageUploader
          label="Profile Picture"
          initialImage={
            currentMetadata?.picture?.__typename === "ImageSet"
              ? currentMetadata.picture.raw?.uri || ""
              : currentMetadata?.picture?.image?.raw?.uri || ""
          }
          aspectRatio={1}
          onImageChange={setProfilePicture}
        />
        <ImageUploader
          label="Cover Picture"
          initialImage={currentMetadata?.coverPicture?.raw?.uri || ""}
          aspectRatio={3}
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

        <div className="space-y-2">
          <Label htmlFor="theme">Select Theme</Label>
          <Select onValueChange={handleThemeChange} value={selectedTheme}>
            <SelectTrigger id="theme">
              <SelectValue placeholder="Select a theme" />
            </SelectTrigger>
            <SelectContent>
              {themeNames.map((themeName) => (
                <SelectItem key={themeName} value={themeName}>
                  {themeName.charAt(0).toUpperCase() + themeName.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
