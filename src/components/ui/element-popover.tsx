import { isSelectionExpanded } from "@udecode/plate-common";
import { useEditorSelector } from "@udecode/plate-common/react";
import type React from "react";
import { useReadOnly, useSelected } from "slate-react";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

import { setNode, useEditorRef, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { useState } from "react";
import { Button } from "./button";
import { CaptionButton } from "./caption";
import { Separator } from "./separator";
import { WidthColumn, WidthWide, WidthFull } from "../icons/custom-icons";

interface ElementPopoverProps {
  children: React.ReactNode;
  defaultWidth?: ElementWidth;
  onWidthChange?: (width: ElementWidth) => void;
  showCaption?: boolean;
  showWidth?: boolean;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
  content?: React.ReactNode;
  verticalContent?: React.ReactNode;
}

export type ElementWidth = "column" | "wide" | "full";

export const ELEMENT_WIDTH_CLASSES: Record<ElementWidth, string> = {
  wide: "w-screen max-w-[65vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  full: "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  column: "w-full max-w-full",
} as const;

export function ElementPopover({
  children,
  defaultWidth = "column",
  onWidthChange,
  showCaption = true,
  showWidth = true,
  side = "top",
  sideOffset = -20,
  content,
  verticalContent,
}: ElementPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);
  const isOpen = !readOnly && selected && selectionCollapsed;
  const editor = useEditorRef();
  const element = useElement();
  const { props: removeButtonProps } = useRemoveNodeButton({ element });
  const [width, setWidth] = useState<ElementWidth>(defaultWidth);

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    onWidthChange?.(newWidth);
    setNode(editor, element, { width: newWidth });
  };

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>
      <PopoverContent
        side={side}
        sideOffset={sideOffset}
        className="w-auto p-1"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-1 items-center">
          {verticalContent}
          <div className="box-content flex h-9 items-center gap-1">
            {showWidth && (
              <>
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
              </>
            )}

            {content}

            {showCaption && <CaptionButton variant="ghost">Caption</CaptionButton>}

            <Button variant="ghost" {...removeButtonProps}>
              Remove
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
