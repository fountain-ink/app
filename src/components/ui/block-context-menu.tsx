"use client";

import React from "react";

import { cn } from "@udecode/cn";
import { BLOCK_CONTEXT_MENU_ID, BlockMenuPlugin } from "@udecode/plate-selection/react";
import { MoreHorizontal } from "lucide-react";

import { useIsTouchDevice } from "@/hooks/use-is-touch";
import { useLockScroll } from "@/hooks/use-lock-scroll";
import { useEditorPlugin, useEditorRef, useElement } from "@udecode/plate/react";
import { BlockMenu } from "./block-menu";
import { type ButtonProps, Button } from "./button";
import { useContextMenu } from "./menu";

export function BlockContextMenu({ children }: { children: React.ReactNode }) {
  const { api, editor, getOption } = useEditorPlugin(BlockMenuPlugin);
  const anchorRect = getOption("position");
  const openId = getOption("openId");
  const isTouch = useIsTouchDevice();
  useLockScroll(openId === BLOCK_CONTEXT_MENU_ID, `#${editor.uid}`);

  const { getAnchorRect, show, store } = useContextMenu(anchorRect);

  if (isTouch) {
    return children;
  }

  return (
    <div
      className="group/context-menu w-full"
      onContextMenu={(event) => {
        const dataset = (event.target as HTMLElement).dataset;

        const disabled = dataset?.slateEditor === "true";

        if (disabled) return;

        event.preventDefault();

        show();
        api.blockMenu.show(BLOCK_CONTEXT_MENU_ID, {
          x: event.clientX,
          y: event.clientY,
        });
      }}
      data-plate-selectable
      data-state={openId === BLOCK_CONTEXT_MENU_ID ? "open" : "closed"}
    >
      {children}

      <BlockMenu open={openId === BLOCK_CONTEXT_MENU_ID} getAnchorRect={getAnchorRect} store={store} />
    </div>
  );
}

export const BlockActionButton = React.forwardRef<
  HTMLButtonElement,
  Partial<ButtonProps> & { defaultStyles?: boolean }
>(({ className, defaultStyles = true, ...props }, ref) => {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      ref={ref}
      size="blockAction"
      variant="blockAction"
      className={cn(
        defaultStyles && "absolute right-1 top-1 opacity-0 transition-opacity group-hover:opacity-100",
        className,
      )}
      onClick={(e) => {
        e.stopPropagation();
        editor.getApi(BlockMenuPlugin).blockMenu.showContextMenu(element.id as string, {
          x: e.clientX,
          y: e.clientY,
        });
      }}
      contentEditable={false}
      tooltip="More actions"
      {...props}
    >
      <MoreHorizontal />
    </Button>
  );
});
