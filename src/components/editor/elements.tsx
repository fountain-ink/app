"use client";

import { BlockquoteElement } from "@/components/ui/blockquote-element";
import { CodeBlockElement } from "@/components/ui/code-block-element";
import { CodeLeaf } from "@/components/ui/code-leaf";
import { CodeLineElement } from "@/components/ui/code-line-element";
import { CodeSyntaxLeaf } from "@/components/ui/code-syntax-leaf";
import { ColumnElement } from "@/components/ui/column-element";
import { ColumnGroupElement } from "@/components/ui/column-group-element";
import { CommentLeaf } from "@/components/ui/comment-leaf";
import { DateElement } from "@/components/ui/date-element";
import { HeadingElement } from "@/components/ui/heading-element";
import { HrElement } from "@/components/ui/hr-element";
import { ImageElement } from "@/components/ui/image-element";
import { LinkElement } from "@/components/ui/link-element";
import { MediaEmbedElement } from "@/components/ui/media-embed-element";
import { MentionElement } from "@/components/ui/mention-element";
import { MentionInputElement } from "@/components/ui/mention-input-element";
import { ParagraphElement } from "@/components/ui/paragraph-element";
import { withPlaceholders } from "@/components/ui/placeholder";
import { SlashInputElement } from "@/components/ui/slash-input-element";
import { TableCellElement, TableCellHeaderElement } from "@/components/ui/table-cell-element";
import { TableElement } from "@/components/ui/table-element";
import { TableRowElement } from "@/components/ui/table-row-element";
import { TocElement } from "@/components/ui/toc-element";
import { ToggleElement } from "@/components/ui/toggle-element";
import { withDraggables } from "@/components/ui/with-draggables";
import { withProps } from "@udecode/cn";
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from "@udecode/plate-code-block/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import { ParagraphPlugin, PlateLeaf } from "@udecode/plate-common/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { BulletedListPlugin, ListItemPlugin, NumberedListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
import { EquationPlugin, InlineEquationPlugin } from "@udecode/plate-math/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { MentionInputPlugin, MentionPlugin } from "@udecode/plate-mention/react";
import { SlashInputPlugin } from "@udecode/plate-slash-command/react";
import { TableCellHeaderPlugin, TableCellPlugin, TablePlugin, TableRowPlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { EquationElement } from "../ui/equation-element";
import { HighlightLeaf } from "../ui/highlight-leaf";
import { InlineEquationElement } from "../ui/inline-equation-element";
import { KbdLeaf } from "../ui/kbd-leaf";
import { ListElement } from "../ui/list-element";
import { ListItemElement } from "../ui/list-item";
import { TodoListElement } from "../ui/todo-list-element";
import { EmojiInputElement } from "../ui/emoji-input-element";
import { EmojiInputPlugin } from "@udecode/plate-emoji/react";

export const getRichElements = () => {
  return withPlaceholders( withDraggables(getElements()));
};

export const getElements = () => {
  return {
    [DatePlugin.key]: DateElement,
    [SlashInputPlugin.key]: SlashInputElement,
    [TogglePlugin.key]: ToggleElement,
    [BlockquotePlugin.key]: BlockquoteElement,
    [CodeBlockPlugin.key]: CodeBlockElement,
    [CodeLinePlugin.key]: CodeLineElement,
    [TocPlugin.key]: TocElement,
    [ColumnItemPlugin.key]: ColumnElement,
    [ColumnPlugin.key]: ColumnGroupElement,
    [CodeSyntaxPlugin.key]: CodeSyntaxLeaf,
    [HorizontalRulePlugin.key]: HrElement,
    [HEADING_KEYS.h1]: withProps(HeadingElement, { variant: "h1" }),
    [HEADING_KEYS.h2]: withProps(HeadingElement, { variant: "h2" }),
    [HEADING_KEYS.h3]: withProps(HeadingElement, { variant: "h3" }),
    [HEADING_KEYS.h4]: withProps(HeadingElement, { variant: "h4" }),
    [HEADING_KEYS.h5]: withProps(HeadingElement, { variant: "h5" }),
    [HEADING_KEYS.h6]: withProps(HeadingElement, { variant: "h6" }),
    [EquationPlugin.key]: EquationElement,
    [InlineEquationPlugin.key]: InlineEquationElement,
    [KbdPlugin.key]: KbdLeaf,
    [HighlightPlugin.key]: HighlightLeaf,
    [ImagePlugin.key]: ImageElement,
    [LinkPlugin.key]: LinkElement,
    [MediaEmbedPlugin.key]: MediaEmbedElement,
    [MentionPlugin.key]: MentionElement,
    [EmojiInputPlugin.key]: EmojiInputElement,
    [MentionInputPlugin.key]: MentionInputElement,
    [ParagraphPlugin.key]: withProps(ParagraphElement, { as: "p" }),
    [BulletedListPlugin.key]: withProps(ListElement, { variant: "ul" }),
    [NumberedListPlugin.key]: withProps(ListElement, { variant: "ol" }),
    [TodoListPlugin.key]: TodoListElement,
    [ListItemPlugin.key]: ListItemElement,
    [TablePlugin.key]: TableElement,
    [TableRowPlugin.key]: TableRowElement,
    [TableCellPlugin.key]: TableCellElement,
    [TableCellHeaderPlugin.key]: TableCellHeaderElement,
    [BoldPlugin.key]: withProps(PlateLeaf, { as: "strong" }),
    [CodePlugin.key]: CodeLeaf,
    [ItalicPlugin.key]: withProps(PlateLeaf, { as: "em" }),
    [StrikethroughPlugin.key]: withProps(PlateLeaf, { as: "s" }),
    [UnderlinePlugin.key]: withProps(PlateLeaf, { as: "u" }),
    [CommentsPlugin.key]: CommentLeaf,
  };
};
