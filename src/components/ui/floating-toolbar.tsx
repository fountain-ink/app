"use client";

import { cn, withRef } from "@udecode/cn";
import { useComposedRef, useEditorId, useEditorRef, useEventEditorSelectors } from "@udecode/plate-common/react";
import {
  type FloatingToolbarState,
  flip,
  offset,
  useFloatingToolbar,
  useFloatingToolbarState,
} from "@udecode/plate-floating";
import { TITLE_KEYS } from "@/components/editor/plugins/title-plugin";

import { Toolbar } from "./toolbar";

export const FloatingToolbar = withRef<
  typeof Toolbar,
  {
    state?: FloatingToolbarState;
  }
>(({ children, state, ...props }, componentRef) => {
  const editor = useEditorRef();
  const editorId = useEditorId();
  const focusedEditorId = useEventEditorSelectors.focus();
  const isFloatingLinkOpen = !!editor.useOption({ key: "a" }, "mode");
  const isAIChatOpen = editor.useOption({ key: "aiChat" }, "open");

  const selected = editor.children[editor?.selection?.anchor.path[0] ?? 0];
  const isOnTitle = selected?.type === TITLE_KEYS.title;
  const isOnSubtitle = selected?.type === TITLE_KEYS.subtitle;
  const isOnCodeblock = selected?.type === "code_block";

  const floatingToolbarState = useFloatingToolbarState({
    editorId,
    focusedEditorId,
    hideToolbar: isFloatingLinkOpen || isAIChatOpen || isOnTitle || isOnSubtitle || isOnCodeblock,
    ...state,
    floatingOptions: {
      middleware: [
        offset(12),
        flip({
          fallbackPlacements: ["top-start", "top-end", "bottom-start", "bottom-end"],
          padding: 12,
        }),
      ],
      placement: "top",
      ...state?.floatingOptions,
    },
  });

  const { clickOutsideRef, hidden, props: rootProps, ref: floatingRef } = useFloatingToolbar(floatingToolbarState);

  const ref = useComposedRef<HTMLDivElement>(componentRef, floatingRef);

  if (hidden) return null;

  return (
    <div ref={clickOutsideRef}>
      <Toolbar
        ref={ref}
        className={cn(
          "absolute z-50 whitespace-nowrap rounded-md border border-border bg-popover p-1 opacity-100 shadow-md print:hidden",
          "max-w-[80vw]",
        )}
        {...rootProps}
        {...props}
      >
        {children}
      </Toolbar>
    </div>
  );
});
