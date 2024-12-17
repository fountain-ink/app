"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  const [showAuthor, setShowAuthor] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "showAuthor")?.value !== "false"
  );
  const [showTags, setShowTags] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "showTags")?.value !== "false"
  );
  const [showTitle, setShowTitle] = useState(
    currentMetadata?.attributes?.find((attr) => attr.key === "showTitle")?.value !== "false"
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
    
    if (showTitle) {
      const titleError = validateBlogTitle(blogTitle);
      if (titleError) {
        setError(titleError);
        return;
      }
    }

    try {
      const attributes = [
        {
          key: "blogTitle",
          type: "String",
          value: blogTitle.trim(),
        },
        {
          key: "showTags",
          type: "Boolean",
          value: showTags.toString(),
        },
        {
          key: "showTitle",
          type: "Boolean",
          value: showTitle.toString(),
        },
        {
          key: "showAuthor",
          type: "Boolean",
          value: showAuthor.toString(),
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
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-title">Show Title</Label>
            <p className="text-sm text-muted-foreground">
              Display the blog title at the top of your page
            </p>
          </div>
          <Switch
            id="show-title"
            checked={showTitle}
            onCheckedChange={setShowTitle}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-title" className={!showTitle ? "text-muted-foreground" : ""}>Blog Title</Label>
          <Input
            id="blog-title"
            value={blogTitle}
            onChange={(e) => {
              setBlogTitle(e.target.value);
              setError(null);
            }}
            placeholder="Enter your blog title"
            aria-invalid={error ? "true" : "false"}
            disabled={!showTitle}
            className={!showTitle ? "opacity-50" : ""}
          />
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </div>

        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-author">Show Author</Label>
            <p className="text-sm text-muted-foreground">
              Display your name above the blog title
            </p>
          </div>
          <Switch
            id="show-author"
            checked={showAuthor}
            onCheckedChange={setShowAuthor}
          />
        </div>
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-tags">Show Tags</Label>
            <p className="text-sm text-muted-foreground">
              Display article tags below the blog title
            </p>
          </div>
          <Switch
            id="show-tags"
            checked={showTags}
            onCheckedChange={setShowTags}
          />
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
