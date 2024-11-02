import { Button } from "@/components/ui/button";
import { BoldIcon, CodeIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { SelectorItem } from "./select-node";
import { cn } from "@/lib/utils";

export const TextButtons = () => {
  const { editor } = useEditor();
  if (!editor) return null;

  const items: SelectorItem[] = [
    {
      name: "bold",
      isActive: (editor) => editor.isActive("bold"),
      command: (editor) => editor.chain().focus().toggleBold().run(),
      icon: <BoldIcon className="w-full h-full" />,
    },
    {
      name: "italic",
      isActive: (editor) => editor.isActive("italic"),
      command: (editor) => editor.chain().focus().toggleItalic().run(),
      icon: <ItalicIcon className="w-full h-full" />,
    },
    {
      name: "underline",
      isActive: (editor) => editor.isActive("underline"),
      command: (editor) => editor.chain().focus().toggleUnderline().run(),
      icon: <UnderlineIcon className="w-full h-full" />,
    },
    {
      name: "strike",
      isActive: (editor) => editor.isActive("strike"),
      command: (editor) => editor.chain().focus().toggleStrike().run(),
      icon: <StrikethroughIcon className="w-full h-full" />,
    },
    {
      name: "code",
      isActive: (editor) => editor.isActive("code"),
      command: (editor) => editor.chain().focus().toggleCode().run(),
      icon: <CodeIcon className="w-full h-full" />,
    },
  ];
  return (
    <div className="flex">
      {items.map((item, _index) => (
        <EditorBubbleItem
          key={item.name}
          onSelect={(editor) => {
            item.command(editor);
          }}
        >
          <Button size="icon" className="rounded-none" variant="ghost">
            <div
              className={cn("h-4 w-4", {
                "text-blue-500": item.isActive(editor),
              })}
            >
              {item.icon}
            </div>
          </Button>
        </EditorBubbleItem>
      ))}
    </div>
  );
};
