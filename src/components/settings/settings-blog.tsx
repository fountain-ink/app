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
import { BlogData, BlogMetadata } from "@/lib/settings/get-blog-metadata";
import { useBlogSettings } from "@/hooks/use-blog-settings";
import { useWalletClient } from "wagmi";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { isValidTheme, ThemeType, themeNames, defaultThemeName } from "@/styles/themes";
// import { toast } from "sonner";
// import { group } from "@lens-protocol/metadata";
// import { getLensClient } from "@/lib/lens/client";
// import { fetchGroup, setGroupMetadata } from "@lens-protocol/client/actions";
// import { handleOperationWith } from "@lens-protocol/client/viem";
// import { uri } from "@lens-protocol/client";
// import { storageClient } from "@/lib/lens/storage-client";
// import { clientCookieStorage } from "@/lib/lens/storage";

interface BlogSettingsProps {
  initialSettings: BlogData;
  isUserBlog?: boolean;
  userHandle?: string;
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
  handle: string;
  metadata: {
    showAuthor: boolean;
    showTags: boolean;
    showTitle: boolean;
  };
  theme: {
    name: ThemeType;
  };
  icon: string;
  isDirty: boolean;
  errors: {
    title: string | null;
    handle: string | null;
  };
}

interface ImageState {
  file: File | null;
  previewUrl: string | undefined;
  isDeleted: boolean;
}

