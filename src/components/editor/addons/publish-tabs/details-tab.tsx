import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { findNode } from "@udecode/plate-common";
import { useEditorState } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ImagePlugin } from "@udecode/plate-media/react";
import { TElement, TText } from "@udecode/slate";
import { useEffect, useState } from "react";

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

  // Find and sync with first h1 node
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

    if (h1Text && h1Text.text !== title) {
      setTitle(h1Text.text);
    }

    if (h2Text && h2Text.text !== subtitle) {
      setSubtitle(h2Text.text);
    }

    // Find first image element
    const firstImage = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === ImagePlugin.key;
      },
    });

    const imageElement = firstImage?.[0] as any;
    if (imageElement?.url && imageElement.url !== coverUrl) {
      setCoverUrl(imageElement.url);
    }
  }, [editor, title, subtitle, coverUrl]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);

    const firstH1 = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === HEADING_KEYS.h1;
      },
    });

    if (firstH1) {
      const [, path] = firstH1;
      // Delete existing content and insert new text
      const textPath = [...path, 0];
      editor.select({ path: textPath, offset: 0 });
      editor.deleteForward("block");
      editor.insertText(newTitle);
    }
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubtitle = e.target.value;
    setSubtitle(newSubtitle);

    const firstH2 = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === HEADING_KEYS.h2;
      },
    });

    if (firstH2) {
      const [, path] = firstH2;
      const textPath = [...path, 0];
      editor.select({ path: textPath, offset: 0 });
      editor.deleteForward("block");
      editor.insertText(newSubtitle);
    }
  };

  return (
    <ScrollArea className="h-[480px]">
      <div className="space-y-4 p-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="Enter title" value={title} onChange={handleTitleChange} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="subtitle">Subtitle</Label>
          <Input
            id="subtitle"
            placeholder="Enter subtitle (optional)"
            value={subtitle}
            onChange={handleSubtitleChange}
          />
        </div>
        <div className="space-y-2">
          <Label>Cover Image</Label>
          {coverUrl ? (
            <div className="relative w-full rounded-lg overflow-hidden border border-border">
              <img src={coverUrl} alt="Cover" className="w-full h-auto object-cover" />
            </div>
          ) : (
            <ImagePlaceholder />
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" placeholder="Enter tags separated by commas" />
        </div>
      </div>
    </ScrollArea>
  );
};
