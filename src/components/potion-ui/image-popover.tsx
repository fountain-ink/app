import { Icons } from "@/components/icons";
import { uploadFile } from "@/lib/upload-image";
import { isSelectionExpanded, WithRequiredKey } from "@udecode/plate-common";
import { setNode, useEditorRef, useEditorSelector, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { UploadIcon } from "lucide-react";
import React from "react";
import { useReadOnly, useSelected } from "slate-react";
import { LoadingSpinner } from "../loading-spinner";
import { Button } from "./button";
import { CaptionButton } from "./caption";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Separator } from "./separator";

export interface ImagePopoverProps {
  children: React.ReactNode;
  plugin: WithRequiredKey;
}

export function ImagePopover({ children, plugin }: ImagePopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const editor = useEditorRef();
  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });
  const [isUploading, setIsUploading] = React.useState(false);

  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);
  const isOpen = !readOnly && selected && selectionCollapsed;
  const url = element?.url;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        setNode(editor, element, { url });
      }
    } finally {
      setIsUploading(false);
    }
  };

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent sideOffset={0} className="w-auto p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
        <div className="box-content flex h-9 items-center gap-1">
          <Button size="sm" variant="ghost" disabled={isUploading}>
            <div className="relative flex gap-1 items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
                disabled={isUploading}
              />
              {isUploading ? <LoadingSpinner /> : <>{!url && <UploadIcon className="size-4 mr-2" />}</>}
              {url ? "Change" : "Upload"}
            </div>
          </Button>

          <CaptionButton variant="ghost">Caption</CaptionButton>

          <Separator orientation="vertical" className="my-1" />

          <Button size="sm" variant="ghost" {...buttonProps}>
            <Icons.delete className="size-4" />
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
