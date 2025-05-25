"use client";

import { ImageUploader } from "@/components/images/image-uploader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { uploadFile } from "@/lib/upload/upload-file";
import { useCallback, useEffect, useState } from "react";
import { TextareaAutosize } from "../ui/textarea";
import { BlogData, BlogMetadata } from "@/lib/settings/get-blog-data";
import { useBlogSettings } from "@/hooks/use-blog-settings";
import { useWalletClient } from "wagmi";
import Link from "next/link";
import { ArrowLeftIcon, ExternalLink, MailIcon, ChevronDownIcon, ChevronUpIcon, CodeIcon } from "lucide-react";
import { isValidTheme, ThemeType, themeNames, themeDescriptions, defaultThemeName } from "@/styles/themes";
import { ThemeButtons } from "@/components/theme/theme-buttons";
import { toast } from "sonner";
import { createClient } from "@/lib/db/client";
import { getBaseUrl } from "@/lib/get-base-url";
import { motion, AnimatePresence } from "motion/react";
import { group } from "@lens-protocol/metadata";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroup, setGroupMetadata } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { storageClient } from "@/lib/lens/storage-client";
import { uri } from "@lens-protocol/client";
import { defaultCssPlaceholder, cssExamples, CssExampleKey } from "@/lib/css-examples";

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
  handle: string | null;
  slug: string;
  metadata: {
    showAuthor: boolean;
    showTags: boolean;
    showTitle: boolean;
  };
  theme: {
    name: ThemeType;
    customCss: string;
  };
  showCustomCss: boolean;
  icon: string;
  isDirty: boolean;
  errors: {
    title: string | null;
    slug: string | null;
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
    handle: userHandle || null,
    slug: settings?.slug || "",
    metadata: {
      showAuthor: settings?.metadata?.showAuthor ?? true,
      showTags: settings?.metadata?.showTags ?? true,
      showTitle: settings?.metadata?.showTitle ?? true,
    },
    theme: {
      name: (settings?.theme?.name as ThemeType) || defaultThemeName,
      customCss: settings?.theme?.customCss || "",
    },
    showCustomCss: Boolean(settings?.theme?.customCss?.trim()),
    icon: settings?.icon || "",
    isDirty: false,
    errors: {
      title: null,
      slug: null,
    },
  });
  const [imageState, setImageState] = useState<ImageState>({
    file: null,
    previewUrl: undefined,
    isDeleted: false,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [feedAddress, setFeedAddress] = useState<string | null>(null);
  const [highlightedElement, setHighlightedElement] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("basic");

  const blogAddress = initialSettings.address;
  const blogUrl = isUserBlog ? `/b/${userHandle}` : `/b/${blogAddress}`;

  useEffect(() => {
    setFormState((prev) => ({
      title: settings?.title || "",
      about: settings?.about || "",
      handle: isUserBlog ? userHandle || "" : settings?.handle || "",
      slug: settings?.slug || "",
      metadata: {
        showAuthor: settings?.metadata?.showAuthor ?? true,
        showTags: settings?.metadata?.showTags ?? true,
        showTitle: settings?.metadata?.showTitle ?? true,
      },
      theme: {
        name: (settings?.theme?.name as ThemeType) || defaultThemeName,
        customCss: settings?.theme?.customCss || "",
      },
      showCustomCss: Boolean(settings?.theme?.customCss?.trim()),
      icon: settings?.icon || "",
      isDirty: false,
      errors: {
        title: null,
        slug: null,
      },
    }));
    setImageState({
      file: null,
      previewUrl: undefined,
      isDeleted: false,
    });
  }, [settings, isUserBlog, userHandle]);

  useEffect(() => {
    if (imageState.file) {
      const url = URL.createObjectURL(imageState.file);
      setImageState((prev) => ({ ...prev, previewUrl: url }));
      return () => URL.revokeObjectURL(url);
    }
  }, [imageState.file]);

  const validateBlogTitle = useCallback((title: string) => {
    if (title.length > 100) {
      return "Blog title must be less than 100 characters";
    }
    return null;
  }, []);

  const validateSlug = useCallback(
    async (slug: string): Promise<string | null> => {
      if (!slug) {
        return null;
      }
      if (!/^[a-zA-Z0-9-]+$/.test(slug)) {
        return "Slug can only contain letters, numbers, and hyphens";
      }
      if (slug.length > 50) {
        return "Slug must be less than 50 characters";
      }

      try {
        const db = await createClient();
        const { data: existingBlogs } = await db
          .from("blogs")
          .select("slug, address")
          .eq("owner", initialSettings.owner)
          .neq("address", initialSettings.address);

        if (existingBlogs?.some((blog) => blog.slug === slug)) {
          return `You already have a blog with slug "${slug}"`;
        }
      } catch (error) {
        console.error("Error validating slug:", error);
      }

      return null;
    },
    [initialSettings.owner, initialSettings.address],
  );

  const handleSave = async () => {
    setIsSaving(true);

    const titleError = formState.metadata.showTitle ? validateBlogTitle(formState.title) : null;
    const slugError = await validateSlug(formState.slug);

    setFormState((prev) => ({
      ...prev,
      errors: {
        title: titleError,
        slug: slugError,
      },
    }));

    if (titleError || slugError) {
      setIsSaving(false);
      return;
    }

    let iconUrl = settings?.icon;
    if (imageState.file) {
      try {
        iconUrl = await uploadFile(imageState.file);
      } catch (error) {
        console.error("Failed to upload blog icon:", error);
        toast.error("Failed to upload blog icon");
        setIsSaving(false);
        return;
      }
    }

    // Show pending toast for saving to Fountain
    const fountainToastId = toast.loading("Saving settings on Fountain...");
    let success = false;
    try {
      success = await saveSettings({
        title: formState.title.trim(),
        about: formState.about,
        handle: userHandle || null,
        slug: formState.slug.trim(),
        metadata: formState.metadata,
        theme: formState.theme,
        icon: imageState.isDeleted ? null : iconUrl,
      });
      if (success) {
        toast.success("Settings saved on Fountain!", { id: fountainToastId });
      } else {
        toast.error("Failed to save settings on Fountain", { id: fountainToastId });
      }
    } catch (error) {
      toast.error("Failed to save settings on Fountain", { id: fountainToastId });
      setIsSaving(false);
      return;
    }

    // Save on-chain
    if (!isUserBlog && success) {
      // Show pending toast for on-chain update
      const chainToastId = toast.loading("Updating blog settings on-chain...");
      try {
        const sessionClient = await getLensClient();
        if (!sessionClient.isSessionClient()) {
          toast.error("Please login to update group settings", { id: chainToastId });
          return;
        }

        if (!walletClient) {
          toast.error("Please connect your wallet", { id: chainToastId });
          return;
        }

        const currentGroup = await fetchGroup(sessionClient, { group: blogAddress });
        if (currentGroup.isErr()) {
          toast.error("Failed to fetch existing group metadata", { id: chainToastId });
          return;
        }

        const groupMetadata = group({
          name: currentGroup?.value?.metadata?.name || "",
          icon: iconUrl || currentGroup?.value?.metadata?.icon || undefined,
          coverPicture: currentGroup?.value?.metadata?.coverPicture || undefined,
          description: formState.about,
        });
        console.log(currentGroup, groupMetadata);

        const { uri: metadataUri } = await storageClient.uploadAsJson(groupMetadata);
        console.log("Group metadata uploaded:", metadataUri);

        const result = await setGroupMetadata(sessionClient, {
          group: blogAddress,
          metadataUri: uri(metadataUri),
        }).andThen(handleOperationWith(walletClient as any));

        if (result.isErr()) {
          console.error("Failed to update group metadata:", result.error);
          toast.error(`Error updating group metadata: ${result.error.message}`, { id: chainToastId });
          return;
        }

        toast.success("Blog settings updated on-chain!", { id: chainToastId });
      } catch (error) {
        console.error("Failed to update group metadata:", error);
        toast.error("Failed to update group metadata on-chain", { id: chainToastId });
        return;
      }
    }

    if (success) {
      setFormState((prev) => ({ ...prev, isDirty: false, errors: { title: null, slug: null } }));
    }

    setIsSaving(false);
  };

  const handleMetadataChange = (field: keyof BlogMetadata, value: boolean) => {
    setFormState((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value,
      },
      isDirty: true,
    }));
  };

  const handleChange = (field: "title" | "about" | "handle" | "slug", value: string) => {
    let fieldError: string | null = null;

    if (field === "title") {
      fieldError = validateBlogTitle(value);
    }

    setFormState((prev) => ({
      ...prev,
      [field]: value,
      isDirty: true,
      errors: {
        ...prev.errors,
        [field]: fieldError,
      },
    }));
  };

  const handleIconChange = async (file: File | null) => {
    if (file) {
      try {
        const processedFile = await processImage(file);
        setImageState({
          file: processedFile,
          previewUrl: undefined,
          isDeleted: false,
        });
        setFormState((prev) => ({ ...prev, isDirty: true }));
      } catch (error) {
        console.error("Failed to process image:", error);
      }
    } else {
      setImageState({
        file: null,
        previewUrl: undefined,
        isDeleted: true,
      });
      setFormState((prev) => ({ ...prev, isDirty: true }));
    }
  };

  const handleCustomCssChange = (css: string) => {
    setFormState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        customCss: css,
      },
      isDirty: true,
    }));
  };

  const handleCustomCssToggle = (show: boolean) => {
    setFormState((prev) => ({
      ...prev,
      showCustomCss: show,
      theme: {
        ...prev.theme,
        customCss: show ? prev.theme.customCss : "", // Clear CSS when toggled off
      },
      isDirty: true,
    }));
  };

  const handleThemeChange = (themeName: ThemeType) => {
    console.log(themeName, formState);
    setFormState((prev) => ({
      ...prev,
      theme: {
        ...prev.theme,
        name: themeName,
      },
      isDirty: true,
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div>
          <div className="mb-2">
            <Link
              href="/settings/blogs/"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-muted-foreground hover:text-accent-foreground h-9 px-3 py-0 pb-2 pl-0"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back
            </Link>
          </div>
          <CardTitle>Blog Settings</CardTitle>
          <CardDescription>Configure your blog preferences.</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Link href="/settings/newsletter">
            <Button variant="outline" size="sm">
              <MailIcon className="h-4 w-4 mr-2" />
              Newsletter
            </Button>
          </Link>
          <Link href={blogUrl} target="_blank">
            <Button variant="outline" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="">
                <Label>Blog Icon</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Best results with square images, 256x256 or larger.
                </p>
                <div className="w-32">
                  <ImageUploader
                    label="Icon"
                    initialImage={settings?.icon || ""}
                    onImageChange={handleIconChange}
                    className="!h-32"
                  />
                </div>
              </div>

              {!isUserBlog && (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="blog-address">Blog Address</Label>
                    <p className="text-sm text-muted-foreground mb-2">On-chain address of the blog</p>
                    <Input
                      id="blog-address"
                      value={blogAddress}
                      readOnly
                      className="opacity-70 cursor-not-allowed font-mono text-sm"
                    />
                  </div>

                  <div>
                    <Label htmlFor="feed-address">Feed Address</Label>
                    <p className="text-sm text-muted-foreground mb-2">On-chain address of the blog feed</p>
                    <Input
                      id="feed-address"
                      value={initialSettings.feed || "No feed address available"}
                      readOnly
                      className="opacity-70 cursor-not-allowed font-mono text-sm"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="">
            <Label htmlFor="blog-title">Title</Label>
            <p className="text-sm text-muted-foreground mb-2">Main header on your blog page</p>
            <Input
              id="blog-title"
              value={formState.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Enter your blog title"
              className={!formState.metadata.showTitle ? "opacity-50" : ""}
            />
            {formState.errors.title && <p className="text-sm text-destructive mt-2">{formState.errors.title}</p>}
          </div>

          <div className="">
            <Label htmlFor="blog-slug">Slug</Label>
            <p className="text-sm text-muted-foreground mb-2">
              {isUserBlog
                ? `URL slug for your blog, i.e. /b/${userHandle}`
                : `URL slug for your blog, i.e. /b/${userHandle}/${formState.slug || "your-slug"}`}
            </p>
            <Input
              id="blog-slug"
              value={isUserBlog ? userHandle : formState.slug}
              onChange={(e) => handleChange("slug", e.target.value.toLowerCase())}
              disabled={isUserBlog}
              className={isUserBlog ? "opacity-50 cursor-not-allowed" : ""}
              placeholder="your-slug"
            />
            {formState.errors.slug && <p className="text-sm text-destructive mt-2">{formState.errors.slug}</p>}
          </div>
        </div>

        <div className="relative">
          <Label htmlFor="blog-about" className="flex flex-row items-center gap-2">
            About
            <p className="text-sm font-normal text-muted-foreground">(optional)</p>
          </Label>
          <p className="text-sm text-muted-foreground mb-2">Short description of your blog</p>
          <TextareaAutosize
            id="blog-about"
            value={formState.about}
            variant="default"
            className="p-2"
            onChange={(e) => handleChange("about", e.target.value)}
            placeholder="A short description of your blog"
          />
        </div>

        <div className="space-y-4 py-2 pb-4">
          <div className="">
            <h2 className="text-lg font-semibold mb-2">Theme</h2>

            <ThemeButtons currentTheme={formState.theme.name} onChange={handleThemeChange} />

            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <Label htmlFor="custom-css-toggle" className="flex items-center gap-2">
                    <CodeIcon className="w-4 h-4" />
                    Custom CSS
                  </Label>
                  <p className="text-sm text-muted-foreground">Override article styles using your own CSS.</p>
                </div>
                <Switch
                  id="custom-css-toggle"
                  checked={formState.showCustomCss}
                  onCheckedChange={handleCustomCssToggle}
                />
              </div>

              <AnimatePresence>
                {formState.showCustomCss && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="pt-2 space-y-4">
                      <div>
                        <Label htmlFor="custom-css" className="text-sm font-medium mb-2 block">
                          CSS Editor
                        </Label>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: "auto" }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="border border-border rounded-lg bg-muted/50 h-[200px]">
                            <ScrollArea className="h-full">
                              <TextareaAutosize
                                id="custom-css"
                                variant="default"
                                className="font-mono text-xs md:text-xs p-3 w-full border-0 bg-transparent resize-none focus:ring-0 focus:outline-none"
                                value={formState.theme.customCss}
                                onChange={(e) => handleCustomCssChange(e.target.value)}
                                placeholder={defaultCssPlaceholder}
                              />
                            </ScrollArea>
                          </div>
                        </motion.div>
                      </div>

                      {/* Examples Tabs */}
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          Style Examples
                        </Label>
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic">Basic</TabsTrigger>
                            <TabsTrigger value="modern">Modern</TabsTrigger>
                            <TabsTrigger value="minimal">Minimal</TabsTrigger>
                            <TabsTrigger value="colors">Colors</TabsTrigger>
                          </TabsList>

                          {Object.entries(cssExamples).map(([key, example]) => (
                            <TabsContent key={key} value={key} className="mt-4">
                              <div className="space-y-3">
                                <div>
                                  <h4 className="font-medium text-sm">{example.title}</h4>
                                  <p className="text-xs text-muted-foreground">{example.description}</p>
                                </div>
                                <div className="relative">
                                  <div className="border border-border rounded-lg bg-muted/50 h-[200px]">
                                    <ScrollArea className="h-full">
                                      <div className="font-mono text-xs p-3 whitespace-pre-wrap">
                                        {example.css}
                                      </div>
                                    </ScrollArea>
                                  </div>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="default"
                                    className="absolute top-3 right-3 h-8 px-3 text-xs"
                                    onClick={() => {
                                      handleCustomCssChange(example.css);
                                    }}
                                  >
                                    Use This Style
                                  </Button>
                                </div>
                              </div>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold">Display Options</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="md:col-span-1 p-4 pt-0 space-y-4">
            <div
              className="flex items-center justify-between gap-2 group p-2 rounded-md transition-all duration-300 hover:bg-muted/50"
              onMouseEnter={() => setHighlightedElement("author")}
              onMouseLeave={() => setHighlightedElement(null)}
            >
              <div className="space-y-0.5">
                <Label htmlFor="show-author">Show Author</Label>
                <p className="text-sm text-muted-foreground">Display your name above the blog title</p>
              </div>
              <Switch
                id="show-author"
                checked={formState.metadata.showAuthor}
                onCheckedChange={(checked) => handleMetadataChange("showAuthor", checked)}
              />
            </div>

            <div
              className="flex items-center justify-between gap-2 group p-2 rounded-md transition-all duration-300 hover:bg-muted/50"
              onMouseEnter={() => setHighlightedElement("title")}
              onMouseLeave={() => setHighlightedElement(null)}
            >
              <div className="space-y-0.5">
                <Label htmlFor="show-title">Show Title</Label>
                <p className="text-sm text-muted-foreground">Display the blog title at the top of your page</p>
              </div>
              <Switch
                id="show-title"
                checked={formState.metadata.showTitle}
                onCheckedChange={(checked) => handleMetadataChange("showTitle", checked)}
              />
            </div>

            <div
              className="flex items-center justify-between gap-2 group p-2 rounded-md transition-all duration-300 hover:bg-muted/50"
              onMouseEnter={() => setHighlightedElement("tags")}
              onMouseLeave={() => setHighlightedElement(null)}
            >
              <div className="space-y-0.5">
                <Label htmlFor="show-tags">Show Tags</Label>
                <p className="text-sm text-muted-foreground">Display article tags below the blog title</p>
              </div>
              <Switch
                id="show-tags"
                checked={formState.metadata.showTags}
                onCheckedChange={(checked) => handleMetadataChange("showTags", checked)}
              />
            </div>
          </div>

          {/* Blog Preview */}
          <div className="md:col-span-1 h-64 border rounded-lg bg-card/50 overflow-hidden">
            {/* Browser Navigation Bar */}
            <div className="w-full">
              <div className="flex flex-col rounded-t-lg overflow-hidden border-b border-border/50 shadow-sm">
                {/* URL Bar */}
                <div className="bg-background px-3 py-1.5 flex items-center gap-2">
                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m15 18-6-6 6-6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="text-muted-foreground hover:text-foreground transition-colors w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="m9 18 6-6-6-6" />
                      </svg>
                    </button>
                  </div>

                  <div className="bg-muted/50 rounded-md px-2 py-1 text-xs w-full flex items-center overflow-hidden">
                    {/* <span className="text-muted-foreground mr-1 flex-shrink-0">https://</span> */}
                    <span className="text-foreground truncate">
                      {/* {getBaseUrl().replace(/^https?:\/\//, '').replace(/\/$/, '')}/b/ */}
                      fountain.ink/b/
                      {isUserBlog ? userHandle : formState.slug ? `${userHandle}/${formState.slug}` : blogAddress}
                    </span>
                  </div>

                  {/* Reload Button */}
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground transition-colors w-5 h-5 flex items-center justify-center rounded-full"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                      <path d="M21 3v5h-5" />
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                      <path d="M8 16H3v5" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center scale-[0.8] origin-top p-4 pb-2">
              {/* Author Preview */}
              <AnimatePresence>
                {formState.metadata.showAuthor && (
                  <motion.div
                    className="flex items-center gap-2 mb-2 w-full justify-center rounded-md"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 8 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`w-8 h-8 rounded-full transition-colors duration-300 ${highlightedElement === "author" ? "bg-primary/70" : "bg-muted"
                        }`}
                    />
                    <div
                      className={`h-4 w-24 rounded-md transition-colors duration-300 ${highlightedElement === "author" ? "bg-primary/70" : "bg-muted"
                        }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Title Preview */}
              <AnimatePresence>
                {formState.metadata.showTitle && (
                  <motion.div
                    className={`h-6 w-48 rounded-md mb-3 transition-colors duration-300 ${highlightedElement === "title" ? "bg-primary/70" : "bg-muted"
                      }`}
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: 24, marginBottom: 12 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence>
                {formState.metadata.showTags && (
                  <motion.div
                    className="flex gap-2 mb-4 flex-wrap justify-center rounded-md"
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div
                      className={`h-5 w-16 rounded-full transition-colors duration-300 ${highlightedElement === "tags" ? "bg-primary/70" : "bg-muted"
                        }`}
                    />
                    <div
                      className={`h-5 w-20 rounded-full transition-colors duration-300 ${highlightedElement === "tags" ? "bg-primary/70" : "bg-muted"
                        }`}
                    />
                    <div
                      className={`h-5 w-14 rounded-full transition-colors duration-300 ${highlightedElement === "tags" ? "bg-primary/70" : "bg-muted"
                        }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Posts Preview */}
              <div className="w-[70%] space-y-3">
                <div className="flex gap-3 w-full">
                  <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
                  <div className="h-12 flex-grow rounded-lg bg-muted" />
                </div>
                <div className="flex gap-3 w-full">
                  <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
                  <div className="h-12 flex-grow rounded-lg bg-muted" />
                </div>
                <div className="flex gap-3 w-full">
                  <div className="h-12 w-12 rounded-lg bg-muted flex-shrink-0" />
                  <div className="h-12 flex-grow rounded-lg bg-muted" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-start">
          <Button
            onClick={handleSave}
            disabled={!formState.isDirty || Object.values(formState.errors).some((error) => error !== null) || isSaving}
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
