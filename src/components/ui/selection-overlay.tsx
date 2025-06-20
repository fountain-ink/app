"use client";

import { cn } from "@udecode/cn";
import { createPlatePlugin, useEditorPlugin, useEditorRef } from "@udecode/plate/react";
import {
  type CursorData,
  CursorOverlay as CursorOverlayPrimitive,
  type CursorOverlayProps,
  type CursorProps,
  type CursorState,
} from "@udecode/plate-cursor";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { useEffect } from "react";

export function Selection({
  caretPosition,
  classNames,
  data,
  disableCaret,
  disableSelection,
  selectionRects,
}: CursorProps<CursorData>) {
  const { style, selectionStyle = style } = data ?? ({} as CursorData);

  return (
    <>
      {!disableSelection &&
        selectionRects.map((position, i) => (
          <div
            key={`${i}-${position.top}-${position.left}`}
            className={cn("pointer-events-none absolute z-10 opacity-30", classNames?.selectionRect)}
            style={{
              ...selectionStyle,
              ...position,
            }}
          />
        ))}
      {!disableCaret && caretPosition && (
        <div
          className={cn("pointer-events-none absolute z-10 w-0.5", classNames?.caret)}
          style={{ ...caretPosition, ...style }}
        />
      )}
    </>
  );
}

export function SelectionOverlay({ cursors, ...props }: CursorOverlayProps) {
  const editor = useEditorRef();
  const dynamicCursors = editor.getOption(SelectionOverlayPlugin, "cursors");

  const allCursors = { ...cursors, ...dynamicCursors };

  return <CursorOverlayPrimitive {...props} onRenderCursor={Selection} cursors={allCursors} />;
}

export const SelectionOverlayPlugin = createPlatePlugin({
  key: "selection_over_lay",
  options: { cursors: {} as Record<string, CursorState<CursorData>> },
  useHooks: ({ setOption }) => {
    const { editor } = useEditorPlugin(BlockSelectionPlugin);
    const isSelecting = editor.getOptions(BlockSelectionPlugin).isSelecting;

    useEffect(() => {
      if (isSelecting) {
        setTimeout(() => {
          setOption("cursors", {});
        }, 0);
      }
    }, [editor, isSelecting, setOption]);
  },
  handlers: {
    onBlur: ({ editor, event, setOption }) => {
      const isPrevented = (event.relatedTarget as HTMLElement)?.dataset?.platePreventOverlay === "true";

      if (isPrevented) return;
      if (editor.selection) {
        setOption("cursors", {
          drag: {
            key: "blur",
            data: {
              selectionStyle: {
                backgroundColor: "rgba(47, 121, 216, 0.35)",
              },
            },
            selection: editor.selection,
          },
        });
      }
    },
    onFocus: ({ setOption }) => {
      setOption("cursors", {});
    },
  },
});
