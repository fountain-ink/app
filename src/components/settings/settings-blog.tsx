"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadMetadata } from "@/lib/upload-utils";
import type { ProfileFragment } from "@lens-protocol/client";
import { MetadataAttributeType, profile as profileMetadata } from "@lens-protocol/metadata";
import { type Profile, useSetProfileMetadata } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";

import { toast } from "sonner";
import { Button } from "../ui/button";

export function ProfileSettings({ profile }: { profile: Profile | ProfileFragment | null }) {
  if (!profile) return null;

  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const { execute: setProfileMetadata } = useSetProfileMetadata();

  const [profileTitle, setProfileTitle] = useState(currentMetadata?.displayName || "");
  const [profileDescription, setProfileDescription] = useState(currentMetadata?.bio || "");

  const [defaultCategory, setDefaultCategory] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "defaultCategory")?.value || "",
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

    if (defaultCategory) {
      attributes.push({
        key: "defaultCategory",
        type: MetadataAttributeType.STRING,
        value: defaultCategory,
      });
    }
    const metadata = profileMetadata({
      name: profileTitle || undefined,
      bio: profileDescription || undefined,
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
        toast.success("Profile settings updated successfully!", {
          description: "It might take a few seconds for the changes to take effect.",
        });
      }
    } catch (error) {
      console.error("Error updating profile metadata:", error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }, [handle, profileTitle, profileDescription, enableComments, autoPublish, setProfileMetadata]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Settings</CardTitle>
        <CardDescription>Customize your blog preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="profile-title">Blog Title</Label>
          <Input
            id="profile-title"
            value={profileTitle}
            onChange={(e) => setProfileTitle(e.target.value)}
            placeholder="Your profile title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="profile-description">Blog Description</Label>
          <Textarea
            id="profile-description"
            value={profileDescription}
            onChange={(e) => setProfileDescription(e.target.value)}
            placeholder="Your profile description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="default-category">Default Category</Label>
          <Select value={defaultCategory} onValueChange={setDefaultCategory}>
            <SelectTrigger id="default-category">
              <SelectValue placeholder="Select a default category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technology">Technology</SelectItem>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="health">Health</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
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
