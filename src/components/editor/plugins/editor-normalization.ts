import { NodeApi, Path, TNode } from "@udecode/plate";
import { createPlatePlugin, ParagraphPlugin, PlateEditor } from "@udecode/plate-core/react";
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

    editor.tf.insertNodes([{ type: TITLE_KEYS.title, children: [{ text: "", id: "1" }] }]);
  } else if (children?.[0]?.type !== TITLE_KEYS.title) {
    editor.tf.insertNodes(editor.api.create.block({ type: TITLE_KEYS.title }));
  }
}

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",

  extendEditor: ({ editor }: { editor: any }) => {
    const { normalizeNode, apply } = editor;

    editor.apply = (...args: any) => {
      // console.log(args);

      const operation = args[0] as { type: string; path: number[]; properties: { type?: string } };
      if (operation.type === "set_node" && operation.path[0] === 0 && operation.properties.type === TITLE_KEYS.title) {
        return false;
      }

      return apply(...args);
    };

    // editor.normalizeNode = (entry: any) => {
    //   const [node, _path] = entry;

    //   if (NodeApi.isEditor(node)) {
    //     const children = [...editor.children];
    //     const activeDocument = useYjsState.getState().activeDocument;
    //     const documentState = activeDocument ? useYjsState.getState().getState(activeDocument) : null;
    //     const isConnected = documentState?.status === "connected";
    //     const isSynced = documentState?.status === "synced";

    //     // console.log(children);
    //     ensureLeadingBlock(editor);

    //     if (isConnected) {
    //       // console.log("remove em");

    //       // Handle title nodes
    //       const titleNodes = children.filter((n, i) => i > 0 && n.type === TITLE_KEYS.title);
    //       if (titleNodes.length > 0) {
    //         const firstNode = children[0];
    //         const nonEmptyTitle = titleNodes.find((n) => NodeApi.string(n).length > 0);

    //         if (
    //           nonEmptyTitle &&
    //           (!firstNode || firstNode.type !== TITLE_KEYS.title || NodeApi.string(firstNode).length === 0)
    //         ) {
    //           editor.apply({ type: "insert_node", path: [0], node: nonEmptyTitle });
    //         }
    //       }

    //       // Handle subtitle nodes
    //       const subtitleNodes = children.filter((n, i) => i > 1 && n.type === TITLE_KEYS.subtitle);
    //       if (subtitleNodes.length > 0) {
    //         editor.apply({
    //           type: "insert_node",
    //           path: [1],
    //           node: { type: TITLE_KEYS.subtitle, children: [{ text: "", id: "2" }] },
    //         });
    //         const secondNode = children[1];
    //         const nonEmptySubtitle = subtitleNodes.find((n) => NodeApi.string(n).length > 0);

    //         if (
    //           nonEmptySubtitle &&
    //           (!secondNode || secondNode.type !== TITLE_KEYS.subtitle || NodeApi.string(secondNode).length === 0)
    //         ) {
    //           editor.apply({ type: "insert_node", path: [1], node: nonEmptySubtitle });
    //         }
    //       }
    //     }

    //     if (isConnected || isSynced) {
    //       editor.tf.removeNodes({
    //         at: [],
    //         match: (n: TNode) => {
    //           return !hasId(n) && n.type === ParagraphPlugin.key;
    //         },
    //       });
    //     }

    //     // Remove any title nodes after index 0
    //     editor.tf.removeNodes({
    //       at: [],
    //       match: (n: TNode, p: Path) => {
    //         return p[0] !== undefined && p[0] > 0 && "type" in n && n.type === TITLE_KEYS.title;
    //       },
    //     });

    //     // Remove any subtitle nodes after index 1
    //     editor.tf.removeNodes({
    //       at: [],
    //       match: (n: TNode, p: Path) => {
    //         return p[0] !== undefined && p[0] > 1 && "type" in n && n.type === TITLE_KEYS.subtitle;
    //       },
    //     });
    //   }

    //   return normalizeNode(entry);
    // };

    return editor;
  },
});
