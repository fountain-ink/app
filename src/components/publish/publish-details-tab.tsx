import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { TagInput } from "emblor";
import type { Tag } from "emblor";
import { Checkbox } from "@/components/ui/checkbox";
import { BlogSelectMenu } from "@/components/blog/blog-select-menu";
import { FC, useCallback, useEffect, useState, useRef, useMemo } from "react";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { Draft } from "../draft/draft";
import { extractMetadata } from "@/lib/extract-metadata";

interface ArticleDetailsTabProps {
  isPublishing: boolean;
  handlePublish: () => void;
  documentId?: string;
}


export const ArticleDetailsTab: FC<ArticleDetailsTabProps> = ({
  isPublishing,
  handlePublish,
  documentId
}) => {
  const { getDraft, updateDraft } = usePublishDraft(documentId);
  const { getBlogs, blogState } = useBlogStorage();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [selectedBlogAddress, setSelectedBlogAddress] = useState<string | null>(null);
  const [sendNewsletter, setSendNewsletter] = useState(true);

  const prevTitle = useRef(title);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (prevTitle.current !== title) {
      prevTitle.current = title;
    }
  }, [title]);

  useEffect(() => {
    if (initializedRef.current) return;

    const draft = getDraft();
    if (draft) {
      initializedRef.current = true;
      if (!draft.title || !draft.subtitle || !draft.coverUrl) {
        const { title, subtitle, coverUrl } = extractMetadata(draft?.contentJson as any);
        setTitle(title);
        setSubtitle(subtitle);
        setCoverUrl(coverUrl || "");
      } else {
        setTitle(draft.title || "");
        setSubtitle(draft.subtitle || "");
        setCoverUrl(draft.coverUrl || "");
      }

      setTags((draft.tags || []).map((text) => ({ text, id: crypto.randomUUID() })));

      if (draft.blog?.address) {
        setSelectedBlogAddress(draft.blog.address);
      }

      setSendNewsletter(draft.publishingSettings?.sendNewsletter ?? true);
    }
  }, [getDraft]);

  const validateTitle = useCallback((title: string | null) => {
    if (!title || title.trim() === "") {
      return "Title is required";
    }
    if (title.length > 100) {
      return "Title should be less than 100 characters";
    }
    return null;
  }, []);

  useEffect(() => {
    const error = validateTitle(title);
    setTitleError(error);
  }, [title, validateTitle]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    updateDraft({ title: newTitle });
  }, [title, updateDraft]);

  const handleSubtitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubtitle = e.target.value;
    setSubtitle(newSubtitle);
    updateDraft({ subtitle: newSubtitle });
  }, [subtitle, updateDraft]);

  const handleTagsChange = useCallback(
    (newTags: Tag[]) => {
      setTags(newTags);
      updateDraft({ tags: newTags.map((t) => t.text) });
    },
    [updateDraft]
  );

  const handleSetTags = useCallback(
    (newTags: Tag[] | ((prev: Tag[]) => Tag[])) => {
      const resolvedTags = typeof newTags === "function" ? newTags(tags) : newTags;
      handleTagsChange(resolvedTags);
    },
    [handleTagsChange, tags]
  );

  const handleBlogChange = useCallback((value: string) => {
    setSelectedBlogAddress(value);
    const selectedBlog = blogState.blogs.find(b => b?.address === value);
    if (selectedBlog) {
      updateDraft({ blog: selectedBlog });
    }
  }, [selectedBlogAddress, blogState.blogs, updateDraft]);

  const handleNewsletterChange = useCallback((checked: boolean) => {
    setSendNewsletter(checked);
    const draft = getDraft();
    if (draft) {
      draft.publishingSettings = {
        ...(draft.publishingSettings || {}),
        sendNewsletter: checked,
      };
      updateDraft(draft);
    }
  }, [sendNewsletter, getDraft, updateDraft]);

  const selectedBlog = useMemo(() =>
    blogState.blogs.find(blog => blog?.address === selectedBlogAddress) || null,
    [blogState.blogs, selectedBlogAddress]
  );

  const blogSelectMenuProps = useMemo(() => ({
    selectedBlogAddress,
    onBlogChange: handleBlogChange,
    placeholder: "Select a blog to publish to",
    className: "max-w-sm mt-1"
  }), [selectedBlogAddress, handleBlogChange]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0 overflow-auto pr-2">
        <div className="space-y-6 p-2">
          <div className="space-y-2">
            <div className="pb-2">
              <h3 className="font-medium">Preview</h3>
              <p className="text-sm text-muted-foreground">
                You can change how the post will be shown on social media and your blog index.
              </p>
            </div>
            <div className="border border-border flex shrink flex-col gap-4 rounded-sm p-4">
              <div className="space-y-2 max-w-sm">
                <Label>Image</Label>
                {coverUrl ? (
                  <div className="relative w-full rounded-sm overflow-hidden border border-border">
                    <img src={coverUrl} alt="Cover" className="w-full h-auto object-cover" />
                  </div>
                ) : (
                  <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
                    <div className="placeholder-background rounded-sm" />
                  </div>
                )}
              </div>
              <div className="max-w-sm">
                <Label htmlFor="title">Title</Label>
                <div className="space-y-1">
                  <Input
                    id="title"
                    placeholder="Enter title"
                    value={title}
                    onChange={handleTitleChange}
                    className={titleError ? "border-destructive" : ""}
                  />
                  {titleError && <span className="text-sm text-destructive">{titleError}</span>}
                </div>
              </div>
              <div className="max-w-sm">
                <Label htmlFor="subtitle">Summary</Label>
                <Input
                  id="subtitle"
                  placeholder="Enter summary (optional)"
                  value={subtitle}
                  onChange={handleSubtitleChange}
                />
              </div>
            </div>
          </div>

          <div className="">
            <Label>Publish in</Label>
            <BlogSelectMenu {...blogSelectMenuProps} />
            {selectedBlog?.mail_list_id && (
              <div className="flex flex-col space-y-1 mt-4 ml-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendNewsletter"
                    checked={sendNewsletter}
                    onCheckedChange={(checked) => {
                      handleNewsletterChange(checked as boolean);
                    }}
                  />
                  <label
                    htmlFor="sendNewsletter"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Send out newsletter to subscribers
                  </label>
                </div>
                <p className="text-xs text-muted-foreground pl-6">
                  Subscribers will receive this post in their inbox.
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2 max-w-full min-w-sm w-fit">
            <Label>Tags</Label>
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
            />
          </div>
        </div>
      </ScrollArea>
      <div className="flex items-center p-2 ">
        <Button onClick={handlePublish} disabled={!!titleError || isPublishing}>
          {isPublishing ? "Publishing..." : "Publish"}
        </Button>
      </div>
    </div>
  );
}; 