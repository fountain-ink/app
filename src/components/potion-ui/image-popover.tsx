import { Icons } from "@/components/icons";
import { isSelectionExpanded, WithRequiredKey } from "@udecode/plate-common";
import { setNode, useEditorRef, useEditorSelector, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { UploadIcon } from "lucide-react";
import React from "react";
import { useReadOnly, useSelected } from "slate-react";
import { Button } from "./button";
import { ImageUploadModal } from "./image-upload-modal";
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

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);
  const isOpen = !readOnly && selected && selectionCollapsed;

  const handleImageUploaded = (url: string) => {
    // editor.setNodes({ url }, { at: editor.selection });

    console.log(editor, element, url)
    setNode(editor, element, { url })
  };

  if (readOnly) return <>{children}</>;

  return (
    <>
      <Popover open={isOpen} modal={false}>
        <PopoverAnchor>{children}</PopoverAnchor>

        <PopoverContent className="w-auto p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
          <div className="box-content flex h-9 items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsModalOpen(true)}
            >
              <UploadIcon className="size-4 mr-2" />
              Upload Image
            </Button>

            <Separator orientation="vertical" className="my-1" />

            <Button size="sm" variant="ghost" {...buttonProps}>
              <Icons.delete className="size-4" />
            </Button>
          </div>
        </PopoverContent>
      </Popover>

      <ImageUploadModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onImageUploaded={handleImageUploaded}
      />
    </>
  );
}
