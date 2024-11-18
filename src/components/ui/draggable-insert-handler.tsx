"use client";

import { type TElement, insertNodes, nanoid } from "@udecode/plate-common";
import {
  ParagraphPlugin,
  type PlateEditor,
  findNodePath,
  focusEditor,
  useEditorRef,
  useElement,
} from "@udecode/plate-common/react";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { Plus } from "lucide-react";
import { Path } from "slate";

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

        const at = findNodePath(editor, element);
        triggerComboboxNextBlock(editor, "/", at, event.altKey);
      }}
      onMouseDown={() => {
        focusEditor(editor);
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
    _at = insertAbove ? slicedPath : Path.next(slicedPath);
  }

  insertNodes<TElement>(editor, emptyBlock, {
    at: _at,
    select: true,
  });
  editor.insertText(triggerText);
};
