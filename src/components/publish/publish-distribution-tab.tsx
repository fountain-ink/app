import { z } from "zod";
import { UseFormReturn } from "react-hook-form";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogSelectMenu } from "@/components/blog/blog-select-menu";
import { FC, useMemo } from "react";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { CombinedFormValues } from "./publish-dialog";
import { SendIcon, RssIcon, LayoutIcon, ClubIcon } from "lucide-react";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePublishDraft } from "@/hooks/use-publish-draft";
import { LensLineLogo } from "../icons/custom-icons";

export const distributionFormSchema = z.object({
  selectedBlogAddress: z.string().optional(),
  sendNewsletter: z.boolean().default(true),
  lensDisplay: z.enum(["link", "title_link", "content_link", "content_only"]).default("title_link"),
});

export type DistributionFormValues = z.infer<typeof distributionFormSchema>;

interface DistributionTabProps {
  form: UseFormReturn<CombinedFormValues>;
  documentId?: string;
}

interface LensPreviewProps {
  lensDisplay: string;
  title: string;
  documentId?: string;
}

const LensPreview: FC<LensPreviewProps> = ({ lensDisplay, title, documentId }) => {
  const { getDraft } = usePublishDraft(documentId);
  const draft = getDraft();

  const subtitle = draft?.subtitle || "";
  const coverUrl = draft?.coverUrl;

  const ContentSkeleton = () => (
    <div className="space-y-2">
      <div className="h-4 bg-muted rounded w-[90%]"></div>
      <div className="h-4 bg-muted rounded w-[72%]"></div>
      <div className="h-4 bg-muted rounded w-[86%]"></div>
    </div>
  );

  const OgPreview = () => (
    <div className="mt-3 border border-border rounded-md overflow-hidden max-w-md select-none text-muted-foreground">
      {coverUrl ? (
        <div className="h-36 w-full bg-muted overflow-hidden">
          <img
            src={coverUrl}
            alt="Post cover"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="bg-muted h-36 w-full"></div>
      )}
      <div className="p-3 space-y-2">
        <div className="font-medium text-xs truncate">{title || "Your post title"}</div>
        {subtitle ? (
          <div className="text-xs truncate">{subtitle}</div>
        ) : (
          <div className="h-3 bg-muted/50 rounded w-2/3"></div>
        )}
        <div className="flex items-center gap-1 mt-1">
          <img
            src="/favicon.ico"
            alt="Fountain"
            className="w-3 h-3"
          />
          <div className="text-xs">fountain.ink</div>
        </div>
      </div>
    </div>
  );

  const username = draft?.author?.split(':')[2] || "username";
  const slug = draft?.slug || "example-post";
  const baseUrl = 'https://fountain.ink/';
  const postUrl = `${baseUrl}p/${username}/${slug}`;

  // Dimmer link style
  const LinkStyle = "text-blue-500/70 select-none";

  switch (lensDisplay) {
    case 'link':
      return (
        <div className="select-none text-muted-foreground">
          <a href="#" className={LinkStyle}>{postUrl}</a>
          <OgPreview />
        </div>
      );

    case 'title_link':
      return (
        <div className="select-none text-muted-foreground">
          <div className="line-clamp-1 text-foreground">
            <span className="text-foreground">{title}</span> - <span className={LinkStyle}>{postUrl}</span>
          </div>
          <OgPreview />
        </div>
      );

    case 'content_link':
      return (
        <div className="select-none text-muted-foreground">
          <em className="line-clamp-1 text-foreground">Posted on Fountain - <span className={LinkStyle}>{postUrl}</span></em>

          {title && (
            <div className="font-semibold text-base mt-3 mb-1 text-foreground">{title}</div>
          )}

          {subtitle && (
            <div className="text-sm mb-3">{subtitle}</div>
          )}

          <div className="mt-2">
            <ContentSkeleton />
          </div>
          <OgPreview />
        </div>
      );

    case 'content_only':
    default:
      return (
        <div className="select-none text-muted-foreground">
          {title && (
            <div className="font-semibold text-lg mb-1 text-foreground">{title}</div>
          )}
          {subtitle && (
            <div className="text-sm mb-3">{subtitle}</div>
          )}
          <ContentSkeleton />
        </div>
      );
  }
};

export const DistributionTab: FC<DistributionTabProps> = ({ form, documentId }) => {
  const { blogState } = useBlogStorage();

  const selectedBlogAddress = form.watch("distribution.selectedBlogAddress");
  const lensDisplay = form.watch("distribution.lensDisplay");
  const title = form.watch("details.title") || "Example Title";

  const selectedBlog = useMemo(
    () => blogState.blogs.find((blog) => blog?.address === selectedBlogAddress) || null,
    [blogState.blogs, selectedBlogAddress],
  );

  return (
    <div className="space-y-6 p-2 pl-0 pr-4">
      <div className="border border-border flex shrink flex-col gap-2 rounded-sm p-4">
        <div>
          <div className="flex items-center gap-2">
            <SendIcon className="w-4 h-4 text-muted-foreground" />
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
                  className={`max-w-md mt-1 ${fieldState.error ? "border-destructive ring-1 ring-destructive" : ""}`}
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

      <div className="border border-border flex shrink flex-col gap-2 rounded-sm p-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 text-muted-foreground">
              <LensLineLogo />
            </div>
            <h3 className="font-medium">Lens</h3>
          </div>
          <p className="text-sm text-muted-foreground">Choose how your post is displayed on other apps.</p>
        </div>
        <FormField
          control={form.control}
          name="distribution.lensDisplay"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display option</FormLabel>
              <Select
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="max-w-md">
                    <SelectValue placeholder="How to display your post" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="z-[52]">
                  {/* <SelectItem value="link">Link only</SelectItem> */}
                  <SelectItem value="title_link">Title and link (recommended)</SelectItem>
                  <SelectItem value="content_link">Content and link</SelectItem>
                  <SelectItem value="content_only">Content only</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4 space-y-2">
                <div>
                  <div className="text-sm font-medium mt-0">Preview</div>
                  {/* <FormDescription>
                    How your post might look like
                  </FormDescription> */}
                </div>
                <div className="text-sm max-w-md bg-background p-3 rounded-md border border-border">
                  <LensPreview
                    lensDisplay={lensDisplay}
                    title={title}
                    documentId={documentId}
                  />
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}; 