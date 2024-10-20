import { Plugin, PluginKey } from "@tiptap/pm/state";
import { TiptapLink } from "novel/extensions";

export const CustomLink = TiptapLink.extend({
  inclusive: false,

  addProseMirrorPlugins() {
    const plugins = this.parent?.() || [];

    return [
      ...plugins,
      new Plugin({
        key: new PluginKey("customLinkPlugin"),
        props: {
          handleClick: (view, pos) => {
            const { state } = view;
            const selectionRange = state.selection.$from.pos === pos ? { from: pos, to: pos + 1 } : null;

            if (selectionRange) {
              const node = state.doc.nodeAt(selectionRange.from);
              const mark = node?.marks.find((mark) => mark.type.name === this.name);

              if (mark) {
                return true; // Prevent default link behavior
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});
