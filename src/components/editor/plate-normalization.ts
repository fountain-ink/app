import { getNodeString, insertEmptyElement, isEditor, removeNodes } from "@udecode/plate-common";
import type { PlateEditor } from "@udecode/plate-common/react";
import { createPlatePlugin } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";

export function ensureLeadingBlock(editor: PlateEditor, { event }: { event?: React.MouseEvent } = {}) {
  const { children } = editor;

  if (children?.length === 0) {
    // Don't try to select an empty editor
    event?.preventDefault();
    event?.stopPropagation();

    console.log("INSERTING h1");
    insertEmptyElement(editor, HEADING_KEYS.h1, { select: true });
  } else if (children?.[0]?.type !== HEADING_KEYS.h1) {
    console.log("INSERTING h1 AT 0");
    insertEmptyElement(editor, HEADING_KEYS.h1, {
      at: [0],
      select: true,
    });
  }
}

const allowDelete = (editor: PlateEditor) => {
  const path = editor.selection?.anchor.path;
  const offset = editor.selection?.anchor.offset;

  if (path !== undefined && offset !== undefined && offset === 0 && path[0] === 0 && path[1] === 0) {
    return false;
  }

  return true;
};

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",

  extendEditor: ({ editor }) => {
    const { deleteBackward, deleteForward, normalizeNode } = editor;

    editor.deleteForward = (...args) => {
      if (allowDelete(editor)) {
        return deleteForward(...args);
      }

      const node = editor.children[0];

      if (node && getNodeString(node).length > 0) {
        return deleteForward(...args);
      }
    };

    editor.deleteBackward = (...args) => {
      if (allowDelete(editor)) {
        return deleteBackward(...args);
      }
    };

    editor.normalizeNode = (entry) => {
      const [node] = entry;

      ensureLeadingBlock(editor);

      if (isEditor(node)) {
        // Remove additional h1 nodes (after index 0)
        removeNodes(editor, {
          at: [],
          match: (n, p) => p[0] !== undefined && p[0] > 0 && n.type === HEADING_KEYS.h1,
        });

        // Remove additional h2 nodes (after index 1)
        removeNodes(editor, {
          at: [],
          match: (n, p) => p[0] !== undefined && p[0] > 1 && n.type === HEADING_KEYS.h2,
        });
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});
