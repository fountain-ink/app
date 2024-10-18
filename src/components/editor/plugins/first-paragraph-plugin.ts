import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";

export const FirstParagraphPluginKey = new PluginKey("firstParagraph");

export const FirstParagraphPlugin = () => {
  return new Plugin({
    key: FirstParagraphPluginKey,
    state: {
      init() {
        return DecorationSet.empty;
      },
      apply(tr, oldSet) {
        let newSet = oldSet.map(tr.mapping, tr.doc);
        newSet = newSet.remove(newSet.find());

        let firstParagraphPos: number | null = null;
        tr.doc.forEach((node, pos) => {
          if (firstParagraphPos === null && node.type.name === "paragraph" && node.isBlock) {
            const content = node.textContent.trim();

            if (content.length > 0 && /^[a-zA-Z0-9]/.test(content)) {
              firstParagraphPos = pos;
              return false; // Stop searching
            }
          }
        });

        if (firstParagraphPos !== null) {
          const node = tr.doc.nodeAt(firstParagraphPos);
          if (node) {
            const decoration = Decoration.node(firstParagraphPos, firstParagraphPos + node.nodeSize, {
              class: "first-paragraph",
            });
            newSet = newSet.add(tr.doc, [decoration]);
          }
        }

        return newSet;
      },
    },
    props: {
      decorations(state) {
        return this.getState(state);
      },
    },
  });
};
