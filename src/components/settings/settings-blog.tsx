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

export function BlogSettings({ profile }: { profile: Profile | ProfileFragment | null }) {
  if (!profile) return null;

  const currentMetadata = profile?.metadata;
  const handle = profile?.handle?.localName || "";
  const { execute: setProfileMetadata, loading } = useSetProfileMetadata();

  const [blogTitle, setBlogTitle] = useState(currentMetadata?.displayName || "");
  const [blogDescription, setBlogDescription] = useState(currentMetadata?.bio || "");
  const [blogBackground, setBlogBackground] = useState(currentMetadata?.coverPicture?.raw.uri);
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
      name: blogTitle || undefined,
      bio: blogDescription || undefined,
      coverPicture: blogBackground || undefined,
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
    blogTitle,

    blogDescription,
    blogBackground,
    defaultCategory,
    enableComments,
    autoPublish,
    setProfileMetadata,
  ]);

  const handleBackgroundChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0] && handle) {
      const file = e.target.files[0];
      const uploadedUri = await uploadMetadata(file, handle);
      setBlogBackground(uploadedUri);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Settings</CardTitle>
        <CardDescription>Customize your blog preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Blog Title</Label>
          <Input
            id="blog-title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Your blog title"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-description">Blog Description</Label>
          <Textarea
            id="blog-description"
            value={blogDescription}
            onChange={(e) => setBlogDescription(e.target.value)}
            placeholder="Your blog description"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="blog-background">Blog Background</Label>
          <Input id="blog-background" type="file" accept="image/*" onChange={handleBackgroundChange} />
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
