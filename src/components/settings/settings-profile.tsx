"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import { uploadFile } from "@/lib/upload/upload-file";
import { Account } from "@lens-protocol/client";
import { useCallback, useState } from "react";
import { ImageUploader } from "../images/image-uploader";
import { Button } from "../ui/button";
import { TextareaAutosize } from "../ui/textarea";

export function ProfileSettings({ profile }: { profile?: Account | null }) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPicture, setCoverPicture] = useState<File | null>(null);
  const currentMetadata = profile?.metadata;
  const handle = profile?.username?.localName || "";
  const [profileTitle, setProfileTitle] = useState(currentMetadata?.name || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const { saveSettings, isSaving: isSavingProfileSettings } = useSaveProfileSettings();
  console.log(handle, profileTitle, profileDescription, profilePicture, coverPicture);

  if (!profile) return null;

  const handleSave = useCallback(async () => {
    let picture: any;
    let coverPictureUri: any;

    if (profilePicture) {
      picture = await uploadFile(profilePicture);
    }

    if (coverPicture) {
      coverPictureUri = await uploadFile(coverPicture);
    }

    console.log("SAVING")
    await saveSettings({
      profile,
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      picture,
      coverPicture: coverPictureUri,
    });
  }, [
    profile,
    profileTitle,
    profileDescription,
    profilePicture,
    coverPicture,
    handle,
    saveSettings,
  ]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <Label>Avatar and Cover</Label>
          <div className="relative">
            <ImageUploader
              label="Cover Picture"
              initialImage={currentMetadata?.coverPicture || ""}
              aspectRatio={3}
              onImageChange={setCoverPicture}
            />
            <div className="absolute bottom-0 translate-y-1/2 left-8 z-10">
              <ImageUploader
                label="Avatar"
                initialImage={ currentMetadata?.picture }
                aspectRatio={1}
                onImageChange={setProfilePicture}
              />
            </div>
          </div>
          {/* Spacer to account for overlapping avatar */}
          <div className="h-20" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input id="username" placeholder={handle} disabled />
        </div>
        <div className=" space-y-2">
          <Label htmlFor="profile-title">Name</Label>
          <Input
            id="profile-title"
            value={profileTitle}
            onChange={(e) => setProfileTitle(e.target.value)}
            placeholder="Your profile title"
          />
        </div>
        <div className="flex flex-col gap-2 relative">
          <Label htmlFor="profile-description">Bio</Label>
          <TextareaAutosize
            id="profile-description"
            value={profileDescription}
            variant={"default"}
            className="p-2"
            onChange={(e) => setProfileDescription(e.target.value)}
            placeholder="Your profile description"
          />
        </div>

        <Button onClick={handleSave} disabled={isSavingProfileSettings}>
          {isSavingProfileSettings ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
