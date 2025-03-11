"use client";

import { Path, PathApi, type TElement, nanoid } from "@udecode/plate";
import { ParagraphPlugin, type PlateEditor, useEditorRef, useElement } from "@udecode/plate/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { Plus } from "lucide-react";
import { Button } from "./button";

export const DraggableInsertHandle = () => {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <Button
      variant="ghost"
      className="size-6 shrink-0 p-1"
      onClick={(event) => {
        event.stopPropagation();
        event.preventDefault();

        const at = editor.api.findPath(element);
        triggerComboboxNextBlock(editor, "/", at, event.altKey);
      }}
      onMouseDown={() => {
        editor.tf.focus();
        editor.getApi(BlockSelectionPlugin).blockSelection.resetSelectedIds();
      }}
      tabIndex={-1}
      tooltip={
        <div className="text-center">
          Click <span className="text-gray-400">to add below</span>
          <br />
          Option-click <span className="text-gray-400">to add above</span>
        </div>
      }
      tooltipContentProps={{
        side: "bottom",
      }}
    >
      <Plus className="size-4 text-muted-foreground/70" />
    </Button>
  );
};

const triggerComboboxNextBlock = (editor: PlateEditor, triggerText: string, at?: Path, insertAbove = false) => {
  const emptyBlock = {
    id: nanoid(),
    children: [{ text: "" }],
    type: ParagraphPlugin.key,
  };

  let _at: Path | undefined;

  if (at) {
    const slicedPath = at.slice(0, 1);
    _at = insertAbove ? slicedPath : PathApi.next(slicedPath);
  }

  editor.tf.insertNodes<TElement>(emptyBlock, {
    at: _at,
    select: true,
  });
  editor.tf.insertText(triggerText);
};
