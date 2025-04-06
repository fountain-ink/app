"use client";

import { memo } from "react";

import { withProps } from "@udecode/cn";
import { BaseParagraphPlugin, SlateLeaf } from "@udecode/plate";
import { useAIChatEditor } from "@udecode/plate-ai/react";
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { BaseBlockquotePlugin } from "@udecode/plate-block-quote";
import { BaseCodeBlockPlugin, BaseCodeLinePlugin, BaseCodeSyntaxPlugin } from "@udecode/plate-code-block";
import { BaseHeadingPlugin, HEADING_KEYS } from "@udecode/plate-heading";
import { BaseHorizontalRulePlugin } from "@udecode/plate-horizontal-rule";
import { BaseIndentPlugin } from "@udecode/plate-indent";
import { BaseIndentListPlugin } from "@udecode/plate-indent-list";
import { BaseLinkPlugin } from "@udecode/plate-link";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { usePlateEditor } from "@udecode/plate/react";

import { TodoLiStatic, TodoMarkerStatic } from "./static/indent-todo-marker-static";
import { BlockquoteElementStatic } from "./static/blockquote-element-static";
import { CodeBlockElementStatic } from "./static/code-block-element-static";
import { CodeLeafStatic } from "./static/code-leaf-static";
import { CodeLineElementStatic } from "./static/code-line-element-static";
import { CodeSyntaxLeafStatic } from "./static/code-syntax-leaf-static";
import { EditorStatic } from "./static/editor-static";
import { HeadingElementStatic } from "./static/heading-element-static";
import { HrElementStatic } from "./static/hr-element-static";
import { LinkElementStatic } from "./static/link-element-static";
import { ParagraphElementStatic } from "./static/paragraph-element-static";

const components = {
  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: "strong" }),
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: "em" }),
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: "s" }),
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: "u" }),
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: "h1" }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: "h3" }),
};

const plugins = [
  BaseBlockquotePlugin,
  BaseBoldPlugin,
  BaseCodeBlockPlugin,
  BaseCodeLinePlugin,
  BaseCodePlugin,
  BaseCodeSyntaxPlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseUnderlinePlugin,
  BaseHeadingPlugin,
  BaseHorizontalRulePlugin,
  BaseLinkPlugin,
  BaseParagraphPlugin,
  BaseIndentPlugin,
  BaseIndentListPlugin.extend({
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLiStatic,
          markerComponent: TodoMarkerStatic,
          type: "todo",
        },
      },
    },
  }),
  MarkdownPlugin,
];

export const AIChatEditor = memo(({ content }: { content: string }) => {
  const aiEditor = usePlateEditor({
    plugins,
  });

  useAIChatEditor(aiEditor, content);

  return <EditorStatic variant="aiChat" components={components} editor={aiEditor} />;
});
