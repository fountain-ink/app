"use client";

import type { AutoformatRule } from "@udecode/plate-autoformat";

import { type SlateEditor, ElementApi, isType } from "@udecode/plate";
import {
  autoformatArrow,
  autoformatFraction,
  autoformatEquality,
  autoformatComparison,
  autoformatLegal,
  autoformatLegalHtml,
  autoformatSubscriptNumbers,
  autoformatSuperscriptNumbers,
  autoformatSubscriptSymbols,
  autoformatSuperscriptSymbols,
  autoformatPunctuation,
  autoformatSmartQuotes,
  autoformatOperation,
} from "@udecode/plate-autoformat";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { insertEmptyCodeBlock } from "@udecode/plate-code-block";
import { CodeBlockPlugin, CodeLinePlugin } from "@udecode/plate-code-block/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { INDENT_LIST_KEYS, ListStyleType, toggleIndentList } from "@udecode/plate-indent-list";
import { openNextToggles, TogglePlugin } from "@udecode/plate-toggle/react";
import { ParagraphPlugin } from "@udecode/plate/react";
import { TodoListPlugin } from "@udecode/plate-list/react";
import { NumberedListPlugin } from "@udecode/plate-list/react";
import { ListItemPlugin } from "@udecode/plate-list/react";
import { BulletedListPlugin } from "@udecode/plate-list/react";
import { toggleList, TTodoListItemElement } from "@udecode/plate-list";

export const format = (editor: SlateEditor, customFormatting: any) => {
  if (editor.selection) {
    const parentEntry = editor.api.parent(editor.selection);

    if (!parentEntry) return;

    const [node] = parentEntry;

    if (
      ElementApi.isElement(node) &&
      !isType(editor, node, CodeBlockPlugin.key) &&
      !isType(editor, node, CodeLinePlugin.key)
    ) {
      customFormatting();
    }
  }
};

export const formatList = (editor: SlateEditor, elementType: string) => {
  format(editor, () =>
    toggleList(editor, {
      type: elementType,
    }),
  );
};

export const autoformatMarks: AutoformatRule[] = [
  {
    match: "***",
    mode: "mark",
    type: [BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: "__*",
    mode: "mark",
    type: [UnderlinePlugin.key, ItalicPlugin.key],
  },
  {
    match: "__**",
    mode: "mark",
    type: [UnderlinePlugin.key, BoldPlugin.key],
  },
  {
    match: "___***",
    mode: "mark",
    type: [UnderlinePlugin.key, BoldPlugin.key, ItalicPlugin.key],
  },
  {
    match: "**",
    mode: "mark",
    type: BoldPlugin.key,
  },
  {
    match: "__",
    mode: "mark",
    type: UnderlinePlugin.key,
  },
  {
    match: "*",
    mode: "mark",
    type: ItalicPlugin.key,
  },
  {
    match: "_",
    mode: "mark",
    type: ItalicPlugin.key,
  },
  {
    match: "~~",
    mode: "mark",
    type: StrikethroughPlugin.key,
  },
  {
    match: "^",
    mode: "mark",
    type: SuperscriptPlugin.key,
  },
  {
    match: "~",
    mode: "mark",
    type: SubscriptPlugin.key,
  },
  {
    match: "`",
    mode: "mark",
    type: CodePlugin.key,
  },
];

export const autoformatBlocks: AutoformatRule[] = [
  {
    match: "# ",
    mode: "block",
    type: HEADING_KEYS.h1,
  },
  {
    match: "## ",
    mode: "block",
    type: HEADING_KEYS.h2,
  },
  {
    match: "### ",
    mode: "block",
    type: HEADING_KEYS.h3,
  },
  {
    match: "#### ",
    mode: "block",
    type: HEADING_KEYS.h4,
  },
  {
    match: "##### ",
    mode: "block",
    type: HEADING_KEYS.h5,
  },
  {
    match: "###### ",
    mode: "block",
    type: HEADING_KEYS.h6,
  },
  {
    match: "> ",
    mode: "block",
    type: BlockquotePlugin.key,
  },
  {
    match: "```",
    mode: "block",
    type: CodeBlockPlugin.key,
    format: (editor) => {
      insertEmptyCodeBlock(editor, {
        defaultType: ParagraphPlugin.key,
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    match: "+ ",
    mode: "block",
    preFormat: openNextToggles,
    type: TogglePlugin.key,
  },
  {
    match: ["---", "—-", "___ "],
    mode: "block",
    type: HorizontalRulePlugin.key,
    format: (editor) => {
      editor.tf.setNodes({ type: HorizontalRulePlugin.key });
      editor.tf.insertNodes({
        children: [{ text: "" }],
        type: ParagraphPlugin.key,
      });
    },
  },
];

export const autoformatIndentLists: AutoformatRule[] = [
  {
    match: ["* ", "- "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    match: [String.raw`^\d+\.$ `, String.raw`^\d+\)$ `],
    matchByRegex: true,
    mode: "block",
    type: "list",
    format: (editor) =>
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      }),
  },
  {
    match: ["[] "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: INDENT_LIST_KEYS.todo,
      });
      editor.tf.setNodes({
        checked: false,
        listStyleType: INDENT_LIST_KEYS.todo,
      });
    },
  },
  {
    match: ["[x] "],
    mode: "block",
    type: "list",
    format: (editor) => {
      toggleIndentList(editor, {
        listStyleType: INDENT_LIST_KEYS.todo,
      });
      editor.tf.setNodes({
        checked: true,
        listStyleType: INDENT_LIST_KEYS.todo,
      });
    },
  },
];

export const autoformatLists: AutoformatRule[] = [
  {
    format: (editor) => formatList(editor, BulletedListPlugin.key),
    match: ["* ", "- "],
    mode: "block",
    type: ListItemPlugin.key,
  },
  {
    format: (editor) => formatList(editor, NumberedListPlugin.key),
    match: ["^\\d+\\.$ ", "^\\d+\\)$ "],
    matchByRegex: true,
    mode: "block",
    type: ListItemPlugin.key,
  },
  {
    match: "[] ",
    mode: "block",
    type: TodoListPlugin.key,
  },
  {
    format: (editor) =>
      editor.tf.setNodes<TTodoListItemElement>(
        { checked: true, type: TodoListPlugin.key },
        {
          match: (n) => editor.api.isBlock(n),
        },
      ),
    match: "[x] ",
    mode: "block",
    type: TodoListPlugin.key,
  },
];

export const autoformatMath = [
  ...autoformatComparison,
  ...autoformatEquality,
  ...autoformatFraction,
  ...autoformatSuperscriptSymbols,
  ...autoformatSubscriptSymbols,
  ...autoformatSuperscriptNumbers,
  ...autoformatSubscriptNumbers,
];

export const autoformatPlugin = AutoformatPlugin.configure({
  options: {
    enableUndoOnDelete: true,
    rules: [
      ...autoformatBlocks,
      ...autoformatMarks,
      ...autoformatSmartQuotes,
      ...autoformatPunctuation,
      ...autoformatLegal,
      ...autoformatLegalHtml,
      ...autoformatArrow,
      ...autoformatMath,
      ...autoformatIndentLists,
    ],
  },
});

export const autoformatRules = [
  ...autoformatBlocks,
  ...autoformatMarks,
  ...autoformatSmartQuotes,
  ...autoformatPunctuation,
  ...autoformatLegal,
  ...autoformatLegalHtml,
  ...autoformatArrow,
  ...autoformatMath,
  ...autoformatLists,
];
