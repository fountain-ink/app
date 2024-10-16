import { Node, mergeAttributes } from "@tiptap/core";

export const FirstParagraph = Node.create({
  name: "firstParagraph",
  group: "block",
  content: "inline*",
  priority: 1000,

  parseHTML() {
    return [{ tag: "p.first-paragraph" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["p", mergeAttributes(HTMLAttributes, { class: "first-paragraph prose-p" }), 0];
  },
  

  addAttributes() {
    return {
      class: {
        default: "first-paragraph",
      },
    };
  },
});
