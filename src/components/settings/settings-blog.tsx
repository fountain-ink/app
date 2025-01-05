"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettings } from "@/hooks/use-settings";
import { useCallback, useEffect, useState } from "react";

interface BlogSettingsProps {
  initialSettings?: any;
}

export function BlogSettings({ initialSettings = {} }: BlogSettingsProps) {
  const { settings, saveSettings } = useSettings(initialSettings);
  const [blogTitle, setBlogTitle] = useState(settings.blog?.title || "");
  const [showAuthor, setShowAuthor] = useState(settings.blog?.showAuthor ?? true);
  const [showTags, setShowTags] = useState(settings.blog?.showTags ?? true);
  const [showTitle, setShowTitle] = useState(settings.blog?.showTitle ?? true);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    setBlogTitle(settings.blog?.title || "");
    setShowAuthor(settings.blog?.showAuthor ?? true);
    setShowTags(settings.blog?.showTags ?? true);
    setShowTitle(settings.blog?.showTitle ?? true);
  }, [settings]);

  const validateBlogTitle = useCallback((title: string) => {
    if (title.trim().length === 0) {
      return "Blog title cannot be empty";
    }
    if (title.length > 100) {
      return "Blog title must be less than 100 characters";
    }
    return null;
  }, []);

  const handleSave = useCallback(
    (updates: Partial<typeof settings.blog>) => {
      const newSettings = {
        ...settings,
        blog: {
          title: blogTitle.trim(),
          showTags,
          showTitle,
          showAuthor,
          ...updates,
        },
      };

      if (newSettings.blog.showTitle) {
        const titleError = validateBlogTitle(newSettings.blog.title);
        if (titleError) {
          setValidationError(titleError);
          return;
        }
      }

      setValidationError(null);
      saveSettings(newSettings);
    },
    [settings, blogTitle, showTags, showTitle, showAuthor, validateBlogTitle, saveSettings],
  );

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setBlogTitle(newTitle);
    setValidationError(null);
    if (showTitle) {
      handleSave({ title: newTitle });
    }
  };

  const handleShowTitleChange = (checked: boolean) => {
    setShowTitle(checked);
    handleSave({ showTitle: checked });
  };

  const handleShowAuthorChange = (checked: boolean) => {
    setShowAuthor(checked);
    handleSave({ showAuthor: checked });
  };

  const handleShowTagsChange = (checked: boolean) => {
    setShowTags(checked);
    handleSave({ showTags: checked });
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
            <p className="text-sm text-muted-foreground">Display the blog title at the top of your page</p>
          </div>
          <Switch id="show-title" checked={showTitle} onCheckedChange={handleShowTitleChange} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-title" className={!showTitle ? "text-muted-foreground" : ""}>
            Blog Title
          </Label>
          <Input
            id="blog-title"
            value={blogTitle}
            onChange={handleTitleChange}
            placeholder="Enter your blog title"
            aria-invalid={validationError ? "true" : "false"}
            disabled={!showTitle}
            className={!showTitle ? "opacity-50" : ""}
          />
          {validationError && <p className="text-sm text-destructive mt-2">{validationError}</p>}
        </div>

        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-author">Show Author</Label>
            <p className="text-sm text-muted-foreground">Display your name above the blog title</p>
          </div>
          <Switch id="show-author" checked={showAuthor} onCheckedChange={handleShowAuthorChange} />
        </div>
        <div className="flex items-center justify-between space-y-2">
          <div className="space-y-0.5">
            <Label htmlFor="show-tags">Show Tags</Label>
            <p className="text-sm text-muted-foreground">Display article tags below the blog title</p>
          </div>
          <Switch id="show-tags" checked={showTags} onCheckedChange={handleShowTagsChange} />
        </div>
      </CardContent>
    </Card>
  );
}
