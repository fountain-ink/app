import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { findNode } from "@udecode/plate-common";
import { useEditorState } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TElement, TText } from "@udecode/slate";
import { useEffect, useState } from "react";

export const DetailsTab = () => {
  const editor = useEditorState();
  const [title, setTitle] = useState("");

  // Find and sync with first h1 node
  useEffect(() => {
    const firstH1 = findNode(editor, {
      at: [],
      match: (n) => {
        return n.type === HEADING_KEYS.h1;
      },
    });
    const h1Element = firstH1?.[0] as TElement | undefined;
    const h1Text = h1Element?.children?.[0] as TText | undefined;

    if (h1Text && h1Text.text !== title) {
      setTitle(h1Text.text);
    }
  }, [editor]);

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

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" placeholder="Enter article title" value={title} onChange={handleTitleChange} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input id="subtitle" placeholder="Enter article subtitle" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="cover">Cover Image URL</Label>
        <Input id="cover" placeholder="Enter cover image URL" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <Input id="tags" placeholder="Enter tags separated by commas" />
      </div>
    </div>
  );
};
