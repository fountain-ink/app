import Image from "@tiptap/extension-image";
import { ReactNodeViewRenderer } from "@tiptap/react";
import ImageResizeComponent from "../ImageResizeComponent";

export const ImageResize = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      style: {
        default: null,
        parseHTML: (element) => element.getAttribute("style"),
        renderHTML: (attributes) => {
          if (!attributes.style) {
            return {};
          }

          return {
            style: attributes.style,
          };
        },
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});
