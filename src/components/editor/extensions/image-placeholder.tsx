import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImagePlaceholderComponent from "./image-placeholder-node-view";

type WidthOptions = "column" | "wide" | "full";
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
      src: {
        default: null,
      },
      width: {
        default: "column",
        renderHTML: (attributes) => {
          const width = attributes.width as WidthOptions;
          let style = "margin: 0 auto;";
          let className = "";

          switch (width) {
            case "wide":
              style += "width: 120%;";
              className = "!max-w-[120%] -ml-[10%]";
              break;
            case "full":
              style += "width: 100vw; max-width: 1800px;";
              className = "!w-screen !max-w-[1800px] mx-auto";
              break;
            default: 
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
            attrs: { ...options, src: null },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImagePlaceholderComponent);
  },
});
