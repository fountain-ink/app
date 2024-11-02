import { withRef } from "@udecode/cn";
import { DatePlugin } from "@udecode/plate-date/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { INDENT_LIST_KEYS, ListStyleType, toggleIndentList } from "@udecode/plate-indent-list";

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

import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
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
  // {
  //   focusEditor: false,
  //   icon: Icons.ai,
  //   value: 'AI',
  //   onSelect: (editor) => {
  //     editor.getApi(AIChatPlugin).aiChat.show();
  //   },
  // },
  // {
  //   icon: Icons.h1,
  //   value: 'Heading 1',
  //   onSelect: (editor) => {
  //     editor.tf.toggle.block({ type: HEADING_KEYS.h1 });
  //   },
  // },
  // {
  //   icon: Icons.h2,
  //   value: 'Heading 2',
  //   onSelect: (editor) => {
  //     editor.tf.toggle.block({ type: HEADING_KEYS.h2 });
  //   },
  // },
  {
    icon: HeadingIcon,
    value: "Heading",
    keywords: ["heading", "big", "huge", "section", "h1", "one"],
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h3 });
    },
  },
  {
    icon: Heading2Icon,
    value: "Subheading",
    keywords: ["sub", "heading", "mid", "section", "h2", "two"],
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: HEADING_KEYS.h4 });
    },
  },
  {
    icon: PilcrowIcon,
    value: "Paragraph",
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
    keywords: ["image", "img", "picture", "png", "photo", "jpg", "jpeg"],
    onSelect: (editor) => {
      editor.tf.toggle.block({ type: ImagePlugin.key });
    },
  },
  {
    icon: YoutubeIcon,
    value: "Embed",
    keywords: ["embed", "youtube", "video", "media", "iframe"],
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
    keywords: ["quote", "blockquote", "citation"],
    onSelect: (editor) => {
      insertEmptyElement(editor, BlockquotePlugin.key, {
        nextBlock: true,
        select: true,
      });
    },
  },
  {
    icon: CodeIcon,
    value: "Code Block",
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
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Disc,
      });
    },
  },
  {
    icon: ListOrderedIcon,
    keywords: ["ol", "ordered list"],
    value: "Numbered list",
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: ListStyleType.Decimal,
      });
    },
  },
  {
    icon: ListChecksIcon,
    keywords: ["todo", "checks list", "toggle"],
    value: "Checks list",
    onSelect: (editor) => {
      toggleIndentList(editor, {
        listStyleType: INDENT_LIST_KEYS.todo,
      });
    },
  },
  {
    icon: CalendarIcon,
    keywords: ["inline", "date"],
    value: "Date",
    onSelect: (editor) => {
      editor.getTransforms(DatePlugin).insert.date();
    },
  },
  {
    icon: LayoutIcon,
    value: "Columns",
    keywords: ["column", "layout", "grid", "split"],
    onSelect: (editor) => {
      insertColumnGroup(editor);
    },
  },
  {
    icon: SeparatorHorizontalIcon,
    value: "Divider",
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

        <InlineComboboxContent className="max-w-64 py-1">
          <InlineComboboxEmpty>No matching commands found</InlineComboboxEmpty>

          {rules.map(({ focusEditor, icon: Icon, keywords, value, onSelect }) => (
            <InlineComboboxItem
              key={value}
              value={value}
              onClick={() => onSelect(editor)}
              focusEditor={focusEditor}
              keywords={keywords}
              className="mx-2 my-1 p-0 px-0 h-full"
            >
              <div className="flex items-center justify-center p-3 bg-muted/30 rounded-sm mr-2">
                <Icon className="w-4 h-4" aria-hidden />
              </div>

              {value}
            </InlineComboboxItem>
          ))}
        </InlineComboboxContent>
      </InlineCombobox>

      {children}
    </PlateElement>
  );
});
