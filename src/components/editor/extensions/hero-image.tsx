import { mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { type ImageOptions, ImageResize } from "./image-resize";
import ImageResizeComponent from "./image-resize-node-view";

export const HeroImage = ImageResize.extend<ImageOptions>({
  name: "heroImage",

  addOptions() {
    return {
      ...this.parent?.(),
      alignment: "wide" as const,
    };
  },

  addAttributes() {
    return {
      ...this.parent?.(),
      showControls: false,
      alignment: {
        default: "wide",
        renderHTML: () => ({
          style: "width: 50vw; max-width: 100vw;",
          class: "!max-w-none !w-screen relative left-1/2 right-1/2 -mx-[50vw]",
        }),
      },
      src: {
        default: "https://via.placeholder.com/1200x400?text=Add+Hero+Image",
        renderHTML: (attributes) => ({
          src: attributes.src,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: "hero-image",
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ["hero-image", mergeAttributes(this.options.HTMLAttributes, HTMLAttributes)];
  },

  addCommands() {
    return {
      setHeroImage:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { ...options, showControls: false, alignment: "wide" },
          });
        },
    };
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageResizeComponent);
  },
});

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    heroImage: {
      setHeroImage: (options: { src: string; alt?: string; title?: string }) => ReturnType;
    };
  }
}
