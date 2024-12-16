import { getNodeString, insertElements, insertEmptyElement, isEditor, removeNodes } from "@udecode/plate-common";
import type { PlateEditor } from "@udecode/plate-common/react";
import { createPlatePlugin, ParagraphPlugin } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { useYjsState } from "../../../hooks/use-yjs-state";

function hasId(node: any): boolean {
  return typeof node === "object" && node !== null && "id" in node && typeof node.id === "string";
}

export function ensureLeadingBlock(editor: PlateEditor, { event }: { event?: React.MouseEvent } = {}) {
  const { children } = editor;

  if (children?.length === 0) {
    // Don't try to select an empty editor
    event?.preventDefault();
    event?.stopPropagation();

    insertElements(editor, [{ type: HEADING_KEYS.h1, children: [{ text: "", id: "1" }] }], { select: false });
  } else if (children?.[0]?.type !== HEADING_KEYS.h1) {
    insertEmptyElement(editor, HEADING_KEYS.h1, { select: true, at: [0] });
  }
}

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",

  extendEditor: ({ editor }) => {
    const { normalizeNode, apply } = editor;

    editor.apply = (...args) => {
      console.log(args);

      const operation = args[0] as { type: string; path: number[]; properties: { type?: string } };
      if (operation.type === "set_node" && operation.path[0] === 0 && operation.properties.type === HEADING_KEYS.h1) {
        return false;
      }

      return apply(...args);
    };

    editor.normalizeNode = (entry) => {
      const [node, _path] = entry;

      if (isEditor(node)) {
        const children = [...editor.children];
        const activeDocument = useYjsState.getState().activeDocument;
        const documentState = activeDocument ? useYjsState.getState().getState(activeDocument) : null;
        const isConnected = documentState?.status === "connected";
        const isSynced = documentState?.status === "synced";

        console.log(children);
        ensureLeadingBlock(editor);

        if (isConnected) {
          console.log("remove em");

          // Handle h1 nodes
          const h1Nodes = children.filter((n, i) => i > 0 && n.type === HEADING_KEYS.h1);
          if (h1Nodes.length > 0) {
            const firstNode = children[0];
            const nonEmptyH1 = h1Nodes.find((n) => getNodeString(n).length > 0);

            if (
              nonEmptyH1 &&
              (!firstNode || firstNode.type !== HEADING_KEYS.h1 || getNodeString(firstNode).length === 0)
            ) {
              editor.apply({ type: "insert_node", path: [0], node: nonEmptyH1 });
            }
          }

          // Handle h2 nodes
          const h2Nodes = children.filter((n, i) => i > 1 && n.type === HEADING_KEYS.h2);
          if (h2Nodes.length > 0) {
            editor.apply({
              type: "insert_node",
              path: [1],
              node: { type: HEADING_KEYS.h2, children: [{ text: "", id: "2" }] },
            });
            const secondNode = children[1];
            const nonEmptyH2 = h2Nodes.find((n) => getNodeString(n).length > 0);

            if (
              nonEmptyH2 &&
              (!secondNode || secondNode.type !== HEADING_KEYS.h2 || getNodeString(secondNode).length === 0)
            ) {
              editor.apply({ type: "insert_node", path: [1], node: nonEmptyH2 });
            }
          }
        }

        if (isConnected || isSynced) {
          removeNodes(editor, {
            at: [],
            match: (n) => {
              return !hasId(n) && n.type === ParagraphPlugin.key;
            },
          });
        }

        // Remove any h1 nodes after index 0
        removeNodes(editor, {
          at: [],
          match: (n, p) => {
            return p[0] !== undefined && p[0] > 0 && "type" in n && n.type === HEADING_KEYS.h1;
          },
        });

        // Remove any h2 nodes after index 1
        removeNodes(editor, {
          at: [],
          match: (n, p) => {
            return p[0] !== undefined && p[0] > 1 && "type" in n && n.type === HEADING_KEYS.h2;
          },
        });
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});
