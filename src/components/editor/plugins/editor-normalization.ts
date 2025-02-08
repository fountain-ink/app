import { getNodeString, insertElements, insertEmptyElement, isEditor, removeNodes } from "@udecode/plate-common";
import type { PlateEditor } from "@udecode/plate-common/react";
import { createPlatePlugin, ParagraphPlugin } from "@udecode/plate-common/react";
import { useYjsState } from "../../../hooks/use-yjs-state";
import { TITLE_KEYS } from "../plugins/title-plugin";

function hasId(node: any): boolean {
  return typeof node === "object" && node !== null && "id" in node && typeof node.id === "string";
}

export function ensureLeadingBlock(editor: PlateEditor, { event }: { event?: React.MouseEvent } = {}) {
  const { children } = editor;

  if (children?.length === 0) {
    // Don't try to select an empty editor
    event?.preventDefault();
    event?.stopPropagation();

    insertElements(editor, [{ type: TITLE_KEYS.title, children: [{ text: "", id: "1" }] }], { select: false });
  } else if (children?.[0]?.type !== TITLE_KEYS.title) {
    insertEmptyElement(editor, TITLE_KEYS.title, { select: true, at: [0] });
  }
}

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",

  extendEditor: ({ editor }) => {
    const { normalizeNode, apply } = editor;

    editor.apply = (...args) => {
      // console.log(args);

      const operation = args[0] as { type: string; path: number[]; properties: { type?: string } };
      if (operation.type === "set_node" && operation.path[0] === 0 && operation.properties.type === TITLE_KEYS.title) {
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

        // console.log(children);
        ensureLeadingBlock(editor);

        if (isConnected) {
          // console.log("remove em");

          // Handle title nodes
          const titleNodes = children.filter((n, i) => i > 0 && n.type === TITLE_KEYS.title);
          if (titleNodes.length > 0) {
            const firstNode = children[0];
            const nonEmptyTitle = titleNodes.find((n) => getNodeString(n).length > 0);

            if (
              nonEmptyTitle &&
              (!firstNode || firstNode.type !== TITLE_KEYS.title || getNodeString(firstNode).length === 0)
            ) {
              editor.apply({ type: "insert_node", path: [0], node: nonEmptyTitle });
            }
          }

          // Handle subtitle nodes
          const subtitleNodes = children.filter((n, i) => i > 1 && n.type === TITLE_KEYS.subtitle);
          if (subtitleNodes.length > 0) {
            editor.apply({
              type: "insert_node",
              path: [1],
              node: { type: TITLE_KEYS.subtitle, children: [{ text: "", id: "2" }] },
            });
            const secondNode = children[1];
            const nonEmptySubtitle = subtitleNodes.find((n) => getNodeString(n).length > 0);

            if (
              nonEmptySubtitle &&
              (!secondNode || secondNode.type !== TITLE_KEYS.subtitle || getNodeString(secondNode).length === 0)
            ) {
              editor.apply({ type: "insert_node", path: [1], node: nonEmptySubtitle });
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

        // Remove any title nodes after index 0
        removeNodes(editor, {
          at: [],
          match: (n, p) => {
            return p[0] !== undefined && p[0] > 0 && "type" in n && n.type === TITLE_KEYS.title;
          },
        });

        // Remove any subtitle nodes after index 1
        removeNodes(editor, {
          at: [],
          match: (n, p) => {
            return p[0] !== undefined && p[0] > 1 && "type" in n && n.type === TITLE_KEYS.subtitle;
          },
        });
      }

      return normalizeNode(entry);
    };

    return editor;
  },
});
