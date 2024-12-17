"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveProfileSettings } from "@/hooks/use-save-profile-settings";
import type { ProfileFragment } from "@lens-protocol/client";
import type { Profile } from "@lens-protocol/react-web";
import { useCallback, useState } from "react";
import { Button } from "../ui/button";

export function BlogSettings({ profile }: { profile: Profile | ProfileFragment | null | undefined }) {
  const currentMetadata = profile?.metadata;
  const [blogTitle, setBlogTitle] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "blogTitle")?.value || "",
  );
  const [error, setError] = useState<string | null>(null);
  const { saveSettings, isSaving } = useSaveProfileSettings();

  if (!profile) return null;

  const validateBlogTitle = useCallback((title: string) => {
    if (title.trim().length === 0) {
      return "Blog title cannot be empty";
    }
    if (title.length > 100) {
      return "Blog title must be less than 100 characters";
    }
    return null;
  }, []);

  const handleSave = async () => {
    setError(null);
    
    const titleError = validateBlogTitle(blogTitle);
    if (titleError) {
      setError(titleError);
      return;
    }

    try {
      const attributes = [
        {
          key: "blogTitle",
          type: "String",
          value: blogTitle.trim(),
        },
      ];

      await saveSettings({
        profile,
        attributes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings");
    }
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
            onChange={(e) => {
              setBlogTitle(e.target.value);
              setError(null);
            }}
            placeholder="Enter your blog title"
            aria-invalid={error ? "true" : "false"}
          />
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving || !!error || !blogTitle.trim()}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </CardContent>
    </Card>
  );
}
