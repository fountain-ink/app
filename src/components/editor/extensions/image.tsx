import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImageComponent from "./image-node-view";

type WidthOptions = "column" | "wide" | "full";

export interface ImageOptions {
  HTMLAttributes: Record<string, any>;
  uploadIcon: React.ReactNode;
  width?: WidthOptions;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: {
        src: string;
        alt?: string;
        title?: string;
      }) => ReturnType;
    };
  }
}

export type ImageWidthOptions = "column" | "wide" | "full";

export const IMAGE_WIDTH_CLASSES = {
  wide: "w-[160%] -ml-[30%] max-w-[160%]",
  full: "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  column: "w-full max-w-full",
} as const;

export const Image = Node.create<ImageOptions>({
  name: "image",
  group: "block",

  isolating: false,
  atom: true,
  leaf: true,
  draggable: true,
  selectable: true,

  addOptions() {
    return {
      HTMLAttributes: {},
      uploadIcon: createElement("p", null, "⇧"),
      width: "column",
    };
  },

  addAttributes() {
    return {
      src: {
        default: null,
      },
      width: {
        default: "column",
        renderHTML: (attributes) => {
          const width = attributes.width as ImageWidthOptions;
          return {
            class: IMAGE_WIDTH_CLASSES[width],
          };
        },
      },
    };
  },

  parseHTML() {
    return [{ tag: "img" }];
  },

  renderHTML({ HTMLAttributes }) {
    const { src, ...rest } = HTMLAttributes;

    if (!src) {
      return ["div", { class: "image-placeholder" }];
    }

    return ["img", mergeAttributes(this.options.HTMLAttributes, { src, ...rest })];
  },

  addCommands() {
    return {
      setImage:
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
    return ReactNodeViewRenderer(ImageComponent);
  },
});
