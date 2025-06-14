import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "emblor";
import type { Tag } from "emblor";
import { FC, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";
import {
  ImageIcon,
  PenIcon,
  AlertCircle,
  PenOffIcon,
  ScrollText,
  Heart,
  MessageCircle,
  MoreHorizontalIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  CalendarIcon,
  XIcon,
} from "lucide-react";
import { checkSlugAvailability } from "@/lib/slug/check-slug-availability";
import { debounce } from "lodash";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getCookie } from "cookies-next";
import { Button } from "@/components/ui/button";
import { CoinIcon } from "@/components/icons/custom-icons";
import { usePublishDraft } from "@/hooks/use-publish-draft";
import { ImageUploader } from "@/components/misc/image-uploader";
import { uploadFile } from "@/lib/upload/upload-file";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger, PopoverPortal } from "@/components/ui/popover";
import { format } from "date-fns";

export const detailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title should be less than 100 characters"),
  subtitle: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  slug: z
    .string()
    .optional()
    .refine((value) => !value || /^[a-z0-9-]+$/.test(value), {
      message: "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
  tags: z.array(z.string()).max(5, "You can add up to 5 tags").default([]),
  images: z.array(z.string()).default([]),
  isSlugManuallyEdited: z.boolean().optional().default(false),
  originalDate: z.date().optional().nullable(),
  isMiscSectionExpanded: z.boolean().optional().default(false),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

const generateSlug = (title: string, subtitle = ""): string => {
  const combinedText = `${title} ${subtitle}`.trim();
  const words = combinedText.split(/\s+/);
  const limitedWords = words.slice(0, 10);
  const limitedText = limitedWords.join(" ");

  return limitedText
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "") // Remove non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ""); // Trim hyphens from start and end
};

interface ArticleDetailsTabProps {
  form: UseFormReturn<CombinedFormValues>;
  documentId?: string;
}

export const ArticleDetailsTab: FC<ArticleDetailsTabProps> = ({ form, documentId }) => {
  const { getDraft } = usePublishDraft(documentId || "");
  const title = form.watch("details.title");
  const subtitle = form.watch("details.subtitle");
  const slug = form.watch("details.slug");
  const coverUrl = form.getValues("details.coverUrl");
  const images = form.watch("details.images");
  const watchedIsSlugManuallyEdited = form.watch("details.isSlugManuallyEdited");
  const draft = getDraft();
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);
  const [isEditingPreview, setIsEditingPreview] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(images.findIndex((image) => image === coverUrl) || 0);
  const isShowingUploader = currentImageIndex === images.length;
  const isMiscExpanded = form.watch("details.isMiscSectionExpanded");

  useEffect(() => {
    const draftImages = draft?.images || [];
    const currentImages = form.getValues("details.images") || [];

    if (JSON.stringify(draftImages) === JSON.stringify(currentImages)) {
      return;
    }

    if (!draftImages.length) {
      form.setValue("details.images", [], { shouldValidate: true });
      setCurrentImageIndex(0);
      if (form.getValues("details.coverUrl") !== null) {
        form.setValue("details.coverUrl", null, { shouldValidate: true });
      }
    } else {
      const uniqueImages = [...currentImages];

      draftImages.forEach((img) => {
        if (!uniqueImages.includes(img)) {
          uniqueImages.push(img);
        }
      });

      form.setValue("details.images", uniqueImages, { shouldValidate: true });
    }
  }, [draft?.images]);

  const handlePrevImage = () => {
    const totalCount = images.length + 1;
    if (totalCount <= 1) return;

    const newIndex = (currentImageIndex - 1 + totalCount) % totalCount;
    setCurrentImageIndex(newIndex);

    if (newIndex === images.length) {
      form.setValue("details.coverUrl", null, { shouldValidate: true });
    } else {
      form.setValue("details.coverUrl", images[newIndex], { shouldValidate: true });
    }
  };

  const handleNextImage = () => {
    const totalCount = images.length + 1;
    if (totalCount <= 1) return;

    const newIndex = (currentImageIndex + 1) % totalCount;
    setCurrentImageIndex(newIndex);

    if (newIndex === images.length) {
      form.setValue("details.coverUrl", null, { shouldValidate: true });
    } else {
      form.setValue("details.coverUrl", images[newIndex], { shouldValidate: true });
    }
  };

  const handleNewCoverImage = async (file: File | null) => {
    if (file) {
      setIsUploading(true);

      const uploadUrl = await uploadFile(file);
      const updatedImages = [...form.getValues("details.images"), uploadUrl];
      form.setValue("details.images", updatedImages, { shouldValidate: true });
      form.setValue("details.coverUrl", uploadUrl, { shouldValidate: true });

      setCurrentImageIndex(updatedImages.length - 1);
      setIsUploading(false);
    }
  };

  const slugCheckRunner = useCallback(
    async (slugToValidate: string) => {
      if (!slugToValidate) {
        setIsSlugAvailable(null);
        return;
      }
      setIsCheckingSlug(true);
      try {
        const appToken = getCookie("appToken") as string;
        const claims = getTokenClaims(appToken);
        const handle = claims?.metadata?.username || "";
        const result = await checkSlugAvailability(slugToValidate, handle);
        setIsSlugAvailable(result.available);
      } catch (error) {
        console.error("Failed to check slug availability:", error);
        setIsSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    },
    [setIsSlugAvailable, setIsCheckingSlug],
  );

  const checkSlugDebounced = useMemo(() => debounce(slugCheckRunner, 500), [slugCheckRunner]);

  useEffect(() => {
    if (typeof slug === "string") {
      checkSlugDebounced(slug);
    } else {
      setIsSlugAvailable(null);
      checkSlugDebounced.cancel();
    }

    return () => {
      checkSlugDebounced.cancel();
    };
  }, [slug, checkSlugDebounced, setIsSlugAvailable]);

  useEffect(() => {
    if (!watchedIsSlugManuallyEdited && title) {
      const newSlug = generateSlug(title, subtitle || "");
      if (slug !== newSlug) {
        form.setValue("details.slug", newSlug, { shouldValidate: true });
      }
    }
  }, [title, subtitle, watchedIsSlugManuallyEdited, slug, form]);

  useEffect(() => {
    const formTags = form.getValues("details.tags") || [];
    if (JSON.stringify(tags.map((t) => t.text)) !== JSON.stringify(formTags)) {
      setTags(formTags.map((text: string) => ({ text, id: crypto.randomUUID() })));
    }
  }, [form.watch("details.tags"), tags, form]);

  const handleSetTags = useCallback(
    (newTags: Tag[] | ((prev: Tag[]) => Tag[])) => {
      const resolvedTags = typeof newTags === "function" ? newTags(tags) : newTags;
      setTags(resolvedTags);
      form.setValue(
        "details.tags",
        resolvedTags.map((t) => t.text),
        { shouldValidate: true, shouldDirty: true },
      );
    },
    [form, tags],
  );

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("details.isSlugManuallyEdited", true, { shouldDirty: true });
    form.setValue("details.slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""), { shouldValidate: true });
  };

  return (
    <div className="space-y-6 p-2 pl-0 pr-4">
      <div className="space-y-4">
        <div className="border border-border flex shrink flex-col gap-4 rounded-sm p-4">
          <div className="pb-0 flex items-center justify-between h-[24px]">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Preview</h3>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              icon={isEditingPreview ? <PenOffIcon className="w-4 h-4" /> : <PenIcon className="w-4 h-4" />}
              label={isEditingPreview ? "Cancel editing preview" : "Edit preview"}
              onClick={() => setIsEditingPreview((prev) => !prev)}
            />
          </div>
          {isEditingPreview ? (
            <div className="flex flex-row items-start gap-4 sm:gap-8">
              <div className="h-40 w-40 relative shrink-0 aspect-square rounded-sm overflow-hidden">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageUploader
                    label=""
                    onImageChange={handleNewCoverImage}
                    initialImage={null}
                    className="h-full"
                    isUploading={isUploading}
                  />
                )}

                {(images.length > 0 || isShowingUploader) && (
                  <>
                    <Button
                      className="absolute left-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/70 p-1 ml-1 rounded-full"
                      variant="ghost"
                      size="icon"
                      onClick={handlePrevImage}
                    >
                      <ChevronLeft className="h-5 w-5 text-white" />
                    </Button>
                    <Button
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-transparent hover:bg-black/70 p-1 mr-1 rounded-full"
                      variant="ghost"
                      size="icon"
                      onClick={handleNextImage}
                    >
                      <ChevronRight className="h-5 w-5 text-white" />
                    </Button>
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 text-white text-xs bg-black/50 px-2 py-0.5 rounded-full">
                      {`${currentImageIndex + 1}/${images.length + 1}`}
                    </div>
                  </>
                )}
              </div>
              <div className="flex flex-col w-full gap-4">
                <FormField
                  control={form.control}
                  name="details.title"
                  render={({ field, fieldState }) => (
                    <FormItem className="max-w-full">
                      <FormLabel htmlFor="title">Title</FormLabel>
                      <FormControl>
                        <Input
                          id="title"
                          placeholder="Enter title"
                          {...field}
                          className={fieldState.error ? "border-destructive" : ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="details.subtitle"
                  render={({ field }) => (
                    <FormItem className="max-w-full">
                      <FormLabel htmlFor="subtitle">Subtitle</FormLabel>
                      <FormControl>
                        <Input
                          id="subtitle"
                          placeholder="Enter subtitle (optional)"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-row items-start gap-4 sm:gap-8">
              <div className="h-40 w-40 relative shrink-0 aspect-square rounded-sm overflow-hidden">
                {coverUrl ? (
                  <img src={coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <ImageUploader
                    label=""
                    onImageChange={handleNewCoverImage}
                    initialImage={null}
                    className="h-full"
                    isUploading={isUploading}
                  />
                )}
              </div>
              <div className="flex flex-col h-full min-h-[150px] gap-1">
                <h2 className="text-[1.75rem] font-[family-name:var(--title-font)] line-clamp-2 tracking-[-0.8px] font-medium">
                  {title || "Untitled"}
                </h2>
                {form.formState.errors.details?.title && (
                  <p className="text-sm text-destructive">{form.formState.errors.details.title.message}</p>
                )}
                {subtitle && (
                  <p className="text-lg font-[family-name:--subtitle-font] max-w-[500px] line-clamp-2 text-foreground/60">
                    {subtitle}
                  </p>
                )}
                <div className="flex flex-row items-center gap-3 mt-auto pt-2">
                  <div className="flex flex-row justify-between min-w-[400px] w-full items-center text-muted-foreground">
                    <div className="flex flex-row  gap-4 sm:gap-8 items-center">
                      <div className="flex items-center gap-1 cursor-default select-none">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 cursor-default select-none">
                        <CoinIcon className="w-5 h-5" />
                      </div>
                      <div className="flex items-center gap-1 cursor-default select-none">
                        <Heart className="w-5 h-5" />
                      </div>
                    </div>

                    <div className="flex items-center gap-1 cursor-default select-none">
                      <MoreHorizontalIcon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Change how the post will be shown on social media and your blog index. This does not affect post's original
            title or subtitle.
          </p>
        </div>

        <div className="border border-border flex shrink flex-col gap-4 min-h-0 h-fit rounded-sm p-4">
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => form.setValue("details.isMiscSectionExpanded", !isMiscExpanded, { shouldDirty: true })}
          >
            <div className="flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Misc</h3>
            </div>
            <motion.div animate={{ rotate: isMiscExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </motion.div>
          </div>

          {!isMiscExpanded && (
            <p className="text-sm text-muted-foreground">Configure post slug, tags, and other article settings</p>
          )}

          <motion.div
            initial={isMiscExpanded ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
            animate={{
              height: isMiscExpanded ? "auto" : 0,
              opacity: isMiscExpanded ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className={cn("overflow-hidden flex flex-col gap-4", !isMiscExpanded && "-mt-4")}
          >
            <FormField
              control={form.control}
              name="details.slug"
              render={({ field, fieldState }) => (
                <FormItem className="max-w-md">
                  <FormLabel htmlFor="slug" className="flex items-center gap-1">
                    <span>Post slug</span>
                  </FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        id="slug"
                        placeholder="generated-from-title"
                        {...field}
                        onChange={handleSlugChange}
                        value={field.value ?? ""}
                        className={`${fieldState.error ? "border-destructive" : ""} ${isSlugAvailable === false ? "pr-10 border-destructive" : ""}`}
                      />
                    </FormControl>
                    {isCheckingSlug && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="animate-spin h-4 w-4 border-2 border-primary/20 border-t-primary rounded-full" />
                      </div>
                    )}
                    {!isCheckingSlug && isSlugAvailable === false && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-destructive">
                        <AlertCircle className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <FormDescription>
                    {isSlugAvailable === false
                      ? "This slug is already taken for your account. Please choose another one."
                      : "The slug is used in the URL of your post."}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details.tags"
              render={({ field, fieldState }) => (
                <FormItem className="space-y-2 max-w-full min-w-sm w-fit">
                  <FormLabel htmlFor="tags" className="flex items-center gap-1">
                    <span>Tags</span>
                  </FormLabel>
                  <FormControl>
                    <TagInput
                      maxTags={5}
                      styleClasses={{
                        input: "shadow-none w-[200px] h-6",
                        tag: {
                          body: "border border-secondary",
                        },
                      }}
                      placeholder="Add a tag"
                      tags={tags}
                      setTags={handleSetTags}
                      activeTagIndex={activeTagIndex}
                      setActiveTagIndex={setActiveTagIndex}
                      variant="outline"
                      className={fieldState.error ? "border-destructive ring-1 ring-destructive" : ""}
                    />
                  </FormControl>
                  <FormDescription>Add up to 5 tags that will be used to categorize the post.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="details.originalDate"
              render={({ field }) => (
                <FormItem className="flex flex-col max-w-md">
                  <FormLabel htmlFor="originalDate" className="flex items-center gap-1">
                    <span>Original Date</span>
                  </FormLabel>
                  <div className="grid gap-2">
                    <Popover>
                      <div className="relative flex flex-row items-center gap-2">
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left max-w-xs font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        {field.value && (
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => {
                              field.onChange(null);
                              form.setValue("details.originalDate", null);
                            }}
                          >
                            <XIcon className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <PopoverContent align="start" className="w-auto z-[60] p-0">
                        <Calendar
                          mode="single"
                          selected={field.value || undefined}
                          fixedWeeks
                          showWeekNumber={false}
                          onSelect={(date) => {
                            field.onChange(date);
                            if (date) form.setValue("details.originalDate", date);
                          }}
                          disabled={(date) => date > new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <FormDescription>Set an original publication date for this post.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </div>
      </div>
    </div>
  );
};
