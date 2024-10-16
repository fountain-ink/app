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

        // Remove all existing decorations
        newSet = newSet.remove(newSet.find());

        // Find the first paragraph
        let firstParagraphPos: number | null = null;
        tr.doc.nodesBetween(0, tr.doc.content.size, (node, pos) => {
          if (firstParagraphPos === null && node.type.name === "paragraph") {
            firstParagraphPos = pos;
            return false; // Stop searching
          }
          return true;
        });

        if (firstParagraphPos !== null) {
          const node = tr.doc.nodeAt(firstParagraphPos);
          if (node) {
            const decoration = Decoration.node(firstParagraphPos, firstParagraphPos + node.nodeSize, { class: "first-paragraph" });
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
