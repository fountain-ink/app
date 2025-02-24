"use client";

import { ImageUploader } from "@/components/images/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { uploadFile } from "@/lib/upload/upload-file";
import { useCallback, useEffect, useState } from "react";
import { TextareaAutosize } from "../ui/textarea";
import { BlogSettings as BlogSettingsType, BlogMetadata, useBlogSettings } from "@/hooks/use-blog-settings";
import { useWalletClient } from "wagmi";
import { toast } from "sonner";
import { group } from "@lens-protocol/metadata";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroup, setGroupMetadata } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { uri } from "@lens-protocol/client";
import { storageClient } from "@/lib/lens/storage-client";
import { clientCookieStorage } from "@/lib/lens/storage";

interface BlogSettingsProps {
  blogAddress: string;
  initialSettings: BlogSettingsType;
  isGroup?: boolean;
}

async function processImage(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }

      // Calculate the square crop dimensions
      const size = Math.min(img.width, img.height);
      const x = (img.width - size) / 2;
      const y = (img.height - size) / 2;

      // Draw the image with square crop and resize
      ctx.drawImage(
        img,
        x,
        y,
        size,
        size, // Source crop
        0,
        0,
        256,
        256, // Destination size
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create blob"));
            return;
          }
          resolve(new File([blob], file.name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.9,
      );
    };
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

interface FormState {
  title: string;
  about: string;
  metadata: {
    showAuthor: boolean;
    showTags: boolean;
    showTitle: boolean;
  };
  icon: string;
  isDirty: boolean;
  validationError: string | null;
}

interface ImageState {
  file: File | null;
  previewUrl: string | undefined;
  isDeleted: boolean;
}

