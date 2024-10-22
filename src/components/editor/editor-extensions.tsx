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
import Underline from "@tiptap/extension-underline";
import type { AnyExtension } from "@tiptap/react";
import { cx } from "class-variance-authority";
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
  renderItems,
} from "novel/extensions";
import AutoJoiner from "tiptap-extension-auto-joiner";
import { Footnote, FootnoteReference, Footnotes } from "tiptap-footnotes";
import { Markdown } from "tiptap-markdown";
import type { Doc } from "yjs";
import { arrowHandlers } from "./arrow-handlers";
import BlockquoteFigure from "./extensions/blockquote-figure";
import Figcaption from "./extensions/figcaption";
import { Image } from "./extensions/image";
import { Placeholder } from "./extensions/placeholder";
import Selection from "./extensions/selection";
import { suggestionItems } from "./extensions/slash-command";
import { TrailingNode } from "./extensions/trailing-node";
import { FirstParagraphPlugin } from "./plugins/first-paragraph-plugin";

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
    addKeyboardShortcuts() {
      return {
        ArrowDown: () => arrowHandlers.handleArrowDown(this.editor),
        ArrowUp: () => arrowHandlers.handleArrowUp(this.editor),
        "Shift-Enter": () => this.editor.commands.enter(),
        "Mod-Enter": () => this.editor.commands.enter(),
      };
    },
  }),
  StarterKit.configure({
    document: false,
    paragraph: false,
    history: false,
    heading: false,
    bulletList: {
      HTMLAttributes: {
        class: cx("text-foreground list-disc list-outside leading-3 -mt-2"),
      },
    },
    orderedList: {
      HTMLAttributes: {
        class: cx("text-foreground list-decimal list-outside leading-3 -mt-2"),
      },
    },
    listItem: {
      HTMLAttributes: {
        class: cx("text-foreground leading-normal -mb-2"),
      },
    },
    blockquote: false,
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
    marks: "",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          const { editor } = this;
          if (editor.isActive("title")) {
            const titleNode = editor.state.doc.firstChild;
            if (titleNode) {
              const endPos = titleNode.nodeSize;
              const subtitleNode = editor.state.doc.nodeAt(endPos);

              if (subtitleNode && subtitleNode.type.name === "subtitle") {
                editor.commands.focus(endPos + 1);
              } else {
                editor
                  .chain()
                  .focus()
                  .insertContentAt(endPos, { type: "subtitle", attrs: { level: 2 } })
                  .focus(endPos + 1)
                  .run();
              }
              return true;
            }
          }

          return true;
        },
      };
    },
  }).configure({ levels: [1] }),
  Heading.extend({
    name: "subtitle",
    group: "title",
    marks: "",
    addKeyboardShortcuts() {
      return {
        Enter: () => {
          if (this.editor.isActive("subtitle")) {
            const { state } = this.editor;
            const subtitlePos = state.selection.$from.start() - 1;
            const subtitleNode = state.doc.nodeAt(subtitlePos);

            if (subtitleNode) {
              const endPos = subtitlePos + subtitleNode.nodeSize;
              const nextNode = state.doc.nodeAt(endPos);

              if (nextNode) {
                this.editor.commands.focus(endPos + 1);
              } else {
                this.editor.commands.insertContentAt(endPos, { type: 'paragraph' });
                this.editor.commands.focus(endPos + 1);
              }
              return true;
            }
          }
          return false;
        },
      };
    },
  }).configure({
    levels: [2],
  }),
  Heading.extend({
    name: "heading",
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
        return "Heading";
      }

      if (node.type.name === "codeBlock") {
        return "";
      }

      return "Type `/` for commands";
    },
  }),
  Youtube.configure({
    HTMLAttributes: {
      class: cx("rounded-lg border aspect-video w-full h-min m-4 flex items-center justify-center not-prose "),
    },
    modestBranding: true,
    progressBarColor: "hsl(var(--accent))",
  }),
  Twitter.configure({
    addPasteHandler: true,
    HTMLAttributes: { class: cx("rounded-lg w-full flex items-center justify-center not-prose") },
  }),
  Underline,
  CodeBlockLowlight.configure({
    // common: covers 37 language grammars
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
    openOnClick: false,
    linkOnPaste: true,
    autolink: true,
    protocols: ["http", "https", "mailto", "tel"],
    validate: (href) => /^https?:\/\//.test(href),
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
