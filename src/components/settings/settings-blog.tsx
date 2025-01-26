"use client";

import { ImageUploader } from "@/components/images/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMetadata } from "@/hooks/use-metadata";
import { uploadFile } from "@/lib/upload/upload-file";
import { useCallback, useEffect, useState } from "react";
import { TextareaAutosize } from "../ui/textarea";
import { UserMetadata } from "@/lib/settings/types";

interface BlogSettings {
  title?: string;
  about?: string;
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
  icon?: string;
}

interface BlogSettingsProps {
  initialSettings?: UserMetadata;
}

async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      // Calculate the square crop dimensions
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      // Draw the image with square crop and resize
      ctx.drawImage(
        img,
        x, y, size, size,  // Source crop
        0, 0, 256, 256     // Destination size
      );

      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error('Failed to create blob'));
          return;
        }
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', 0.9);
    };
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = URL.createObjectURL(file);
  });
}

export function BlogSettings({ initialSettings }: BlogSettingsProps) {
  const { metadata, saveMetadata } = useMetadata(initialSettings);
  const [blogTitle, setBlogTitle] = useState(metadata?.blog?.title || "");
  const [blogAbout, setBlogAbout] = useState(metadata?.blog?.about || "");
  const [showAuthor, setShowAuthor] = useState(metadata?.blog?.showAuthor ?? true);
  const [showTags, setShowTags] = useState(metadata?.blog?.showTags ?? true);
  const [showTitle, setShowTitle] = useState(metadata?.blog?.showTitle ?? true);
  const [blogIcon, setBlogIcon] = useState<File | null>(null);
  const [isIconDeleted, setIsIconDeleted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    setBlogTitle(metadata?.blog?.title || "");
    setBlogAbout(metadata?.blog?.about || "");
    setShowAuthor(metadata?.blog?.showAuthor ?? true);
    setShowTags(metadata?.blog?.showTags ?? true);
    setShowTitle(metadata?.blog?.showTitle ?? true);
    setBlogIcon(null);
    setPreviewUrl(null);
    setIsIconDeleted(false);
    setIsDirty(false);
  }, [metadata]);

  useEffect(() => {
    if (blogIcon) {
      const url = URL.createObjectURL(blogIcon);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [blogIcon]);

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
    if (showTitle) {
      const titleError = validateBlogTitle(blogTitle);
      if (titleError) {
        setValidationError(titleError);
        return;
      }
    }

    let iconUrl = metadata?.blog?.icon;
    if (blogIcon) {
      try {
        iconUrl = await uploadFile(blogIcon);
      } catch (error) {
        console.error('Failed to upload blog icon:', error);
        return;
      }
    }

    const newMetadata = {
      ...metadata,
      blog: {
        title: blogTitle.trim(),
        about: blogAbout,
        showTags,
        showTitle,
        showAuthor,
        icon: iconUrl,
      },
    };

    setValidationError(null);
    const success = await saveMetadata(newMetadata);
    if (success) {
      setIsDirty(false);
    }
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setBlogTitle(newTitle);
    setValidationError(null);
    setIsDirty(true);
  };

  const handleAboutChange = (value: string) => {
    setBlogAbout(value);
    setIsDirty(true);
  };

  const handleShowTitleChange = (checked: boolean) => {
    setShowTitle(checked);
    setIsDirty(true);
  };

  const handleShowAuthorChange = (checked: boolean) => {
    setShowAuthor(checked);
    setIsDirty(true);
  };

  const handleShowTagsChange = (checked: boolean) => {
    setShowTags(checked);
    setIsDirty(true);
  };

  const handleIconChange = async (file: File | null) => {
    if (file) {
      try {
        const processedFile = await processImage(file);
        setBlogIcon(processedFile);
        setIsIconDeleted(false);
        setIsDirty(true);
      } catch (error) {
        console.error('Failed to process image:', error);
      }
    } else {
      setBlogIcon(null);
      setPreviewUrl(null);
      setIsIconDeleted(true);
      setIsDirty(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Blog Settings</CardTitle>
        <CardDescription>Configure your blog preferences.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Blog Icon</Label>
            <p className="text-sm text-muted-foreground">
              Square PNG or JPG, best results with 256x256 pixels or larger.
            </p>
            <div className="flex items-start gap-4">
              <div className="space-y-1.5">
                <div className="w-32">
                  <ImageUploader
                    label="Icon"
                    initialImage={metadata?.blog?.icon || ""}
                    onImageChange={handleIconChange}
                    className="!h-32"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">Original</p>
              </div>


              <div className="flex items-start gap-4">
                <div className="space-y-1.5">
                  <div className="relative w-[64px] h-[64px] rounded-md overflow-hidden ring-2 ring-background">
                    {(!isIconDeleted && (previewUrl || metadata?.blog?.icon)) ? (
                      <img
                        src={previewUrl || metadata?.blog?.icon}
                        alt="Small preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="placeholder-background" />
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">64px</p>
                </div>

                <div className="space-y-1.5">
                  <div className="relative w-[32px] h-[32px] rounded-sm overflow-hidden ring-2 ring-background">
                    {(!isIconDeleted && (previewUrl || metadata?.blog?.icon)) ? (
                      <img
                        src={previewUrl || metadata?.blog?.icon}
                        alt="Medium preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="placeholder-background" />
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">32px</p>
                </div>


                <div className="space-y-1.5">
                  <div className="relative w-[16px] h-[16px] rounded-none overflow-hidden ring-2 ring-background">
                    {(!isIconDeleted && (previewUrl || metadata?.blog?.icon)) ? (
                      <img
                        src={previewUrl || metadata?.blog?.icon}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="placeholder-background" />
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">16px</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="blog-title">Blog Title</Label>
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

        <div className="flex flex-col gap-2 relative">
          <Label htmlFor="blog-about">Blog About</Label>
          <TextareaAutosize
            id="blog-about"
            value={blogAbout}
            variant="default"
            className="p-2"
            onChange={(e) => handleAboutChange(e.target.value)}
            placeholder="Write a description about your blog"
          />
        </div>

        <h2 className="text-lg font-semibold">Display Options</h2>

        <div className="p-4 pt-0 space-y-4">
          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-title">Show Title</Label>
              <p className="text-sm text-muted-foreground">Display the blog title at the top of your page</p>
            </div>
            <Switch id="show-title" checked={showTitle} onCheckedChange={handleShowTitleChange} />
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
        </div>

        <div className="flex justify-start pt-4">
          <Button
            onClick={handleSave}
            disabled={!isDirty || !!validationError}
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
