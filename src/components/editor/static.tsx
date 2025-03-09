import { withProps } from "@udecode/cn";
import { BaseParagraphPlugin, SlateLeaf, Value, createSlateEditor } from "@udecode/plate";
import {
  BaseBoldPlugin,
  BaseCodePlugin,
  BaseItalicPlugin,
  BaseStrikethroughPlugin,
  BaseSubscriptPlugin,
  BaseSuperscriptPlugin,
  BaseUnderlinePlugin,
} from "@udecode/plate-basic-marks";
import { BaseBlockquotePlugin } from "@udecode/plate-block-quote";
import { BaseCalloutPlugin } from "@udecode/plate-callout";
import { BaseCodeBlockPlugin, BaseCodeLinePlugin, BaseCodeSyntaxPlugin } from "@udecode/plate-code-block";
import { BaseCommentsPlugin } from "@udecode/plate-comments";
import { BaseDatePlugin } from "@udecode/plate-date";
import { BaseHeadingPlugin, BaseTocPlugin, HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { BaseHorizontalRulePlugin } from "@udecode/plate-horizontal-rule";
import { BaseColumnItemPlugin, BaseColumnPlugin } from "@udecode/plate-layout";
import { BaseLinkPlugin } from "@udecode/plate-link";
import { BaseEquationPlugin, BaseInlineEquationPlugin } from "@udecode/plate-math";
import {
  BaseAudioPlugin,
  BaseFilePlugin,
  BaseImagePlugin,
  BaseMediaEmbedPlugin,
  BaseVideoPlugin,
} from "@udecode/plate-media";
import { BaseMentionPlugin } from "@udecode/plate-mention";
import {
  BaseTableCellHeaderPlugin,
  BaseTableCellPlugin,
  BaseTablePlugin,
  BaseTableRowPlugin,
} from "@udecode/plate-table";
import { BaseTogglePlugin } from "@udecode/plate-toggle";

import { BlockquoteElementStatic } from "@/components/ui/static/blockquote-element-static";
import { CalloutElementStatic } from "@/components/ui/static/callout-element-static";
import { CodeBlockElementStatic } from "@/components/ui/static/code-block-element-static";
import { CodeLeafStatic } from "@/components/ui/static/code-leaf-static";
import { CodeLineElementStatic } from "@/components/ui/static/code-line-element-static";
import { CodeSyntaxLeafStatic } from "@/components/ui/static/code-syntax-leaf-static";
import { ColumnElementStatic } from "@/components/ui/static/column-element-static";
import { ColumnGroupElementStatic } from "@/components/ui/static/column-group-element-static";
import { CommentLeafStatic } from "@/components/ui/static/comment-leaf-static";
import { DateElementStatic } from "@/components/ui/static/date-element-static";
import { EquationElementStatic } from "@/components/ui/static/equation-element-static";
import { HeadingElementStatic } from "@/components/ui/static/heading-element-static";
import { HrElementStatic } from "@/components/ui/static/hr-element-static";
import { ImageElementStatic } from "@/components/ui/static/image-element-static";
import { InlineEquationElementStatic } from "@/components/ui/static/inline-equation-element-static";
import { LinkElementStatic } from "@/components/ui/static/link-element-static";
import { MediaAudioElementStatic } from "@/components/ui/static/media-audio-element-static";
import { MediaFileElementStatic } from "@/components/ui/static/media-file-element-static";
import { MediaVideoElementStatic } from "@/components/ui/static/media-video-element-static";
import { MentionElementStatic } from "@/components/ui/static/mention-element-static";
import { ParagraphElementStatic } from "@/components/ui/static/paragraph-element-static";
import { TableCellElementStatic, TableCellHeaderStaticElement } from "@/components/ui/static/table-cell-element-static";
import { TableElementStatic } from "@/components/ui/static/table-element-static";
import { TableRowElementStatic } from "@/components/ui/static/table-row-element-static";
import { TocElementStatic } from "@/components/ui/static/toc-element-static";
import { ToggleElementStatic } from "@/components/ui/static/toggle-element-static";
import { BaseIndentPlugin } from "@udecode/plate-indent";
import { BaseIndentListPlugin } from "@udecode/plate-indent-list";
import Prism from "prismjs";
import { TodoLiStatic, TodoMarkerStatic } from "../ui/static/indent-todo-marker-static";
import { SubtitleElementStatic, TitleElementStatic } from "../ui/static/title-element-static";
import { SubtitlePlugin, TitlePlugin } from "./plugins/title-plugin";
import { all, createLowlight } from "lowlight";

export const staticComponents = {
  [BaseAudioPlugin.key]: MediaAudioElementStatic,
  [BaseFilePlugin.key]: MediaFileElementStatic,
  [BaseImagePlugin.key]: ImageElementStatic,
  [BaseVideoPlugin.key]: MediaVideoElementStatic,
  [TitlePlugin.key]: TitleElementStatic,
  [SubtitlePlugin.key]: SubtitleElementStatic,

  [BaseBlockquotePlugin.key]: BlockquoteElementStatic,
  [BaseBoldPlugin.key]: withProps(SlateLeaf, { as: "strong" }),
  [BaseCalloutPlugin.key]: CalloutElementStatic,
  [BaseCodeBlockPlugin.key]: CodeBlockElementStatic,
  [BaseCodeLinePlugin.key]: CodeLineElementStatic,
  [BaseCodePlugin.key]: CodeLeafStatic,
  [BaseCodeSyntaxPlugin.key]: CodeSyntaxLeafStatic,
  [BaseColumnItemPlugin.key]: ColumnElementStatic,
  [BaseColumnPlugin.key]: ColumnGroupElementStatic,
  [BaseCommentsPlugin.key]: CommentLeafStatic,
  [BaseDatePlugin.key]: DateElementStatic,
  [BaseEquationPlugin.key]: EquationElementStatic,
  [BaseHorizontalRulePlugin.key]: HrElementStatic,
  [BaseInlineEquationPlugin.key]: InlineEquationElementStatic,
  [BaseItalicPlugin.key]: withProps(SlateLeaf, { as: "em" }),
  [BaseLinkPlugin.key]: LinkElementStatic,
  [BaseMentionPlugin.key]: MentionElementStatic,
  [BaseParagraphPlugin.key]: ParagraphElementStatic,
  [BaseStrikethroughPlugin.key]: withProps(SlateLeaf, { as: "del" }),
  [BaseSubscriptPlugin.key]: withProps(SlateLeaf, { as: "sub" }),
  [BaseSuperscriptPlugin.key]: withProps(SlateLeaf, { as: "sup" }),
  [BaseTableCellHeaderPlugin.key]: TableCellHeaderStaticElement,
  [BaseTableCellPlugin.key]: TableCellElementStatic,
  [BaseTablePlugin.key]: TableElementStatic,
  [BaseTableRowPlugin.key]: TableRowElementStatic,
  [BaseTocPlugin.key]: TocElementStatic,
  [BaseTogglePlugin.key]: ToggleElementStatic,
  [BaseUnderlinePlugin.key]: withProps(SlateLeaf, { as: "u" }),
  [HEADING_KEYS.h1]: withProps(HeadingElementStatic, { variant: "h1" }),
  [HEADING_KEYS.h2]: withProps(HeadingElementStatic, { variant: "h2" }),
  [HEADING_KEYS.h3]: withProps(HeadingElementStatic, { variant: "h3" }),
};

const lowlight = createLowlight(all);

export const getStaticEditor = (value?: Value) =>
  createSlateEditor({
    plugins: [
      // MarkdownPlugin,
      TitlePlugin,
      SubtitlePlugin,
      BaseEquationPlugin,
      BaseColumnPlugin,
      BaseColumnItemPlugin,
      BaseTocPlugin,
      BaseVideoPlugin,
      BaseAudioPlugin,
      BaseParagraphPlugin,
      BaseHeadingPlugin,
      BaseMediaEmbedPlugin,
      BaseInlineEquationPlugin,
      BaseBoldPlugin,
      BaseCodePlugin,
      BaseItalicPlugin,
      BaseStrikethroughPlugin,
      BaseSubscriptPlugin,
      BaseSuperscriptPlugin,
      BaseUnderlinePlugin,
      BaseBlockquotePlugin,
      BaseDatePlugin,
      BaseCalloutPlugin,
      BaseCodeBlockPlugin.configure({
        options: {
          lowlight
        },
      }),
      BaseIndentPlugin.extend({
        inject: {
          targetPlugins: [BaseParagraphPlugin.key, BaseBlockquotePlugin.key, BaseCodeBlockPlugin.key],
        },
      }),
      BaseIndentListPlugin.extend({
        inject: {
          targetPlugins: [
            BaseParagraphPlugin.key,
            ...HEADING_LEVELS,
            BaseBlockquotePlugin.key,
            BaseCodeBlockPlugin.key,
            BaseTogglePlugin.key,
          ],
        },
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
      BaseLinkPlugin,
      BaseTableRowPlugin,
      BaseTablePlugin,
      BaseTableCellPlugin,
      BaseHorizontalRulePlugin,
      BaseFilePlugin,
      BaseImagePlugin,
      BaseMentionPlugin,
      BaseCommentsPlugin,
      BaseTogglePlugin,
    ],
    value,
  });
