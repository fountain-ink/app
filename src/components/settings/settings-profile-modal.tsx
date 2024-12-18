"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import { uploadFileFormData } from "@/lib/upload-utils";
import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";
import { ImageUploader } from "../images/image-uploader";
import { Button } from "../ui/button";
import { TextareaAutosize } from "../ui/textarea";

interface ProfileSettingsModalProps {
  profile: Profile | ProfileFragment | null | undefined;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileSettingsModal({ profile, trigger, open, onOpenChange }: ProfileSettingsModalProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPicture, setCoverPicture] = useState<File | null>(null);
  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const [profileTitle, setProfileTitle] = useState(currentMetadata?.displayName || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const { saveSettings, isSaving: isSavingProfileSettings } = useSaveProfileSettings();
  const [enableComments, _setEnableComments] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "enableComments")?.value === "true",
  );
  const [autoPublish, setAutoPublish] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "autoPublish")?.value === "true",
  );

  if (!profile) return null;

  const handleSave = useCallback(async () => {
    let picture: any;
    let coverPictureUri: any;

    if (profilePicture) {
      const formData = new FormData();
      formData.append("file", profilePicture);
      formData.append("handle", handle);
      picture = await uploadFileFormData(formData);
    }

    if (coverPicture) {
      const formData = new FormData();
      formData.append("file", coverPicture);
      formData.append("handle", handle);
      coverPictureUri = await uploadFileFormData(formData);
    }

    const attributes = [
      {
        key: "enableComments",
        type: "Boolean",
        value: enableComments ? "true" : "false",
      },
      {
        key: "autoPublish",
        type: "Boolean",
        value: autoPublish ? "true" : "false",
      },
    ];

    await saveSettings({
      profile,
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      picture,
      coverPicture: coverPictureUri,
      attributes,
    });

    if (onOpenChange) {
      onOpenChange(false);
    }
  }, [
    profile,
    profileTitle,
    profileDescription,
    profilePicture,
    coverPicture,
    handle,
    enableComments,
    autoPublish,
    saveSettings,
    onOpenChange,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>Customize your profile preferences.</DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
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
          {/* <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" placeholder={handle} disabled />
          </div> */}
          <div className="space-y-2">
            <Label htmlFor="profile-title">Display name</Label>
            <Input
              id="profile-title"
              value={profileTitle}
              onChange={(e) => setProfileTitle(e.target.value)}
              placeholder="Your profile title"
            />
          </div>
          <div className="flex flex-col gap-2 relative">
            <Label htmlFor="profile-description">Profile Description</Label>
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
        </div>
      </DialogContent>
    </Dialog>
  );
}