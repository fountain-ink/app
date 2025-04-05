"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { getLensClient } from "@/lib/lens/client";
import { uploadFile } from "@/lib/upload/upload-file";
import { Account } from "@lens-protocol/client";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { ImageCropperUploader } from "../images/image-uploader";
import { Button } from "../ui/button";
import { TextareaAutosize } from "../ui/textarea";
import { useRouter } from "next/navigation";

interface ProfileSettingsFormProps {
  profile: Account;
  onSaved?: () => void;
  onFormDataChange?: (data: any) => void;
}

function ProfileSettingsForm({ profile, onSaved, onFormDataChange }: ProfileSettingsFormProps) {
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [coverPicture, setCoverPicture] = useState<File | null>(null);
  const currentMetadata = profile?.metadata;
  const username = profile?.username?.localName || "";
  const [profileTitle, setProfileTitle] = useState(currentMetadata?.name || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");
  const [location, setLocation] = useState(
    currentMetadata?.attributes?.find((attr: any) => attr.key === "location")?.value || "",
  );
  const [websiteUrl, setWebsiteUrl] = useState(
    currentMetadata?.attributes?.find((attr: any) => attr.key === "website")?.value?.replace(/^https?:\/\//, "") || "",
  );

  useEffect(() => {
    onFormDataChange?.({
      profilePicture,
      coverPicture,
      profileTitle,
      profileDescription,
      location,
      websiteUrl,
    });
  }, [profilePicture, coverPicture, profileTitle, profileDescription, location, websiteUrl, onFormDataChange]);

  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1">
        <Label>Avatar and Cover</Label>
        <div className="relative pb-8">
          <div className="w-full h-44">
            <ImageCropperUploader
              label="Cover Picture"
              initialImage={currentMetadata?.coverPicture || ""}
              aspectRatio={3}
              onImageChange={setCoverPicture}
            />
          </div>
          <div className="absolute w-40 h-40 bottom-0 left-8 z-10">
            <ImageCropperUploader
              label="Avatar"
              initialImage={currentMetadata?.picture}
              aspectRatio={1}
              onImageChange={setProfilePicture}
            />
          </div>
        </div>
      </div>

      <div className="space-y-1">
        <Label htmlFor="profile-title">Name</Label>
        <Input
          id="profile-title"
          value={profileTitle}
          onChange={(e) => setProfileTitle(e.target.value)}
          placeholder="Your profile title"
          className="max-w-[50%]"
        />
      </div>

      <div className="space-y-1">
        <Label htmlFor="profile-description">Bio</Label>
        <TextareaAutosize
          id="profile-description"
          value={profileDescription}
          variant={"default"}
          onChange={(e) => setProfileDescription(e.target.value)}
          placeholder="Your profile description"
          minRows={3}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:flex-1 max-w-sm space-y-1">
          <Label htmlFor="location">Location</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              <Globe className="h-4 w-4" />
            </span>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="metaverse"
              className="rounded-l-none"
            />
          </div>
        </div>
        <div className="w-full md:flex-1 space-y-1 max-w-sm">
          <Label htmlFor="website">Website</Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-input bg-muted text-muted-foreground text-sm">
              https://
            </span>
            <Input
              id="website"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value.replace(/^https?:\/\//, ""))}
              placeholder="example.com"
              className="rounded-l-none "
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProfileSettingsCard({ profile }: { profile?: Account | null }) {
  if (!profile) return null;

  const [isUploading, setIsUploading] = useState(false);
  const { saveSettings, isSaving: isSavingProfileSettings } = useSaveProfileSettings();
  const [formData, setFormData] = useState<any>(null);

  const handleSave = useCallback(async () => {
    if (!formData) return;

    const { profilePicture, coverPicture, profileTitle, profileDescription, location, websiteUrl } = formData;
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

    const attributes = [];
    if (location) {
      attributes.push({
        key: "location",
        value: location ?? "",
        type: "String",
      });
    }
    if (websiteUrl) {
      attributes.push({
        key: "website",
        value: `https://${websiteUrl.replace(/^https?:\/\//, "")}`,
        type: "String",
      });
    }

    console.log(attributes);
    await saveSettings({
      profile,
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      picture,
      coverPicture: coverPictureUri,
      attributes: attributes.length > 0 ? attributes : undefined,
    });
  }, [profile, formData, saveSettings]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Settings</CardTitle>
        <CardDescription>Customize your profile preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <ProfileSettingsForm profile={profile} onFormDataChange={setFormData} />
        <div className="pt-4">
          <Button onClick={handleSave} disabled={isUploading || isSavingProfileSettings} className="">
            {isUploading ? "Uploading..." : isSavingProfileSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProfileSettingsModalProps {
  profile: Account | null | undefined;
  trigger: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ProfileSettingsModal({ profile, trigger, open, onOpenChange }: ProfileSettingsModalProps) {
  if (!profile) return null;

  const [isUploading, setIsUploading] = useState(false);
  const { saveSettings, isSaving: isSavingProfileSettings } = useSaveProfileSettings();
  const [formData, setFormData] = useState<any>(null);
  const router = useRouter();

  const handleSave = useCallback(async () => {
    if (!formData) return;

    const { profilePicture, coverPicture, profileTitle, profileDescription, location, websiteUrl } = formData;
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

    const attributes = [];
    if (location) {
      attributes.push({
        key: "location",
        value: location,
        type: "String",
      });
    }
    if (websiteUrl) {
      attributes.push({
        key: "website",
        value: `https://${websiteUrl.replace(/^https?:\/\//, "")}`,
        type: "String",
      });
    }

    await saveSettings({
      profile,
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
      picture,
      coverPicture: coverPictureUri,
      attributes,
    });

    onOpenChange?.(false);
    router.refresh();
  }, [profile, formData, saveSettings, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader className="">
          <DialogTitle>Edit Profile</DialogTitle>
          <DialogDescription className="flex items-center gap-2">Customize your profile preferences</DialogDescription>
        </DialogHeader>
        <div className="">
          <ProfileSettingsForm profile={profile} onFormDataChange={setFormData} />
        </div>
        <div className="pt-4 flex justify-end gap-2">
          <Button onClick={handleSave} disabled={isUploading || isSavingProfileSettings} className="">
            {isUploading ? "Uploading..." : isSavingProfileSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
