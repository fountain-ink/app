import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TagInput } from "emblor";
import type { Tag } from "emblor";
import { FC, useCallback, useEffect, useState, useRef } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";
import { ImageIcon, PenIcon } from "lucide-react";

export const detailsFormSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title should be less than 100 characters"),
  subtitle: z.string().optional(),
  coverUrl: z.string().optional(),
  tags: z.array(z.string()).max(5, "You can add up to 5 tags").default([]),
});

export type DetailsFormValues = z.infer<typeof detailsFormSchema>;

interface ArticleDetailsTabProps {
  form: UseFormReturn<CombinedFormValues>;
  documentId?: string;
}

export const ArticleDetailsTab: FC<ArticleDetailsTabProps> = ({ form }) => {
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
              <FormItem className="max-w-lg">
                <FormLabel htmlFor="subtitle">Summary</FormLabel>
                <FormControl>
                  <Input id="subtitle" placeholder="Enter summary (optional)" {...field} value={field.value ?? ""} />
                </FormControl>
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
