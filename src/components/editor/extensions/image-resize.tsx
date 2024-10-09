import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImageResizeComponent from "./image-resize-node-view";

type AlignmentOptions = "left" | "center" | "right" | "wide";

export interface ImageOptions {
  inline: boolean;
  allowBase64: boolean;
  HTMLAttributes: Record<string, any>;
  resizeIcon: React.ReactNode;
  alignment?: AlignmentOptions;
  showControls?: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    image: {
      setImage: (options: { src: string; alt?: string; title?: string; alignment?: AlignmentOptions; showControls?: boolean }) => ReturnType;
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
      showControls: true,
      alignment: {
        default: 'center',
        renderHTML: (attributes) => {
          const alignment = attributes.alignment as AlignmentOptions;
          let style = '';
          let className = '';

          switch (alignment) {
            case 'left':
              style = 'float: left; margin-right: 1rem;';
              break;
            case 'right':
              style = 'float: right; margin-left: 1rem;';
              break;
            case 'wide':
              style = 'width: 50vw; max-width: 100vw;';
              className = '!max-w-none !w-screen relative left-1/2 right-1/2 -mx-[50vw]';
              break;
            default:
              style = 'display: block; margin: 0 auto;';
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
            attrs: options,
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
    return ReactNodeViewRenderer(ImageResizeComponent );
  },
});