export function BlogSettings({ initialSettings, isUserBlog = false, userHandle }: BlogSettingsProps) {
  const { settings, saveSettings } = useBlogSettings(initialSettings);
  const { data: walletClient } = useWalletClient();
  const [formState, setFormState] = useState<FormState>({
    title: settings?.title || "",
    about: settings?.about || "",
    handle: isUserBlog ? (userHandle || "") : (settings?.handle || ""),
    metadata: {
      showAuthor: settings?.metadata?.showAuthor ?? true,
      showTags: settings?.metadata?.showTags ?? true,
      showTitle: settings?.metadata?.showTitle ?? true,
    },
    theme: {
      name: settings?.theme?.name as ThemeType || defaultThemeName,
    },
    icon: settings?.icon || "",
    isDirty: false,
    errors: {
      title: null,
      handle: null
    }
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
      handle: isUserBlog ? (userHandle || "") : (settings?.handle || ""),
      metadata: {
        showAuthor: settings?.metadata?.showAuthor ?? true,
        showTags: settings?.metadata?.showTags ?? true,
        showTitle: settings?.metadata?.showTitle ?? true,
      },
      theme: {
        name: settings?.theme?.name as ThemeType || defaultThemeName,
      },
      icon: settings?.icon || "",
      isDirty: false,
      errors: {
        title: null,
        handle: null
      }
    });
    setImageState({
      file: null,
      previewUrl: undefined,
      isDeleted: false
    });
  }, [settings, isUserBlog, userHandle]);

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

  const validateHandle = useCallback((handle: string) => {
    if (handle.trim().length === 0) {
      return "Handle cannot be empty";
    }
    if (!/^[a-z0-9-]+$/.test(handle)) {
      return "Handle can only contain lowercase letters, numbers, and hyphens";
    }
    if (handle.length > 50) {
      return "Handle must be less than 50 characters";
    }
    return null;
  }, []);

  const handleSave = async () => {
    // Validate all fields before saving
    const titleError = formState.metadata.showTitle ? validateBlogTitle(formState.title) : null;
    const handleError = validateHandle(formState.handle);

    setFormState(prev => ({
      ...prev,
      errors: {
        title: titleError,
        handle: handleError
      }
    }));

    if (titleError || handleError) {
      return;
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
      handle: formState.handle.trim(),
      metadata: formState.metadata,
      theme: formState.theme,
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

    if (success) {
      setFormState(prev => ({ ...prev, isDirty: false, errors: { title: null, handle: null } }));
    }
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

  const handleChange = (field: 'title' | 'about' | 'handle', value: string) => {
    // Don't allow handle changes for user blogs
    if (field === 'handle' && isUserBlog) return;

    let fieldError: string | null = null;

    // Validate the field as it changes
    if (field === 'title' && formState.metadata.showTitle) {
      fieldError = validateBlogTitle(value);
    } else if (field === 'handle') {
      fieldError = validateHandle(value);
    }

    setFormState(prev => ({
      ...prev,
      [field]: value,
      isDirty: true,
      errors: {
        ...prev.errors,
        [field]: fieldError
      }
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

  // Add a new handler for theme changes
  const handleThemeChange = (themeName: ThemeType) => {
    setFormState(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        name: themeName
      },
      isDirty: true
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <div className="mb-2">
            <Link 
              href="/settings/blogs/" 
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-accent-foreground h-9 px-3 py-2 pl-0"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Link>
          </div>
          <CardTitle>Blog Settings</CardTitle>
          <CardDescription>Configure your blog preferences.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="">
            <Label>Blog Icon</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Best results with square images, 256x256 or larger.
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

              {/* <div className="flex items-start gap-4">
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
                        className="absolute w-full h-full object-cover"
                        alt="Small preview"
                      />
                    ) : (
                      <div className="placeholder-background" />
                    )}
                  </div>
                  <p className="text-xs text-center text-muted-foreground">16px</p>
                </div> */}
              {/* </div> */}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="">
            <Label htmlFor="blog-title">Title</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Main header on your blog page
            </p>
            <Input
              id="blog-title"
              value={formState.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Enter your blog title"
              className={!formState.metadata.showTitle ? "opacity-50" : ""}
            />
            {formState.errors.title && (
              <p className="text-sm text-destructive mt-2">{formState.errors.title}</p>
            )}
          </div>

          {/* <div className="">
            <Label htmlFor="blog-handle">Slug</Label>
            <p className="text-sm text-muted-foreground mb-2">
              URL slug for your blog, i.e. /b/{formState.handle || "your-handle"}
            </p>
            <Input
              id="blog-handle"
              value={formState.handle}
              onChange={(e) => handleChange('handle', e.target.value.toLowerCase())}
              placeholder="your-blog-handle"
              disabled={isUserBlog}
              className={isUserBlog ? "opacity-50 cursor-not-allowed" : ""}
            />
            {formState.errors.handle && !isUserBlog && (
              <p className="text-sm text-destructive mt-2">{formState.errors.handle}</p>
            )}
          </div> */}
        </div> 

        <div className="relative">
          <Label htmlFor="blog-about" className="flex flex-row items-center gap-2">
            About
            <p className="text-sm font-normal text-muted-foreground">(optional)</p>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">
            Short description of your blog
          </p>
          <TextareaAutosize
            id="blog-about"
            value={formState.about}
            variant="default"
            className="p-2"
            onChange={(e) => handleChange('about', e.target.value)}
            placeholder="A short description of your blog"
          />
        </div>

        <h2 className="text-lg font-semibold">Display Options</h2>

        <div className="p-4 pt-0 space-y-4">
          <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center justify-between gap-2">
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

          <div className="flex items-center justify-between gap-2">
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

        <div className="space-y-4 py-2 pb-4">
          <div className="space-y-2">
            <Label htmlFor="theme">Theme</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {themeNames.map((themeName) => {
                const isSelected = formState.theme.name === themeName;
                return (
                  <div
                    key={themeName}
                    className={`border rounded-lg relative cursor-pointer overflow-hidden transition-all hover:border-primary ${
                      isSelected ? "border-primary ring-2 ring-primary ring-offset-2" : "border-border"
                    }`}
                    onClick={() => handleThemeChange(themeName)}
                  >
                    <div className="p-6">
                      <div className="capitalize font-medium text-xl mb-1">
                        {themeName === "editorial" ? "Editorial" : "Modern"}
                        <div className="text-muted-foreground text-sm font-normal">
                          {themeName === "editorial" ? "Classic readable serif" : "Clean modern sans-serif"}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 h-6 w-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 6L9 17l-5-5" />
                        </svg>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            onClick={handleSave}
            disabled={!formState.isDirty || Object.values(formState.errors).some(error => error !== null)}
          >
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

