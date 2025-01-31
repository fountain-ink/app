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
import { enableSignless, fetchMeDetails, removeSignless } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { Globe } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { ImageCropperUploader } from "../images/image-uploader";
import { Button } from "../ui/button";
import { Switch } from "../ui/switch";
import { TextareaAutosize } from "../ui/textarea";

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
  const [isSignless, setIsSignless] = useState(false);
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    const fetchSignlessStatus = async () => {
      const client = await getLensClient();
      if (client.isSessionClient()) {
        const result = await fetchMeDetails(client);
        if (result.isOk()) {
          setIsSignless(result.value.isSignless);
        }
      }
    };
    fetchSignlessStatus();
  }, []);

  const handleSignlessChange = async (checked: boolean) => {
    const client = await getLensClient();
    if (!client.isSessionClient() || !walletClient) {
      toast.error("Please connect your wallet first");
      return;
    }

    try {
      const signlessToast = toast.loading(checked ? "Enabling signless mode..." : "Disabling signless mode...");
      const signlessResult = checked
        ? await enableSignless(client)
            .andThen((tx) => handleOperationWith(walletClient as any)(tx))
            .andThen(client.waitForTransaction)
        : await removeSignless(client)
            .andThen((tx) => handleOperationWith(walletClient as any)(tx))
            .andThen(client.waitForTransaction);

      if (signlessResult.isErr()) {
        toast.dismiss(signlessToast);
        console.error("Failed to update signless mode:", signlessResult.error);
        toast.error("Failed to update signless mode");
        // Reset the toggle to its previous state
        setIsSignless(!checked);
        return;
      }

      toast.dismiss(signlessToast);
      toast.success(checked ? "Signless mode enabled" : "Signless mode disabled");
      setIsSignless(checked);
    } catch (error) {
      console.error("Error updating signless mode:", error);
      toast.error("Failed to update signless mode");
      // Reset the toggle to its previous state
      setIsSignless(!checked);
    }
  };

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
          <ImageCropperUploader
            label="Cover Picture"
            initialImage={currentMetadata?.coverPicture || ""}
            aspectRatio={3}
            onImageChange={setCoverPicture}
          />
          <div className="absolute bottom-0 left-8 z-10">
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
        <div className="w-full md:flex-1 space-y-1">
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
              className="rounded-l-none"
            />
          </div>
        </div>

        <div className="w-full md:flex-1 space-y-1">
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
      </div>

      <div className="flex items-center justify-between mt-2 space-y-2">
        <div className="space-y-0.5">
          <Label htmlFor="signless">Enable signless experience</Label>
          <p className="text-sm text-muted-foreground">
            Adds Fountain as an account manager to enable a signature-free experience
          </p>
        </div>
        <Switch id="signless" checked={isSignless} onCheckedChange={handleSignlessChange} />
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
        <div className="pt-4">
          <Button onClick={handleSave} disabled={isUploading || isSavingProfileSettings} className="">
            {isUploading ? "Uploading..." : isSavingProfileSettings ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
