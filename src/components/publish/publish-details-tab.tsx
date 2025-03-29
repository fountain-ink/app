import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "emblor";
import type { Tag } from "emblor";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogSelectMenu } from "@/components/blog/blog-select-menu";
import { FC, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";

export const detailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title should be less than 100 characters"),
  subtitle: z.string().optional(),
  coverUrl: z.string().optional(),
  tags: z.array(z.string()).max(5, "You can add up to 5 tags").default([]),
  selectedBlogAddress: z.string().min(1, "Please select a blog to publish to"),
  sendNewsletter: z.boolean().default(true),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

interface ArticleDetailsTabProps {
  form: UseFormReturn<CombinedFormValues>;
  documentId?: string;
}

export const ArticleDetailsTab: FC<ArticleDetailsTabProps> = ({ form }) => {
  const { blogState } = useBlogStorage();
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);

  useEffect(() => {
    const formTags = form.getValues("details.tags") || [];
    if (JSON.stringify(tags.map((t) => t.text)) !== JSON.stringify(formTags)) {
      setTags(formTags.map((text: string) => ({ text, id: crypto.randomUUID() })));
    }
  }, [form.watch("details.tags")]);

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

  const selectedBlogAddress = form.watch("details.selectedBlogAddress");

  const selectedBlog = useMemo(
    () => blogState.blogs.find((blog) => blog?.address === selectedBlogAddress) || null,
    [blogState.blogs, selectedBlogAddress],
  );

  return (
    <div className="space-y-6 p-1 pr-3">
      <div className="space-y-2">
        <div className="pb-2">
          <h3 className="font-medium">Preview</h3>
          <p className="text-sm text-muted-foreground">
            You can change how the post will be shown on social media and your blog index.
          </p>
        </div>
        <div className="border border-border flex shrink flex-col gap-4 rounded-sm p-4">
          <div className="space-y-2 max-w-lg">
            <Label>Image</Label>
            {form.watch("details.coverUrl") ? (
              <div className="relative w-full rounded-sm overflow-hidden border border-border">
                <img src={form.watch("details.coverUrl")} alt="Cover" className="w-full h-auto object-cover" />
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
              <FormItem className="max-w-sm">
                <FormLabel htmlFor="subtitle">Summary</FormLabel>
                <FormControl>
                  <Input id="subtitle" placeholder="Enter summary (optional)" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>

      <FormField
        control={form.control}
        name="details.selectedBlogAddress"
        render={({ field, fieldState }) => (
          <FormItem>
            <FormLabel>Publish in</FormLabel>
            <FormControl>
              <BlogSelectMenu
                selectedBlogAddress={field.value}
                onBlogChange={(value) => {
                  field.onChange(value);
                  const newSelectedBlog = blogState.blogs.find((b) => b?.address === value);
                  if (!newSelectedBlog?.mail_list_id) {
                    form.setValue("details.sendNewsletter", false);
                  } else {
                    form.setValue("details.sendNewsletter", true);
                  }
                }}
                placeholder="Select a blog to publish to"
                className={`max-w-sm mt-1 ${fieldState.error ? "border-destructive ring-1 ring-destructive" : ""}`}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {selectedBlog?.mail_list_id && (
        <FormField
          control={form.control}
          name="details.sendNewsletter"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1 mt-4 ml-4">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox id="sendNewsletter" checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <label
                  htmlFor="sendNewsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send out newsletter to subscribers
                </label>
              </div>
              <FormDescription className="pl-6">Subscribers will receive this post in their inbox.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

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
  );
};
