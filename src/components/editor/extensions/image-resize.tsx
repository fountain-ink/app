import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImageResizeComponent from "./image-resize-node-view";

type AlignmentOptions = "left" | "center" | "right" | "wide";

type WidthOptions = "column" | "wide" | "full";
export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  resizeIcon: React.ReactNode;
  alignment?: AlignmentOptions;
  width?: WidthOptions;
  showControls?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string; alignment?: AlignmentOptions; width?: WidthOptions }) => ReturnType;
    };
  }
}

export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/;

export const ImageResize = Node.create<ImageOptions>({
  name: "resizableImage",

  addOptions() {
    return {
      inline: false,
      allowBase64: false,
      alignment: "center",
      width: "column",
      HTMLAttributes: {},
      resizeIcon: createElement("p", null, "⇲"),
    };
  },

  group: "block",
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: "100%",
        renderHTML: (attributes) => {
          return {
            width: attributes.width,
          };
        },
      },
      height: {
        default: "auto",
        renderHTML: (attributes) => {
          return {
            height: attributes.height,
          };
        },
      },
      showControls: {
        default: true,
        renderHTML: (attributes) => {
          return {
            showControls: attributes.showControls,
          };
        },
      },
      alignment: {
        default: "center",
        renderHTML: (attributes) => {
          const alignment = attributes.alignment as AlignmentOptions;
          let style = "";
          let className = "";

          switch (alignment) {
            case "left":
              style = "float: left; margin-right: 1rem;";
              break;
            case "right":
              style = "float: right; margin-left: 1rem;";
              break;
            case "wide":
              style = "width: 50vw; max-width: 100vw;";
              className = "!max-w-none !w-screen relative left-1/2 right-1/2 -mx-[50vw]";
              break;
            default:
              style = "display: block; margin: 0 auto;";
          }

          return { style, class: className };
        },
      },
      imageWidth: {
        default: "column",
        renderHTML: (attributes) => {
          const width = attributes.imageWidth as WidthOptions;
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
        tag: "image-resizer",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["image-resizer", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },
  addCommands() {
    return {
      setImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              ...options,
              imageWidth: options.width || 'column',
            },
          });
        },
    };
  },

  addInputRules() {
    return [
      nodeInputRule({
        find: inputRegex,
        type: this.type,
        getAttributes: (match) => {
          const [, , alt, src, title] = match;

          return { src, alt, title };
        },
      }),
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});
