"use client";
import { cx } from "class-variance-authority";

import { getIpfsImageUrl } from "@/components/images/image-uploader";
import { uploadFileFormData } from "@/lib/upload-utils";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import { Image } from "@tiptap/extension-image";
import { common, createLowlight } from "lowlight";
import {
  CodeBlockLowlight,
  HorizontalRule,
  Placeholder,
  StarterKit,
  TaskItem,
  TaskList,
  TiptapImage,
  TiptapLink,
  Twitter,
  UpdatedImage,
  Youtube,
} from "novel/extensions";
import { UploadImagesPlugin } from "novel/plugins";
import AutoJoiner from "tiptap-extension-auto-joiner";
import GlobalDragHandle from "tiptap-extension-global-drag-handle";
import ImageResize from "tiptap-extension-resize-image";
import { ResizableMedia } from "./resizable-media";
import { TrailingNode } from "./trailing-node";

const starterKit = StarterKit.configure({
  history: false,
  bulletList: {
    HTMLAttributes: {
      class: cx("list-disc list-outside leading-3 -mt-2"),
    },
  },
  orderedList: {
    HTMLAttributes: {
      class: cx("list-decimal list-outside leading-3 -mt-2"),
    },
  },
  listItem: {
    HTMLAttributes: {
      class: cx("leading-normal -mb-2"),
    },
  },
  blockquote: {
    HTMLAttributes: {
      class: cx("border-l-4 border-primary"),
    },
  },
  codeBlock: {
    HTMLAttributes: {
      class: cx("rounded-sm bg-muted border p-5 font-mono font-medium"),
    },
  },
  code: {
    HTMLAttributes: {
      class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
      spellcheck: "false",
    },
  },
  dropcursor: {
    color: "hsl(var(--accent))",
    width: 4,
  },
  horizontalRule: false,
  gapcursor: false,
});

const tiptapImage = TiptapImage.extend({
  // addProseMirrorPlugins() {
  //   return [
  //     UploadImagesPlugin({
  //       imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
  //     }),
  //   ];
  // },
}).configure({
  allowBase64: true,
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

const updatedImage = UpdatedImage.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
})
  // .extend({ addNodeView: () => ReactNodeViewRenderer(ResizableMediaNodeView) })
  .configure({
    HTMLAttributes: {
      class: cx("rounded-lg border border-muted"),
    },
  });

const placeholder = Placeholder.configure({
  placeholder: ({ node }) => {
    if (node.type.name === "heading") {
      return "What’s the title?";
    }

    return "";
  },
});

const tiptapLink = TiptapLink.configure({
  HTMLAttributes: {
    class: cx(
      "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
    ),
  },
});

const taskList = TaskList.configure({
  HTMLAttributes: {
    class: cx("not-prose pl-2"),
  },
});

const taskItem = TaskItem.configure({
  HTMLAttributes: {
    class: cx("flex items-start my-4"),
  },
  nested: true,
});

const horizontalRule = HorizontalRule.configure({
  HTMLAttributes: {
    class: cx("mt-4 mb-6 border-t border-muted-foreground"),
  },
});

const dragHandle = GlobalDragHandle.configure({
  dragHandleWidth: 300,
  scrollTreshold: 400,
  dragHandleSelector: ".custom-drag-handle", // default is undefined
  excludedTags: [],
});

const autoJoiner = AutoJoiner.configure({});
const youtube = Youtube.configure({
  HTMLAttributes: {
    class: cx("rounded-lg border aspect-video w-full h-min m-4 flex items-center justify-center"),
  },
  modestBranding: true,
  progressBarColor: "hsl(var(--accent))",
});

const twitter = Twitter.configure({
  addPasteHandler: true,
  HTMLAttributes: { class: cx("rounded-lg w-full flex items-center justify-center") },
});

// const dragAndDrop = DragAndDrop.configure({});

const codeBlockLowlight = CodeBlockLowlight.configure({
  // common: covers 37 language grammars which should be good enough in most cases
  lowlight: createLowlight(common),
});

const dropCursor = Dropcursor.configure({
  color: "hsl(var(--accent))",
  width: 4,
});

const gapCursor = Gapcursor.configure({});

const trailingNode = TrailingNode.configure({});

const resizableMedia = ResizableMedia.configure({
  uploadFn: async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("handle", "global");
    const result = await uploadFileFormData(formData);
    return getIpfsImageUrl(result);
  },
});

const imageResize = ImageResize.extend({
  // addProseMirrorPlugins() {
  //   return [
  //     UploadImagesPlugin({
  //       imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
  //     }),
  //   ];
  // },
}).configure({});

const image = Image.extend({
  addProseMirrorPlugins() {
    return [
      UploadImagesPlugin({
        imageClass: cx("opacity-40 rounded-lg border border-stone-200"),
      }),
    ];
  },
}).configure({
  HTMLAttributes: {
    class: cx("rounded-lg border border-muted"),
  },
});

export const defaultExtensions = [
  starterKit,
  placeholder,
  youtube,
  twitter,
  updatedImage,
  // image,
  // tiptapImage,
  imageResize,
  // tiptapImage,
  // ImageResizer,
  codeBlockLowlight,
  // dragHandle,
  // dragAndDrop,
  // resizableMedia,
  dropCursor,
  trailingNode,
  gapCursor,
  autoJoiner,
  tiptapLink,
  taskList,
  taskItem,
  horizontalRule,
];
