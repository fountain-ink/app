import { withRef } from "@udecode/cn";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ListStyleType } from "@udecode/plate-indent-list";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";
import { PlateElement } from "./plate-element";

import type { PlateEditor } from "@udecode/plate-common/react";
import { ImagePlugin } from "@udecode/plate-media/react";
import {
  CalendarIcon,
  Heading2Icon,
  HeadingIcon,
  ImageIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  Radical,
  TableIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { insertMedia } from "@udecode/plate-media";
import { MediaEmbedPlugin } from "@udecode/plate-media/react";
import { YoutubeIcon } from "lucide-react";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { QuoteIcon } from "lucide-react";

import { insertEmptyElement } from "@udecode/plate-common";
import { ParagraphPlugin } from "@udecode/plate-common/react";

import { insertEmptyCodeBlock } from "@udecode/plate-code-block";
import { CodeIcon } from "lucide-react";

import { insertColumnGroup } from "@udecode/plate-layout";
import { LayoutIcon } from "lucide-react";

import { insertBlock } from "@/lib/transforms";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { ListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
import { EquationPlugin } from "@udecode/plate-math/react";
import { insertTable } from "@udecode/plate-table/react";
import { SeparatorHorizontalIcon } from "lucide-react";

interface SlashCommandRule {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  onSelect: (editor: PlateEditor) => void;
  value: string;
  description?: string;
  className?: string;
  focusEditor?: boolean;
  keywords?: string[];
}

const rules: SlashCommandRule[] = [
  {
    icon: HeadingIcon,
    value: "Heading",
    description: "Add a section.",
    keywords: ["heading", "big", "huge", "section", "h1", "one"],
    onSelect: (editor) => {
      // editor.tf.toggle.block({ type: HEADING_KEYS.h3 });
      insertBlock(editor, HEADING_KEYS.h3);
    },
  },
  {
    icon: Heading2Icon,
    value: "Subheading",
    description: "Add a subsection.",
    keywords: ["sub", "heading", "mid", "section", "h2", "two"],
    onSelect: (editor) => {
      // editor.tf.toggle.block({ type: HEADING_KEYS.h4 });
      insertBlock(editor, HEADING_KEYS.h4);
    },
  },
  {
    icon: PilcrowIcon,
    value: "Paragraph",
    description: "Add a paragraph.",
    keywords: ["paragraph", "text", "p", "plain"],
    onSelect: (editor) => {
      insertEmptyElement(editor, ParagraphPlugin.key, {
        nextBlock: true,
        select: true,
      });
    },
  },
  {
    icon: ImageIcon,
    value: "Image",
    description: "Add an image.",
    keywords: ["image", "img", "picture", "png", "photo", "jpg", "jpeg"],
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: ImagePlugin.key });
      // insertBlock(editor, ImagePlugin.key);
    },
  },
  {
    description: "Insert a block for equations.",
    focusEditor: false,
    icon: Radical,
    keywords: ["math", "formula"],
    value: "Equation",
    onSelect: (editor: any) => {
      insertBlock(editor, EquationPlugin.key);
    },
  },
  {
    icon: YoutubeIcon,
    value: "Embed",
    description: "Add a embed (YouTube, X, etc).",
    keywords: ["embed", "youtube", "video", "media", "iframe", "x", "twitter", "facebook", "instagram"],
    onSelect: async (editor) => {
      await insertMedia(editor, {
        select: true,
        type: MediaEmbedPlugin.key,
      });
    },
  },
  {
    icon: QuoteIcon,
    value: "Quote",
    description: "Capture a quote.",
    keywords: ["quote", "blockquote", "citation"],
    onSelect: (editor) => {
      // insertEmptyElement(editor, BlockquotePlugin.key, {
      //   nextBlock: true,
      //   select: true,
      // });
      insertBlock(editor, BlockquotePlugin.key);
    },
  },
  {
    icon: CodeIcon,
    value: "Code Block",
    description: "Add a code block.",
    keywords: ["code", "codeblock", "snippet", "pre"],
    onSelect: (editor) => {
      insertEmptyCodeBlock(editor, {
        insertNodesOptions: { select: true },
      });
    },
  },
  {
    icon: ListIcon,
    keywords: ["ul", "unordered list"],
    value: "Bulleted list",
    description: "Add a bullet list.",
    onSelect: (editor) => {
      editor.getTransforms(ListPlugin).toggle?.list({
        type: ListStyleType.Disc,
      });
    },
  },
  {
    icon: ListOrderedIcon,
    keywords: ["ol", "ordered list"],
    value: "Numbered list",
    description: "Add a numbered list.",
    onSelect: (editor) => {
      editor.getTransforms(ListPlugin).toggle?.numberedList();
    },
  },
  {
    icon: ListChecksIcon,
    keywords: ["todo", "checks list", "toggle"],
    value: "Checks list",
    description: "Add a todo list.",
    onSelect: (editor) => {
      insertBlock(editor, TodoListPlugin.key);
    },
  },
  {
    icon: CalendarIcon,
    keywords: ["inline", "date"],
    description: "Add a date.",
    value: "Date",
    onSelect: (editor) => {
      // editor.getTransforms(DatePlugin).insert.date();
      insertBlock(editor, DatePlugin.key);
    },
  },
  {
    icon: LayoutIcon,
    value: "Columns",
    description: "Split the page into columns.",
    keywords: ["column", "layout", "grid", "split"],
    onSelect: (editor) => {
      insertColumnGroup(editor);
    },
  },
  {
    icon: TableIcon,
    value: "Table",
    description: "Create a table for data.",
    keywords: ["table", "data", "spreadsheet"],
    onSelect: (editor) => {
      insertTable(editor, {}, { select: true });
    },
  },
  {
    icon: SeparatorHorizontalIcon,
    value: "Divider",
    description: "Horizontal divider.",
    keywords: ["divider", "separator", "hr", "horizontal rule", "line"],
    onSelect: (editor) => {
      insertEmptyElement(editor, HorizontalRulePlugin.key, {
        nextBlock: true,
        select: true,
      });
    },
  },
];

export const SlashInputElement = withRef<typeof PlateElement>(({ className, ...props }, ref) => {
  const { children, editor, element } = props;

  return (
    <PlateElement ref={ref} as="span" data-slate-value={element.value} {...props}>
      <InlineCombobox element={element} trigger="/">
        <InlineComboboxInput />

        <InlineComboboxContent className="py-1 flex flex-col gap-1" variant="slash">
          <InlineComboboxEmpty>No results</InlineComboboxEmpty>

          {rules.map(({ icon: Icon, onSelect, value, description, keywords, focusEditor }) => (
            <InlineComboboxItem
              key={value}
              value={value}
              onClick={() => onSelect(editor)}
              label={value}
              focusEditor={focusEditor}
              // group={value}
              keywords={keywords}
            >
              <div className="flex w-10 h-10 items-center justify-center rounded-sm border border-foreground/15 bg-muted/50 [&_svg]:size-5 [&_svg]:text-subtle-foreground">
                <Icon />
              </div>
              <div className="ml-3 flex flex-1 flex-col truncate">
                <span>{value}</span>
                <span className="truncate text-xs text-muted-foreground">{description}</span>
              </div>
            </InlineComboboxItem>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  );
});
