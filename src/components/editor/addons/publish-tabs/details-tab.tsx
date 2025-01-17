import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { findNode } from "@udecode/plate-common";
import { useEditorState } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ImagePlugin } from "@udecode/plate-media/react";
import type { TElement, TText } from "@udecode/slate";
import { type Tag, TagInput } from "emblor";
import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { PublishButton } from "../editor-publish-button";
import type { Draft } from "@/components/draft/draft";

const ImagePlaceholder = () => (
  <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
    <div className="placeholder-background rounded-sm" />
  </div>
);

export const DetailsTab = () => {
  const editor = useEditorState();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const pathname = usePathname();
  const documentId = pathname.split("/").at(-1);
  const { getDocument, saveDocument } = useDocumentStorage();

  useEffect(() => {
    const error = validateTitle(title);
    setTitleError(error);
  }, [title]);

  const validateTitle = (value: string) => {
    if (!value.trim()) {
      return "Title is required";
    }
    if (value.length > 100) {
      return "Title must be less than 100 characters";
    }
    return null;
  };

  // Load initial state from draft
  useEffect(() => {
    if (!documentId) return;
    
    const draft = getDocument(documentId);
    if (draft) {
      setTitle(draft.title || "");
      setSubtitle(draft.subtitle || "");
      setCoverUrl(draft.coverImage || "");
      setTags((draft.tags || []).map((text: string) => ({ text, id: crypto.randomUUID() })));
    }
  }, [documentId, getDocument]);

  // Save changes back to draft
  const saveDraft = useCallback((updates: Partial<Draft>) => {
    if (!documentId) return;
    
    const draft = getDocument(documentId);
    if (draft) {
      saveDocument(documentId, {
        ...draft,
        ...updates
      });
    }
  }, [documentId, getDocument, saveDocument]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveDraft({ title: newTitle });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubtitle = e.target.value;
    setSubtitle(newSubtitle);
    saveDraft({ subtitle: newSubtitle });
  };

  const handleTagsChange = useCallback((newTags: Tag[]) => {
    setTags(newTags);
    saveDraft({ tags: newTags.map(t => t.text) });
  }, [saveDraft]);

  const handleSetTags = useCallback((newTags: Tag[] | ((prev: Tag[]) => Tag[])) => {
    const resolvedTags = typeof newTags === 'function' ? newTags(tags) : newTags;
    handleTagsChange(resolvedTags);
  }, [handleTagsChange, tags]);

  // Update cover image when found in editor
  useEffect(() => {
    const firstImage = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === ImagePlugin.key;
      },
    });

    const imageElement = firstImage?.[0] as any;
    if (imageElement?.url && imageElement.url !== coverUrl) {
      setCoverUrl(imageElement.url);
      saveDraft({ coverImage: imageElement.url });
    }
  }, [editor, coverUrl, saveDraft]);

  // Update title/subtitle from editor headings
  useEffect(() => {
    const firstH1 = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === HEADING_KEYS.h1;
      },
    });
    const firstH2 = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === HEADING_KEYS.h2;
      },
    });

    const h1Element = firstH1?.[0] as TElement | undefined;
    const h1Text = h1Element?.children?.[0] as TText | undefined;
    const h2Element = firstH2?.[0] as TElement | undefined;
    const h2Text = h2Element?.children?.[0] as TText | undefined;

    if (h1Text && !title) {
      setTitle(h1Text.text);
      saveDraft({ title: h1Text.text });
    }

    if (h2Text && !subtitle) {
      setSubtitle(h2Text.text);
      saveDraft({ subtitle: h2Text.text });
    }
  }, [editor, title, subtitle, saveDraft]);

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 min-h-0 pr-2">
        <div className="space-y-6 p-4 px-2">
          <div className="space-y-2">
            <div className="pb-2">
              <h3 className="font-medium">Preview</h3>
              <p className="text-sm text-muted-foreground">
                You can change how the post will be shown on social media and your blog index.
              </p>
            </div>
            <div className="border border-border rounded-lg p-4 space-y-4">
              <div className="space-y-2">
                <Label>Image</Label>
                {coverUrl ? (
                  <div className="relative w-full rounded-lg overflow-hidden border border-border">
                    <img src={coverUrl} alt="Cover" className="w-full h-auto object-cover" />
                  </div>
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              <div className="space-y-2">
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
              <div className="space-y-2">
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

          <div className="space-y-2">
            <Label>Tags</Label>
            <TagInput
              maxTags={5}
              styleClasses={{
                input: "shadow-none h-6",
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
        <PublishButton
          title={title}
          subtitle={subtitle}
          coverImage={coverUrl}
          tags={tags.map((t) => t.text)}
          disabled={!!titleError}
        />
      </div>
    </div>
  );
};
