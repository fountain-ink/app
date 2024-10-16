import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImagePlaceholderComponent from "./image-placeholder-node-view";

type WidthOptions = "column" | "slightly-wider" | "full";
export interface ImagePlaceholderOptions {
  HTMLAttributes: Record<string, any>;
  uploadIcon: React.ReactNode;
  width?: WidthOptions;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    imagePlaceholder: {
      setImagePlaceholder: (options: { width?: WidthOptions }) => ReturnType;
    };
  }
}

export const ImagePlaceholder = Node.create<ImagePlaceholderOptions>({
  name: "imagePlaceholder",

  addOptions() {
    return {
      HTMLAttributes: {},
      uploadIcon: createElement("p", null, "⇧"),
      width: "column",
    };
  },

  group: "block",
  draggable: true,

  addAttributes() {
    return {
      width: {
        default: "column",
        renderHTML: (attributes) => {
          const width = attributes.width as WidthOptions;
          let style = "margin: 0 auto;";
          let className = "";

          switch (width) {
            case "slightly-wider":
              style += "width: 110%;";
              className = "!max-w-[110%] -ml-[5%]";
              break;
            case "full":
              style += "width: 100vw;";
              className = "!max-w-none !w-screen relative left-1/2 right-1/2 -mx-[50vw]";
              break;
            default: // column width
              style += "width: 100%;";
              className = "!max-w-full";
          }

          return { style, class: className };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "image-placeholder",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-placeholder", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setImagePlaceholder:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderComponent);
  },
});
