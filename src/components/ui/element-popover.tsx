import { isSelectionExpanded } from "@udecode/plate-common";
import { useEditorSelector } from "@udecode/plate-common/react";
import type React from "react";
import { useReadOnly, useSelected } from "slate-react";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";

interface ElementPopoverProps {
  children: React.ReactNode;
  content: React.ReactNode;
  side?: "top" | "bottom" | "left" | "right";
  sideOffset?: number;
}

export function ElementPopover({ children, content, side = "top", sideOffset = -20 }: ElementPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();
  const selectionCollapsed = useEditorSelector((editor) => !isSelectionExpanded(editor), []);
  const isOpen = !readOnly && selected && selectionCollapsed;

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
        {content}
      </PopoverContent>
    </Popover>
  );
}