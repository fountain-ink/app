"use client";
import { cx } from "class-variance-authority";

import type { HocuspocusProvider } from "@hocuspocus/provider";
import Collaboration from "@tiptap/extension-collaboration";
import CollaborationCursor from "@tiptap/extension-collaboration-cursor";
import { Document } from "@tiptap/extension-document";
import Dropcursor from "@tiptap/extension-dropcursor";
import { Gapcursor } from "@tiptap/extension-gapcursor";
import Heading from "@tiptap/extension-heading";
import Paragraph from "@tiptap/extension-paragraph";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import type { AnyExtension } from "@tiptap/react";
import { common, createLowlight } from "lowlight";
import { UploadIcon } from "lucide-react";
import {
    CharacterCount,
    CodeBlockLowlight,
    Command,
    HorizontalRule,
    StarterKit,
    TaskItem,
    TaskList,
    TiptapLink,
    Twitter,
    Youtube,
    renderItems
} from "novel/extensions";
import AutoJoiner from "tiptap-extension-auto-joiner";
import { Footnote, FootnoteReference, Footnotes } from "tiptap-footnotes";
import { Markdown } from "tiptap-markdown";
import type { Doc } from "yjs";
import BlockquoteFigure from "./extensions/blockquote-figure";
import Figcaption from "./extensions/figcaption";
import { Image } from "./extensions/image";
import { Placeholder } from "./extensions/placeholder";
import Selection from "./extensions/selection";
import { suggestionItems } from "./extensions/slash-command";
import { FirstParagraphPlugin } from "./plugins/first-paragraph-plugin";
import { TrailingNode } from "./extensions/trailing-node";

interface EditorExtensionsProps {
  provider?: HocuspocusProvider | null;
  document?: Doc | null;
  userId?: string;
  userName?: string;
  userColor?: string;
}

export const defaultExtensions = ({
  provider,
  document,
  userId,
  userName = "Maxi",
  userColor = "#000000",
}: EditorExtensionsProps): AnyExtension[] => [
  Document.extend({
    content: "title subtitle? image? block+ footnotes?",
  }).configure({}),
  Paragraph.extend({
    addProseMirrorPlugins() {
      return [FirstParagraphPlugin()];
    },
  }),
  StarterKit.configure({
    document: false,
    paragraph: false,
    history: false,
    heading: false,
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
    codeBlock: false,
    code: {
      HTMLAttributes: {
        class: cx("rounded-md bg-muted  px-1.5 py-1 font-mono font-medium"),
        spellcheck: "false",
      },
    },
    dropcursor: false,
    horizontalRule: false,
    gapcursor: false,
  }),
  Heading.extend({
    name: "title",
    group: "title",
  }).configure({ levels: [1] }),
  Heading.extend({
    name: "subtitle",
    group: "subtitle",
  }).configure({
    levels: [2],
  }),
  Heading.extend({
    name: "heading",
    group: "block",
  }).configure({ levels: [3] }),
  Collaboration.configure({
    document,
  }),
  CollaborationCursor.configure({
    provider,
    user: {
      name: userName,
      color: userColor,
      id: userId,
    },
  }),
  CharacterCount.configure({ limit: 50000 }),
  Subscript,
  Superscript,
  Figcaption,
  BlockquoteFigure,
  Placeholder.configure({
    showOnlyCurrent: true,
    alwaysShowForNodes: ["title", "subtitle"],
    firstParagraphPlaceholder: "Write your story...",
    placeholder: ({ node }) => {
      if (node.type.name === "title") {
        return "Title";
      }

      if (node.type.name === "subtitle") {
        return "Add subtitle...";
      }

      if (node.type.name === "heading") {
        return "Section name";
      }

      return "Type `/` for commands";
    },
  }),
  Youtube.configure({
    HTMLAttributes: {
      class: cx("rounded-lg border aspect-video w-full h-min m-4 flex items-center justify-center"),
    },
    modestBranding: true,
    progressBarColor: "hsl(var(--accent))",
  }),
  Twitter.configure({
    addPasteHandler: true,
    HTMLAttributes: { class: cx("rounded-lg w-full flex items-center justify-center") },
  }),
  // UpdatedImage.extend({
  //   group: "block",
  //   draggable: true,
  //   addProseMirrorPlugins() {
  //     return [
  //       UploadImagesPlugin({
  //         imageClass: cx("rounded-lg"),
  //       }),
  //     ];
  //   },
  // }).configure({
  //   HTMLAttributes: {
  //     class: cx("rounded-lg border border-muted"),
  //   },
  // }),
  // HeroImage.extend({
  //   name: "heroImage",
  // }).configure({
  //   HTMLAttributes: {
  //     class: cx("rounded-lg border border-muted"),
  //   },
  // }),
  CodeBlockLowlight.configure({
    // common: covers 37 language grammars which should be good enough in most cases
    lowlight: createLowlight(common),
  }),
  Dropcursor.configure({
    color: "hsl(var(--accent))",
    width: 4,
  }),
  Gapcursor.configure({}),
  AutoJoiner.configure({}),
  TiptapLink.configure({
    HTMLAttributes: {
      class: cx(
        "text-muted-foreground underline underline-offset-[3px] hover:text-primary transition-colors cursor-pointer",
      ),
    },
  }),
  Command.configure({
    suggestion: {
      items: () => suggestionItems,
      render: renderItems,
    },
  }),
  Markdown.configure({ transformPastedText: true }),
  TextAlign.extend({
    addKeyboardShortcuts() {
      return {};
    },
  }).configure({
    types: ["heading", "paragraph"],
  }),
  TaskList.configure({
    HTMLAttributes: {
      class: cx("not-prose pl-2"),
    },
  }),
  TaskItem.configure({
    HTMLAttributes: {
      class: cx("flex items-start my-4"),
    },
    nested: true,
  }),
  HorizontalRule.configure({
    HTMLAttributes: {
      class: cx("mt-4 mb-6 border-t border-muted-foreground"),
    },
  }),
  Image.configure({
    uploadIcon: <UploadIcon size={16} />,
  }),
  Selection,
  Footnotes,
  Footnote,
  FootnoteReference,
  TrailingNode,
];
