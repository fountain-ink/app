"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";
import { useState } from "react";
import { Button } from "../ui/button";

export function BlogSettings({ profile }: { profile: Profile | ProfileFragment | null | undefined }) {
  const currentMetadata = profile?.metadata;
  const [blogTitle, setBlogTitle] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "blogTitle")?.value || "",
  );
  const { saveSettings, isSaving } = useSaveProfileSettings();

  if (!profile) return null;

  const handleSave = async () => {
    const attributes = [
      {
        key: "blogTitle",
        type: "String",
        value: blogTitle,
      },
    ];

    await saveSettings({
      profile,
      attributes,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Settings</CardTitle>
        <CardDescription>Configure your blog preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="blog-title">Blog Title</Label>
          <Input
            id="blog-title"
            value={blogTitle}
            onChange={(e) => setBlogTitle(e.target.value)}
            placeholder="Enter your blog title"
          />
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
