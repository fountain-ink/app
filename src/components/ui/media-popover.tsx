"use client";

import { type WithRequiredKey } from "@udecode/plate";
import { useEditorSelector, useElement, useReadOnly, useRemoveNodeButton, useSelected } from "@udecode/plate/react";
import { FloatingMedia as FloatingMediaPrimitive } from "@udecode/plate-media/react";
import { Link, Trash2Icon } from "lucide-react";
import type React from "react";
import { useEffect } from "react";

import { Button, buttonVariants } from "./button";
import { CaptionButton } from "./caption";
import { inputVariants } from "./input";
import { Popover, PopoverAnchor, PopoverContent } from "./popover";
import { Separator } from "./separator";

export interface MediaPopoverProps {
  children: React.ReactNode;
  plugin: WithRequiredKey;
}

export function MediaPopover({ children, plugin }: MediaPopoverProps) {
  const readOnly = useReadOnly();
  const selected = useSelected();

  const selectionCollapsed = useEditorSelector((editor) => !editor.api.isExpanded(), []);
  const isOpen = !readOnly && selected && selectionCollapsed;
  // const isEditing = useFloatingMediaSelectors().isEditing();
  const isEditing = false;

  useEffect(() => {
    if (!isOpen && isEditing) {
      // floatingMediaActions.isEditing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });

  if (readOnly) return <>{children}</>;

  return (
    <Popover open={isOpen} modal={false}>
      <PopoverAnchor>{children}</PopoverAnchor>

      <PopoverContent className="w-auto p-1" onOpenAutoFocus={(e) => e.preventDefault()}>
        {isEditing ? (
          <div className="flex w-[330px] flex-col">
            <div className="flex items-center">
              <div className="flex items-center pl-2 pr-1 text-muted-foreground">
                <Link className="size-4" />
              </div>

              <FloatingMediaPrimitive.UrlInput
                className={inputVariants({ h: "sm", variant: "ghost" })}
                placeholder="Paste the embed link..."
                options={{ plugin }}
              />
            </div>
          </div>
        ) : (
          <div className="box-content flex items-center">
            <FloatingMediaPrimitive.EditButton className={buttonVariants({ size: "sm", variant: "ghost" })}>
              Edit link
            </FloatingMediaPrimitive.EditButton>

            <CaptionButton variant="ghost">Caption</CaptionButton>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <Button size="icon" variant="ghost" {...buttonProps}>
              <Trash2Icon />
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