export function BlogSettings({ blogAddress, initialSettings, isGroup = false }: BlogSettingsProps) {
  const { settings, saveSettings } = useBlogSettings(blogAddress, initialSettings);
  const { data: walletClient } = useWalletClient();
  const [formState, setFormState] = useState<FormState>({
    title: settings?.title || "",
    about: settings?.about || "",
    metadata: {
      showAuthor: settings?.metadata?.showAuthor ?? true,
      showTags: settings?.metadata?.showTags ?? true,
      showTitle: settings?.metadata?.showTitle ?? true,
    },
    icon: settings?.icon || "",
    isDirty: false,
    validationError: null
  });
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: undefined,
    isDeleted: false
  });

  useEffect(() => {
    setFormState({
      title: settings?.title || "",
      about: settings?.about || "",
      metadata: {
        showAuthor: settings?.metadata?.showAuthor ?? true,
        showTags: settings?.metadata?.showTags ?? true,
        showTitle: settings?.metadata?.showTitle ?? true,
      },
      icon: settings?.icon || "",
      isDirty: false,
      validationError: null
    });
    setImageState({
      file: null,
      previewUrl: undefined,
      isDeleted: false
    });
  }, [settings]);

  useEffect(() => {
    if (imageState.file) {
      const url = URL.createObjectURL(imageState.file);
      setImageState(prev => ({ ...prev, previewUrl: url }));
      return () => URL.revokeObjectURL(url);
    }
  }, [imageState.file]);

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
    if (formState.metadata.showTitle) {
      const titleError = validateBlogTitle(formState.title);
      if (titleError) {
        setFormState(prev => ({ ...prev, validationError: titleError }));
        return;
      }
    }

    let iconUrl = settings?.icon;
    if (imageState.file) {
      try {
        iconUrl = await uploadFile(imageState.file);
      } catch (error) {
        console.error("Failed to upload blog icon:", error);
        return;
      }
    }

    // Save to database
    const success = await saveSettings({
      title: formState.title.trim(),
      about: formState.about,
      metadata: formState.metadata,
      icon: imageState.isDeleted ? null : iconUrl,
    });

    // If this is a group, also save metadata on-chain
  //   if (isGroup && success) {
  //     try {
  //       const sessionClient = await getLensClient();
  //       if (!sessionClient.isSessionClient()) {
  //         toast.error("Please login to update group settings");
  //         return;
  //       }

  //       if (!walletClient) {
  //         toast.error("Please connect your wallet");
  //         return;
  //       }

  //       const currentGroup = await fetchGroup(sessionClient, { group: blogAddress })
  //       if (currentGroup.isErr()) {
  //         toast.error("Failed to fetch existing group metadata");
  //         return;
  //       }

  //       const groupMetadata = group({
  //         name: currentGroup?.value?.metadata?.name || "", 
  //         icon: iconUrl || currentGroup?.value?.metadata?.icon || undefined,
  //         coverPicture: currentGroup?.value?.metadata?.coverPicture || undefined,
  //         description: formState.about,
  //       });
  //       console.log(currentGroup, groupMetadata)

  //       const { uri: metadataUri } = await storageClient.uploadAsJson(groupMetadata);
  //       console.log("Group metadata uploaded:", metadataUri);

  //       const result = await setGroupMetadata(sessionClient, {
  //         group: blogAddress,
  //         metadataUri: uri(metadataUri),
  //       }).andThen(handleOperationWith(walletClient as any));

  //       if (result.isErr()) {
  //         console.error("Failed to update group metadata:", result.error);
  //         toast.error(`Error updating group metadata: ${result.error.message}`);
  //         return;
  //       }

  //       toast.success("Group metadata updated on-chain!");
  //     } catch (error) {
  //       console.error("Failed to update group metadata:", error);
  //       toast.error("Failed to update group metadata on-chain");
  //       return;
  //     }

  //     if (success) {
  //       setFormState(prev => ({ ...prev, isDirty: false, validationError: null }));
  //     }
  //   }
  };

  const handleMetadataChange = (field: keyof BlogMetadata, value: boolean) => {
    setFormState(prev => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      },
      isDirty: true,
    }));
  };

  const handleChange = (field: 'title' | 'about', value: string) => {
    setFormState(prev => ({
      ...prev,
      [field]: value,
      isDirty: true,
      validationError: field === 'title' ? null : prev.validationError
    }));
  };

  const handleIconChange = async (file: File | null) => {
    if (file) {
      try {
        const processedFile = await processImage(file);
        setImageState({
          file: processedFile,
          previewUrl: undefined,
          isDeleted: false
        });
        setFormState(prev => ({ ...prev, isDirty: true }));
      } catch (error) {
        console.error("Failed to process image:", error);
      }
    } else {
      setImageState({
        file: null,
        previewUrl: undefined,
        isDeleted: true
      });
      setFormState(prev => ({ ...prev, isDirty: true }));
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
                    initialImage={settings?.icon || ""}
                    onImageChange={handleIconChange}
                    className="!h-32"
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground">Original</p>
              </div>

              <div className="flex items-start gap-4">
                <div className="space-y-1.5">
                  <div className="relative w-[64px] h-[64px] rounded-md overflow-hidden ring-2 ring-background">
                    {!imageState.isDeleted && (imageState.previewUrl || settings?.icon) ? (
                      <img
                        src={imageState.previewUrl || settings?.icon || ""}
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
                    {!imageState.isDeleted && (imageState.previewUrl || settings?.icon) ? (
                      <img
                        src={imageState.previewUrl || settings?.icon || ""}
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
                    {!imageState.isDeleted && (imageState.previewUrl || settings?.icon) ? (
                      <img
                        src={imageState.previewUrl || settings?.icon || ""}
                        className="w-full h-full object-cover"
                        alt="Small preview"
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
            value={formState.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter your blog title"
            aria-invalid={formState.validationError ? "true" : "false"}
            // disabled={!formState.metadata.showTitle}
            className={!formState.metadata.showTitle ? "opacity-50" : ""}
          />
          {formState.validationError && (
            <p className="text-sm text-destructive mt-2">{formState.validationError}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 relative">
          <Label htmlFor="blog-about">Blog About</Label>
          <TextareaAutosize
            id="blog-about"
            value={formState.about}
            variant="default"
            className="p-2"
            onChange={(e) => handleChange('about', e.target.value)}
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
            <Switch
              id="show-title"
              checked={formState.metadata.showTitle}
              onCheckedChange={(checked) => handleMetadataChange('showTitle', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-author">Show Author</Label>
              <p className="text-sm text-muted-foreground">Display your name above the blog title</p>
            </div>
            <Switch
              id="show-author"
              checked={formState.metadata.showAuthor}
              onCheckedChange={(checked) => handleMetadataChange('showAuthor', checked)}
            />
          </div>

          <div className="flex items-center justify-between space-y-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-tags">Show Tags</Label>
              <p className="text-sm text-muted-foreground">Display article tags below the blog title</p>
            </div>
            <Switch
              id="show-tags"
              checked={formState.metadata.showTags}
              onCheckedChange={(checked) => handleMetadataChange('showTags', checked)}
            />
          </div>
        </div>

        <div className="flex justify-start pt-4">
          <Button
            onClick={handleSave}
            disabled={!formState.isDirty || !!formState.validationError}
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

