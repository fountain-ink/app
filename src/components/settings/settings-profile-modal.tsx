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
import { uploadFile } from "@/lib/upload/upload-file";
import { Account } from "@lens-protocol/client";
import { useCallback, useState } from "react";
import { ImageUploader } from "../images/image-uploader";
import { Button } from "../ui/button";
import { TextareaAutosize } from "../ui/textarea";

interface ProfileSettingsModalProps {
  profile: Account | null | undefined;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileSettingsModal({ profile, trigger, open, onOpenChange }: ProfileSettingsModalProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPicture, setCoverPicture] = useState<File | null>(null);
  const currentMetadata = profile?.metadata;
  const handle = profile?.username?.localName || "";
  const [profileTitle, setProfileTitle] = useState(currentMetadata?.name || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const { saveSettings, isSaving: isSavingProfileSettings } = useSaveProfileSettings();

  if (!profile) return null;

  const [isUploading, setIsUploading] = useState(false);

  const handleSave = useCallback(async () => {
    let picture: any;
    let coverPictureUri: any;

    if (profilePicture || coverPicture) {
      setIsUploading(true);

      if (profilePicture) {
        picture = await uploadFile(profilePicture);
      }

      if (coverPicture) {
        coverPictureUri = await uploadFile(coverPicture);
      }

      setIsUploading(false);
    }

    await saveSettings({
      profile,
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      picture,
      coverPicture: coverPictureUri,
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
    saveSettings,
    onOpenChange,
    setIsUploading,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription>Customize your profile preferences.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <ImageUploader
              label="Cover Picture"
              initialImage={currentMetadata?.coverPicture}
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
          <div className="h-20" />
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

        <Button onClick={handleSave} disabled={isUploading || isSavingProfileSettings}>
          {isUploading ? "Uploading..." : isSavingProfileSettings ? "Saving..." : "Save Settings"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
