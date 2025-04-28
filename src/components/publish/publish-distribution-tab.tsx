import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogSelectMenu } from "@/components/blog/blog-select-menu";
import { FC, useMemo } from "react";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";
import { SendIcon, RssIcon } from "lucide-react";
import Link from "next/link";

export const distributionFormSchema = z.object({
  selectedBlogAddress: z.string().optional(),
  sendNewsletter: z.boolean().default(true),
});

export type DistributionFormValues = z.infer<typeof distributionFormSchema>;

interface DistributionTabProps {
  form: UseFormReturn<CombinedFormValues>;
  documentId?: string;
}

export const DistributionTab: FC<DistributionTabProps> = ({ form }) => {
  const { blogState } = useBlogStorage();

  const selectedBlogAddress = form.watch("distribution.selectedBlogAddress");

  const selectedBlog = useMemo(
    () => blogState.blogs.find((blog) => blog?.address === selectedBlogAddress) || null,
    [blogState.blogs, selectedBlogAddress],
  );

  return (
    <div className="space-y-6 p-2 pl-0 pr-4">
      <div className="border border-border flex shrink flex-col gap-2 rounded-sm p-4">
        <div>
          <div className="flex items-center gap-2">
            <RssIcon className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-medium">Delivery</h3>
          </div>
          <p className="text-sm text-muted-foreground">Choose where the post will be published.</p>
        </div>
        <FormField
          control={form.control}
          name="distribution.selectedBlogAddress"
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
                      form.setValue("distribution.sendNewsletter", false);
                    } else {
                      form.setValue("distribution.sendNewsletter", true);
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

        <FormField
          control={form.control}
          name="distribution.sendNewsletter"
          render={({ field }) => (
            <FormItem className="flex flex-col space-y-1 mt-4">
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Checkbox
                    id="sendNewsletter"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={true}
                  // disabled={!selectedBlog?.mail_list_id}
                  />
                </FormControl>
                <label
                  htmlFor="sendNewsletter"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Send out newsletter to subscribers
                </label>
              </div>
              <FormDescription className="pl-6">
                Newsletter delivery is coming soon.
                {/* {selectedBlog?.mail_list_id ? (
                  "Subscribers will receive this post in their inbox."
                ) : (
                  <>
                    <span>This blog doesn't have a newsletter.</span>
                    <Link
                      href={"/settings/newsletter"}
                      className="text-muted-foreground pl-1 hover:text-primary underline"
                    >
                      Newsletter settings
                    </Link>
                    .
                  </>
                )} */}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}; 