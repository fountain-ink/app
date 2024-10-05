// import Image from "@tiptap/extension-image";
// import { ReactNodeViewRenderer } from "@tiptap/react";
// import ImageResizeComponent from "./image-resize-node-view";

// export const ImageResize = Image.extend({
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       width: {
//         default: "100%",
//         renderHTML: (attributes) => {
//           return {
//             width: attributes.width,
//           };
//         },
//       },
//       height: {
//         default: "auto",
//         renderHTML: (attributes) => {
//           return {
//             height: attributes.height,
//           };
//         },
//       },
//       draggable: {
//               default: true,
//             },
//       align: {
//         default: "center",
//         renderHTML: (attributes) => {
//           return {
//             "data-align": attributes.align,
//           };
//         },
//       },
//     };
//   },
//   addNodeView() {
//     return ReactNodeViewRenderer(ImageResizeComponent);
//   },
// });

// import type {Component, FC, ReactElement} from "react";
// import {mergeAttributes, nodeInputRule, Node} from "@tiptap/core";
// import {ReactNodeViewRenderer} from "@tiptap/react";
// import Image from '@tiptap/extension-image'
// import ImageResizeComponent from "./image-resize-node-view";

// export interface ImageOptions {
//   inline: boolean,
//   allowBase64: boolean,
//   HTMLAttributes: Record<string, any>,
//   resizeIcon: FC|Component|ReactElement,
//   useFigure: boolean
// }
// declare module '@tiptap/core' {
//   interface Commands<ReturnType> {
//     imageResize: {
//       setImage: (options: { src: string, alt?: string, title?: string, width?: string|number, height?: string|number, isDraggable?: boolean }) => ReturnType,
//     }
//   }
// }
// export const inputRegex = /(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

// export const ImageResize = Image.extend<ImageOptions>({
//   name: "imageResize",
//   addOptions() {
//     return {
//       inline: false,
//       allowBase64: false,
//       HTMLAttributes: {},
//       resizeIcon: <>⊙</>,
//       useFigure: false
//     }
//   },
//   addAttributes() {
//     return {
//       ...this.parent?.(),
//       width: {
//         default: '100%',
//         renderHTML: (attributes) => {
//           return {
//             width: attributes.width
//           };
//         }
//       },
//       height: {
//         default: 'auto',
//         renderHTML: (attributes) => {
//           return {
//             height: attributes.height
//           };
//         }
//       },
//     };
//   },

//   addNodeView() {
//     return ReactNodeViewRenderer(ImageResizeComponent)
//   },
//   addInputRules() {
//     return [
//       nodeInputRule({
//         find: inputRegex,
//         type: this.type,
//         getAttributes: match => {
//           const [,, alt, src, title, height, width, isDraggable] = match
//           return { src, alt, title, height, width, isDraggable }
//         },
//       }),
//     ]
//   },
// })
import { Node, mergeAttributes, nodeInputRule } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { createElement } from "react";
import ImageResizeComponent from "./image-resize-node-view";

  export interface ImageOptions {
    inline: boolean,
    allowBase64: boolean,
    HTMLAttributes: Record<string, any>,
  }

  declare module '@tiptap/core' {
    interface Commands<ReturnType> {
      image: {
        /**
         * Add an image
         */
        setImage: (options: { src: string, alt?: string, title?: string }) => ReturnType,
      }
    }
  }

  export const inputRegex = /(?:^|\s)(!\[(.+|:?)]\((\S+)(?:(?:\s+)["'](\S+)["'])?\))$/

  export const ImageResize = Node.create<ImageOptions>({
    name: 'resizableImage',

    addOptions() {
      return {
        inline: false,
        allowBase64: false,
        HTMLAttributes: {},
        resizeIcon: createElement("p", null, "⇲")
      }
    },

    inline() {
      return this.options.inline
    },

    group() {
      return this.options.inline ? 'inline' : 'block'
    },

    draggable: false,

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
              default: '100%',
              renderHTML: (attributes) => {
                return {
                  width: attributes.width
                };
              }
            },
            height: {
              default: 'auto',
              renderHTML: (attributes) => {
                return {
                  height: attributes.height
                };
              }
            }
      }
    },

    parseHTML() {
        return [
          {
            tag: 'image-resizer',
          },
        ]
      },

      renderHTML({ HTMLAttributes }) {
        return ['image-resizer', mergeAttributes(this.options.HTMLAttributes,HTMLAttributes)]
      },


      addNodeView() {
        return ReactNodeViewRenderer(ImageResizeComponent)
      },

    addCommands() {
      return {
        setImage: options => ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: options,
          })
        },
      }
    },

    addInputRules() {
      return [
        nodeInputRule({
          find: inputRegex,
          type: this.type,
          getAttributes: match => {
            const [,, alt, src, title] = match

            return { src, alt, title }
          },
        }),
      ]
    },
  })
