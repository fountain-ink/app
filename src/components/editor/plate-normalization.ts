import { type TElement, insertNodes, isEditor, removeNodes } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { Node } from "slate";

export interface NormalizePluginOptions {
  requireH1?: boolean;
  requireH2?: boolean;
}

const DEFAULT_OPTIONS: NormalizePluginOptions = {
  requireH1: true,
  requireH2: false,
};

const initial = { type: "p", children: [{ text: "" }] };
// const matchesInitial = (node: TElement) =>
//   Node.matches(node, initial) && node.children.length === 1 && node.children[0]?.text == "";

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",
  options: DEFAULT_OPTIONS,

  extendEditor: ({ editor, useOption }) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
      const [node, path] = entry;

      if (isEditor(node)) {
        const nodes = node.children as TElement[];
        let normalized = false;

        console.log(nodes);

        // if (nodes.length > 1 && nodes[0] && matchesInitial(nodes[0]) && nodes[1] && matchesInitial(nodes[1])) {
        //   console.log("REMOVE INTIAL");
        //   return removeNodes(editor, { at: [0, 1] });
        // }

        // if (nodes.length > 1 && nodes[0] && !matchesInitial(nodes[0]) && nodes[1] && matchesInitial(nodes[1])) {
        //   console.log("INSRET INTIAL");
        //   return insertNodes(editor, initial, { at: [0] });
        // }

        // Ensure first node is h1
        if (!normalized && (nodes.length === 0 || nodes[0]?.type !== HEADING_KEYS.h1)) {
          console.log("ENSURE H1");
          const existingContent = nodes[0]?.children || [{ text: "" }];
          if (nodes.length > 0) {
            removeNodes(editor, { at: [0] });
          }
          insertNodes(editor, { type: HEADING_KEYS.h1, children: existingContent }, { at: [0] });
          normalized = true;
        }

        // Ensure second node is h2
        if (!normalized && (nodes.length < 2 || nodes[1]?.type !== HEADING_KEYS.h2)) {
          console.log("ENSURE H2");
          const existingContent = nodes[1]?.children || [{ text: "" }];
          if (nodes.length > 1) {
            removeNodes(editor, { at: [1] });
          }
          insertNodes(editor, { type: HEADING_KEYS.h2, children: existingContent }, { at: [1] });
          normalized = true;
        }

        // Remove any additional h1 or h2 nodes
        if (!normalized) {
          console.log("ENSURE REMOVE");
          for (let i = 2; i < nodes.length; i++) {
            if (nodes[i]?.type === HEADING_KEYS.h1 || nodes[i]?.type === HEADING_KEYS.h2) {
              removeNodes(editor, { at: [i] });
              normalized = true;
              break;
            }
          }
        }

      //   if (!normalized) {
      //     normalizeNode(entry);
      //   }
      // } else {
      //   normalizeNode(entry);
      // }
      }
    };

    return editor;
  },
});

// Configure plugin with options if needed
export const ConfiguredNormalizePlugin = NormalizePlugin.configure({
  options: {
    requireH1: true,
    requireH2: true,
  },
});
