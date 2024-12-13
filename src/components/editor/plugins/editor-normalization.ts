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

    // console.log("INSERTING h1");
    insertEmptyElement(editor, HEADING_KEYS.h1, { select: true });
  } else if (children?.[0]?.type !== HEADING_KEYS.h1) {
    // console.log("INSERTING h1 AT 0");
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
      const [node, path] = entry;

      ensureLeadingBlock(editor);

      if (isEditor(node)) {
        const children = [...editor.children];

        // Handle h1 nodes
        const h1Nodes = children.filter((n, i) => i > 0 && n.type === HEADING_KEYS.h1);
        if (h1Nodes.length > 0) {
          const firstH1 = children[0];
          const nonEmptyH1 = h1Nodes.find((n) => getNodeString(n).length > 0);

          if (nonEmptyH1 && (!firstH1 || firstH1.type !== HEADING_KEYS.h1 || getNodeString(firstH1).length === 0)) {
            // Move the non-empty h1 to position 0
            editor.apply({ type: "remove_node", path: [children.indexOf(nonEmptyH1)], node: nonEmptyH1 });
            editor.apply({ type: "insert_node", path: [0], node: nonEmptyH1 });
            if (firstH1 && firstH1.type === HEADING_KEYS.h1) {
              editor.apply({ type: "remove_node", path: [1], node: firstH1 });
            }
          }

          // Remove any remaining h1 nodes
          removeNodes(editor, {
            at: [],
            match: (n, p) => p[0] !== undefined && p[0] > 0 && n.type === HEADING_KEYS.h1,
          });
        }

        // Handle h2 nodes
        const h2Nodes = children.filter((n, i) => i > 1 && n.type === HEADING_KEYS.h2);
        if (h2Nodes.length > 0) {
          const secondNode = children[1];
          const nonEmptyH2 = h2Nodes.find((n) => getNodeString(n).length > 0);

          if (
            nonEmptyH2 &&
            (!secondNode || secondNode.type !== HEADING_KEYS.h2 || getNodeString(secondNode).length === 0)
          ) {
            // Move the non-empty h2 to position 1
            editor.apply({ type: "remove_node", path: [children.indexOf(nonEmptyH2)], node: nonEmptyH2 });
            editor.apply({ type: "insert_node", path: [1], node: nonEmptyH2 });
            if (secondNode && secondNode.type === HEADING_KEYS.h2) {
              editor.apply({ type: "remove_node", path: [2], node: secondNode });
            }
          }

          // Remove any remaining h2 nodes
          removeNodes(editor, {
            at: [],
            match: (n, p) => p[0] !== undefined && p[0] > 1 && n.type === HEADING_KEYS.h2,
          });
        }
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});
