"use client";

import { Button } from "@/components/ui/button";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Popover } from "@radix-ui/react-popover";
import type { Editor } from "@tiptap/react";
import { Check, ChevronDown } from "lucide-react";
import { EditorBubbleItem, useEditor } from "novel";
import type { ReactNode } from "react";
import { suggestionItems } from "../extensions/slash-command";

export type SelectorItem = {
  name: string;
  icon: ReactNode;
  command: (editor: Editor) => void;
  isActive: (editor: Editor) => boolean;
};

const items: SelectorItem[] = suggestionItems.map((item) => ({
  name: item.title,
  icon: item.icon,
  command: (editor) => item.command?.({ editor, range: editor.state.selection }) || null,
  isActive: (editor: Editor) => {
    switch (item.title) {
      case "Text":
        return editor.isActive("paragraph") && !editor.isActive("bulletList") && !editor.isActive("orderedList");
      case "Heading":
        return editor.isActive("heading", { level: 3 });
      case "Image":
        return editor.isActive("image");
      case "Check List":
        return editor.isActive("taskList");
      case "Bullet List":
        return editor.isActive("bulletList");
      case "Numbered List":
        return editor.isActive("orderedList");
      case "Quote":
        return editor.isActive("blockquote");
      case "Code":
        return editor.isActive("codeBlock");
      case "Footnote":
        return editor.isActive("footnote");
      default:
        return false;
    }
  },
}));

interface NodeSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NodeSelector = ({ open, onOpenChange }: NodeSelectorProps) => {
  const { editor } = useEditor();
  if (!editor) return null;
  const activeItem = items.filter((item) => item.isActive(editor)).pop() ?? {
    name: "Multiple",
  };

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild className="gap-2 rounded-none border-none hover:bg-accent focus:ring-0">
        <Button variant="ghost" className="gap-2">
          <span className="whitespace-nowrap text-sm">{activeItem.name}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent sideOffset={5} align="start" className="w-48 p-1">
        {items.map((item, _index) => (
          <EditorBubbleItem
            key={item.name}
            onSelect={(editor) => {
              item.command(editor);
              onOpenChange(false);
            }}
            className="flex cursor-pointer items-center justify-between rounded-sm p-1 py-1 text-sm hover:bg-accent"
          >
            <div className="flex items-center space-x-2">
              <div className="rounded-sm border h-7 w-7 p-1">{item.icon}</div>
              <span>{item.name}</span>
            </div>
            {activeItem.name === item.name && <Check className="h-4 w-4" />}
          </EditorBubbleItem>
        ))}
      </PopoverContent>
    </Popover>
  );
};
