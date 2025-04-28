import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "emblor";
import type { Tag } from "emblor";
import { FC, useCallback, useEffect, useState, useRef } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";
import { ImageIcon, PenIcon, LinkIcon, Check, AlertCircle } from "lucide-react";
import { checkSlugAvailability } from "@/lib/slug/check-slug-availability";
import { debounce } from "lodash";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getCookie } from "cookies-next";

export const detailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title should be less than 100 characters"),
  subtitle: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
  slug: z.string().optional()
    .refine(value => !value || /^[a-z0-9-]+$/.test(value), {
      message: "Slug must contain only lowercase letters, numbers, and hyphens"
    }),
  tags: z.array(z.string()).max(5, "You can add up to 5 tags").default([]),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

// Function to generate a slug from title and subtitle
const generateSlug = (title: string, subtitle: string = ""): string => {
  const combinedText = (title + " " + subtitle).trim();
  return combinedText
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

export const ArticleDetailsTab: FC<ArticleDetailsTabProps> = ({ form }) => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [isSlugManuallyEdited, setIsSlugManuallyEdited] = useState(false);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [isSlugAvailable, setIsSlugAvailable] = useState<boolean | null>(null);

  const { data: user } = useAuthenticatedUser();
  const title = form.watch("details.title");
  const subtitle = form.watch("details.subtitle");
  const slug = form.watch("details.slug");

  useEffect(() => {
    const formTags = form.getValues("details.tags") || [];
    if (JSON.stringify(tags.map((t) => t.text)) !== JSON.stringify(formTags)) {
      setTags(formTags.map((text: string) => ({ text, id: crypto.randomUUID() })));
    }
  }, [form.watch("details.tags")]);

  // Update slug when title or subtitle changes, unless manually edited
  useEffect(() => {
    if (!isSlugManuallyEdited && title) {
      const newSlug = generateSlug(title, subtitle || "");
      form.setValue("details.slug", newSlug, { shouldValidate: true });
    }
  }, [title, subtitle, isSlugManuallyEdited, form]);

  const checkSlugDebounced = useCallback(
    debounce(async (slug: string) => {
      if (!slug) {
        setIsSlugAvailable(null);
        return;
      }

      setIsCheckingSlug(true);
      try {
        const appToken = getCookie("appToken") as string;
        const claims = getTokenClaims(appToken)
        const handle = claims?.metadata?.username || '';
        const result = await checkSlugAvailability(slug, handle);
        setIsSlugAvailable(result.available);
      } catch (error) {
        console.error("Failed to check slug availability:", error);
        setIsSlugAvailable(null);
      } finally {
        setIsCheckingSlug(false);
      }
    }, 500),
    [slug]
  );

  // Check slug availability when slug changes
  useEffect(() => {
    if (slug) {
      checkSlugDebounced(slug);
    } else {
      setIsSlugAvailable(null);
    }

    return () => {
      checkSlugDebounced.cancel();
    };
  }, [slug, checkSlugDebounced]);

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
    setIsSlugManuallyEdited(true);
    form.setValue("details.slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
      { shouldValidate: true });
  };

  return (
    <div className="space-y-6 p-2 pl-0 pr-4">
      <div className="space-y-2">
        <div className="border border-border flex shrink flex-col gap-4 rounded-sm p-4">
          <div className="pb-2">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
              <h3 className="font-medium">Preview</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              You can change how the post will be shown on social media and your blog index. This will not affect post's
              original title or subtitle.
            </p>
          </div>
          <div className="space-y-2 max-w-lg">
            <Label>Image</Label>
            {form.watch("details.coverUrl") ? (
              <div className="relative w-full rounded-sm overflow-hidden border border-border">
                <img src={form.watch("details.coverUrl") ?? undefined} alt="Cover" className="w-full h-auto object-cover" />
              </div>
            ) : (
              <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
                <div className="placeholder-background rounded-sm" />
              </div>
            )}
          </div>

          <FormField
            control={form.control}
            name="details.title"
            render={({ field, fieldState }) => (
              <FormItem className="max-w-sm">
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
              <FormItem className="max-w-lg">
                <FormLabel htmlFor="subtitle">Subtitle</FormLabel>
                <FormControl>
                  <Input id="subtitle" placeholder="Enter subtitle (optional)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="details.slug"
            render={({ field, fieldState }) => (
              <FormItem className="max-w-lg">
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
                  {isSlugAvailable === false ?
                    "This slug is already taken for your account. Please choose another one." :
                    "The slug is used in the URL of your post. Only lowercase letters, numbers, and hyphens are allowed."}
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
                <FormLabel>Tags</FormLabel>
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
        </div>
      </div>
    </div>
  );
};
