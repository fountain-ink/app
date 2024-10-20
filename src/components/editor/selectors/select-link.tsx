"use client";

import { Button } from "@/components/ui/button";
import { PopoverContent } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Popover, PopoverTrigger } from "@radix-ui/react-popover";
import { Check, LinkIcon, Trash } from "lucide-react";
import { useEditor } from "novel";
import { useEffect, useRef } from "react";

export function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
}
export function getUrlFromString(str: string) {
  if (isValidUrl(str)) return str;
  try {
    if (str.includes(".") && !str.includes(" ")) {
      return new URL(`https://${str}`).toString();
    }
  } catch (e) {
    return null;
  }
}
interface LinkSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

import { useState } from "react";

export const LinkSelector = ({ open, onOpenChange }: LinkSelectorProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const { editor } = useEditor();
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setInputValue(editor?.getAttributes("link").href || "");
    }
  }, [open, editor]);

  if (!editor) return null;

  return (
    <Popover modal={true} open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="rounded-none ">
          <p
            className={cn("underline decoration-foreground underline-offset-4", {
              "text-blue-500": editor.isActive("link"),
            })}
          >
            <LinkIcon className="h-4 w-4" />
          </p>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="p-0 z-50" sideOffset={5}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const url = getUrlFromString(inputValue);
            url && editor.chain().focus().setLink({ href: url }).run();
          }}
          className="flex p-1 gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Paste a link"
            className="flex-1 bg-background p-1 text-sm outline-none focus:ring-2 focus:ring-accent rounded-sm transition-all duration-200 ease-in-out"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            style={{ width: "100%" }}
          />
          {editor.getAttributes("link").href ? (
            <Button
              size="icon"
              variant="outline"
              type="button"
              className="flex h-8 items-center rounded-sm p-1 text-red-600 transition-all hover:bg-red-100 dark:hover:bg-red-800"
              onClick={() => {
                editor.chain().focus().unsetLink().run();
                setInputValue("");
              }}
            >
              <Trash className="h-4 w-4" />
            </Button>
          ) : (
            <Button size="icon" className="h-8">
              <Check className="h-4 w-4" />
            </Button>
          )}
        </form>
      </PopoverContent>
    </Popover>
  );
};
