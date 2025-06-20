import { ElementApi, NodeApi, type TNode } from "@udecode/plate";
import { createPlatePlugin } from "@udecode/plate/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ParagraphPlugin } from "@udecode/plate-core/react";

export const withBlockquoteNormalize = ({ editor, tf }: { editor: any; tf: any }) => {
  const { normalizeNode } = tf;

  return {
    normalizeNode: ([currentNode, currentPath]: [TNode, number[]]) => {
      if (ElementApi.isElement(currentNode) && currentNode.type === BlockquotePlugin.key) {
        for (const [child, childPath] of NodeApi.children(editor, currentPath)) {
          if (ElementApi.isElement(child) && child.type === ParagraphPlugin.key) {
            editor.tf.unwrapNodes({
              at: childPath,
              match: (n: TNode) => ElementApi.isElement(n) && n.type === ParagraphPlugin.key,
            });

            return;
          }
        }
      }

      return normalizeNode([currentNode, currentPath]);
    },
  };
};

export const BlockquoteNormalizePlugin = createPlatePlugin({
  key: "blockquoteNormalize",
  options: {},
}).extendEditorTransforms(withBlockquoteNormalize);
