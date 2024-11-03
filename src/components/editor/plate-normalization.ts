import { type TElement, insertNodes, isEditor, removeNodes } from "@udecode/plate-common";
import { createPlatePlugin } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";

export interface NormalizePluginOptions {
  requireH1?: boolean;
  requireH2?: boolean;
}

const DEFAULT_OPTIONS: NormalizePluginOptions = {
  requireH1: true,
  requireH2: false,
};

export const NormalizePlugin = createPlatePlugin({
  key: "normalize",
  options: DEFAULT_OPTIONS,
  extendEditor: ({ editor }) => {
    const { normalizeNode } = editor;

    editor.normalizeNode = (entry) => {
      const [node] = entry;
      const nodes = node.children as TElement[];

      if (isEditor(node)) {
        let normalized = false;

        // Handle empty document case
        // if (children.length === 0) {
        //   insertNodes(
        //     editor,
        //     [
        //       { type: HEADING_KEYS.h1, children: [{ text: "" }] },
        //       { type: HEADING_KEYS.h2, children: [{ text: "" }] },
        //     ],
        //     { at: [0] },
        //   );
        //   normalized = true;
        // }

        // Ensure first node is h1
        if (!normalized && nodes?.[0]?.type !== HEADING_KEYS.h1) {
          const existingContent = nodes[0]?.children || [{ text: "" }];
          removeNodes(editor, { at: [0] });
          insertNodes(editor, { type: HEADING_KEYS.h1, children: existingContent }, { at: [0] });
          normalized = true;
        }

        // Process remaining nodes
        if (!normalized) {
          for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            // console.log(node);

            if (node?.type === HEADING_KEYS.h1 || node?.type === HEADING_KEYS.h2) {
              if (i >= 2) {
                editor.removeNodes({ at: [i] });
                normalized = true;
                break;
              }
            }

            // Handle paragraphs containing lists
            // if (node?.type === ParagraphPlugin.key) {
            //   // const childElements = child.children as TElement[];
            //   // const hasListChild = childElements.some((elem) => {
            //   //   return elem.type === "ul" || elem.type === "li";
            //   // });

            //   const hasListChild = node.listStyleType !== undefined;

            //   if (hasListChild) {
            //     console.log(node)
            //     // setNodes(editor,   { ...node, type: "span" }, {at: [i]});
            //     // removeNodes(editor, { at: [i] });
            //     // insertNodes(editor, { ...node, type: "span",  }, { at: [i] });
            //     normalized = true;
            //     break;
            //   }
            // }
          }
        }

        if (!normalized) {
          normalizeNode(entry);
        }
      } else {
        normalizeNode(entry);
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
