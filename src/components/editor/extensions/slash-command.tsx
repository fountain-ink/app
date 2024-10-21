"use client";

import { Asterisk, CheckSquare, Code, HeadingIcon, ImageIcon, List, ListOrdered, Text, TextQuote } from "lucide-react";
import { createSuggestionItems } from "novel/extensions";

export const suggestionItems = createSuggestionItems([
  {
    title: "Heading",
    description: "A section heading.",
    searchTerms: ["title", "big", "large"],
    icon: <HeadingIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Text",
    description: "Simple paragraph.",
    searchTerms: ["p", "paragraph"],
    icon: <Text size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "Image",
    description: "Add an image.",
    searchTerms: ["photo", "picture", "media", "image", "placeholder"],
    icon: <ImageIcon size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setImage({ src: "" }).run();
    },
  },
  {
    title: "Check List",
    description: "Track tasks with a check list.",
    searchTerms: ["todo", "task", "list", "check", "checkbox"],
    icon: <CheckSquare size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    searchTerms: ["unordered", "point"],
    icon: <List size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    searchTerms: ["ordered"],
    icon: <ListOrdered size={18} />,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    searchTerms: ["blockquote"],
    icon: <TextQuote size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).setBlockquote().run(),
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    searchTerms: ["codeblock"],
    icon: <Code size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run(),
  },
  {
    title: "Footnote",
    description: "Add a footnote.",
    searchTerms: ["footnote", "footnotes", "reference", "source"],
    icon: <Asterisk size={18} />,
    command: ({ editor, range }) => editor.chain().focus().deleteRange(range).addFootnote().run(),
  },
]);
