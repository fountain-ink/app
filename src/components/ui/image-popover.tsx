import { uploadFile } from "@/lib/upload-image";
import { type WithRequiredKey } from "@udecode/plate-common";
import { selectEditor, setNode, useEditorRef, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import type React from "react";
import { useState } from "react";
import { WidthColumn, WidthFull, WidthWide } from "../custom-icons";
import { LoadingSpinner } from "../loading-spinner";
import { Button } from "./button";
import { CaptionButton } from "./caption";
import { ElementPopover } from "./element-popover";
import type { ImageWidth } from "./image-element";
import { Separator } from "./separator";

export interface ImagePopoverProps {
  children: React.ReactNode;
  plugin: WithRequiredKey;
  url?: string;
}

export function ImagePopover({ children, url }: ImagePopoverProps) {
  const editor = useEditorRef();
  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState<ImageWidth>((element?.width as ImageWidth) || "column");

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        setNode(editor, element, { url, width });
        selectEditor(editor, {
          at: editor.selection || undefined,
          edge: editor.selection ? undefined : "end",
          focus: true,
        });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleWidth = (newWidth: ImageWidth) => {
    setWidth(newWidth);
    setNode(editor, element, { url, width: newWidth });
  };

  const popoverContent = (
    <div className="box-content flex h-9 items-center gap-1">
      <Button
        size="icon"
        variant="muted"
        className={width === "column" ? "text-primary" : "muted"}
        onClick={() => handleWidth("column")}
      >
        <WidthColumn />
      </Button>
      <Button
        size="icon"
        variant="muted"
        className={width === "wide" ? "text-primary" : "muted"}
        onClick={() => handleWidth("wide")}
      >
        <WidthWide />
      </Button>
      <Button
        size="icon"
        variant="muted"
        className={width === "full" ? "text-primary" : "muted"}
        onClick={() => handleWidth("full")}
      >
        <WidthFull />
      </Button>
      <Separator orientation="vertical" className="my-1" />

      {url && (
        <Button variant="ghost" disabled={isUploading}>
          <div className="relative flex gap-1 items-center justify-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="absolute inset-0 cursor-pointer opacity-0"
              disabled={isUploading}
            />
            {isUploading ? <LoadingSpinner /> : <></>}
            Change
          </div>
        </Button>
      )}

      <CaptionButton variant="ghost">Caption</CaptionButton>

      <Button variant="ghost" {...buttonProps}>
        Remove
      </Button>
    </div>
  );

  return <ElementPopover content={popoverContent}>{children}</ElementPopover>;
}
