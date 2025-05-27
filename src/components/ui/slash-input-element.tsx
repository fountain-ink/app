import { withRef } from "@udecode/cn";
import { HEADING_KEYS } from "@udecode/plate-heading";

import {
  InlineCombobox,
  InlineComboboxContent,
  InlineComboboxEmpty,
  InlineComboboxInput,
  InlineComboboxItem,
} from "./inline-combobox";
import { PlateElement } from "@udecode/plate/react";

import { ImagePlugin } from "@udecode/plate-media/react";
import type { PlateEditor } from "@udecode/plate/react";
import {
  FrameIcon,
  Heading2Icon,
  HeadingIcon,
  ImageIcon,
  ListChecksIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  Radical,
  TableIcon,
  SeparatorHorizontalIcon,
} from "lucide-react";
import type { ComponentType, SVGProps } from "react";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { QuoteIcon } from "lucide-react";

import { ParagraphPlugin } from "@udecode/plate/react";

import { insertEmptyCodeBlock } from "@udecode/plate-code-block";
import { CodeIcon } from "lucide-react";

import { insertBlock } from "@/lib/transforms";
import { ListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
import { EquationPlugin } from "@udecode/plate-math/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { insertTable } from "@udecode/plate-table";
import { IframePlugin } from "../editor/plugins/iframe-plugin";
import { insertIframe } from "../editor/transforms/insert-iframe";

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
      insertBlock(editor, HEADING_KEYS.h1);
    },
  },
  {
    icon: Heading2Icon,
    value: "Subheading",
    description: "Add a subsection.",
    keywords: ["sub", "heading", "mid", "section", "h2", "two"],
    onSelect: (editor) => {
      // editor.tf.toggle.block({ type: HEADING_KEYS.h4 });
      insertBlock(editor, HEADING_KEYS.h2);
    },
  },
  {
    icon: PilcrowIcon,
    value: "Paragraph",
    description: "Add a paragraph.",
    keywords: ["paragraph", "text", "p", "plain"],
    onSelect: (editor) => {
      editor.tf.insertNodes(editor.api.create.block({ type: ParagraphPlugin.key }), {
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
      // editor.tf.toggleBlock(ImagePlugin.key);
      insertBlock(editor, ImagePlugin.key);
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
  // {
  //   icon: YoutubeIcon,
  //   value: "Embed",
  //   description: "Add a embed (YouTube, X, etc).",
  //   keywords: ["embed", "youtube", "video", "media", "iframe", "x", "twitter", "facebook", "instagram"],
  //   onSelect: async (editor) => {
  //     await insertMedia(editor, {
  //       select: true,
  //       type: MediaEmbedPlugin.key,
  //     });
  //   },
  // },
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
    icon: FrameIcon,
    value: "Embed",
    description: "Add an embed.",
    keywords: ["iframe", "embed", "video", "media"],
    onSelect: (editor) => {
      insertIframe(editor, { url: undefined });
    },
  },
  {
    icon: ListIcon,
    keywords: ["ul", "unordered list"],
    value: "Bulleted list",
    description: "Add a bullet list.",
    onSelect: (editor) => {
      editor.getTransforms(ListPlugin).toggle?.bulletedList();
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
  // {
  //   icon: CalendarIcon,
  //   keywords: ["inline", "date"],
  //   description: "Add a date.",
  //   value: "Date",
  //   onSelect: (editor) => {
  //     // editor.getTransforms(DatePlugin).insert.date();
  //     insertBlock(editor, DatePlugin.key);
  //   },
  // },
  // {
  //   icon: LayoutIcon,
  //   value: "Columns",
  //   description: "Split the page into columns.",
  //   keywords: ["column", "layout", "grid", "split"],
  //   onSelect: (editor) => {
  //     insertColumnGroup(editor);
  //   },
  // },
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
      insertBlock(editor, HorizontalRulePlugin.key);
    },
  },
];

// export const SlashInputElement = withRef<typeof PlateElement>(({ className, ...props }, ref) => {
//   const { children, editor, element } = props;

//   return (
//     <PlateElement ref={ref} as="span" data-slate-value={element.value} {...props}>
//       <InlineCombobox element={element} trigger="/" showTrigger={false}>
//         <InlineComboboxInput />

//         <InlineComboboxContent className="flex flex-col gap-1" variant="slash">
//           <InlineComboboxEmpty>No results</InlineComboboxEmpty>

//           {rules.map(({ icon: Icon, onSelect, value, description, keywords, focusEditor }) => (
//             <InlineComboboxItem
//               key={value}
//               value={value}
//               onClick={() => onSelect(editor)}
//               label={value}
//               focusEditor={focusEditor}
//               // group={value}
//               keywords={keywords}
//             >
//               <div className="flex w-10 h-10 items-center justify-center rounded-sm border border-foreground/15 bg-muted/50 [&_svg]:size-5 [&_svg]:text-subtle-foreground">
//                 <Icon />
//               </div>
//               <div className="ml-3 flex flex-1 flex-col truncate">
//                 <span>{value}</span>
//                 <span className="truncate text-xs text-muted-foreground">{description}</span>
//               </div>
//             </InlineComboboxItem>
//           ))}
//         </InlineComboboxContent>
//       </InlineCombobox>

//       {children}
//     </PlateElement>
//   );
// });

export const SlashInputElement = withRef<typeof PlateElement>(({ className, ...props }, ref) => {
  const { children, editor, element } = props;

  return (
    <PlateElement ref={ref} as="span" data-slate-value={element.value} {...props}>
      <InlineCombobox element={element} trigger="/" showTrigger={true}>
        <InlineComboboxInput />

        <InlineComboboxContent variant="slash">
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

// 'use client';

// import React from 'react';

// import type { PlateEditor } from '@udecode/plate/react';

// import { AIChatPlugin } from '@udecode/plate-ai/react';
// import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
// import { CalloutPlugin } from '@udecode/plate-callout/react';
// import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
// import { DatePlugin } from '@udecode/plate-date/react';
// import { HEADING_KEYS } from '@udecode/plate-heading';
// import { TocPlugin } from '@udecode/plate-heading/react';
// import { INDENT_LIST_KEYS, ListStyleType } from '@udecode/plate-indent-list';
// import {
//     EquationPlugin,
//     InlineEquationPlugin,
// } from '@udecode/plate-math/react';
// import {
//     AudioPlugin,
//     FilePlugin,
//     ImagePlugin,
//     VideoPlugin,
// } from '@udecode/plate-media/react';
// import { TablePlugin } from '@udecode/plate-table/react';
// import { TogglePlugin } from '@udecode/plate-toggle/react';
// import { ParagraphPlugin, withRef } from '@udecode/plate/react';
// import {
//     AudioLinesIcon,
//     CalendarIcon,
//     ChevronDownIcon,
//     Code2Icon,
//     FileUpIcon,
//     FilmIcon,
//     Heading1Icon,
//     Heading2Icon,
//     Heading3Icon,
//     ImageIcon,
//     LightbulbIcon,
//     ListIcon,
//     ListOrderedIcon,
//     type LucideProps,
//     PilcrowIcon,
//     QuoteIcon,
//     RadicalIcon,
//     RectangleVerticalIcon,
//     SquareIcon,
//     TableIcon,
//     TableOfContentsIcon,
// } from 'lucide-react';

// import { insertBlock, insertInlineElement, setBlockType } from '@/lib/transforms';
// import { blockMenuItems } from './block-menu-items';
// import {
//     InlineCombobox,
//     InlineComboboxContent,
//     InlineComboboxEmpty,
//     InlineComboboxGroup,
//     InlineComboboxGroupLabel,
//     InlineComboboxInput,
//     InlineComboboxItem,
// } from './inline-combobox';
// import { PlateElement } from './plate-element';
// import { turnIntoItems } from './turn-into-dropdown-menu';

// export type Group = {
//   group: string;
//   items: Item[];
// };

// export interface Item {
//   icon: React.ReactNode;
//   value: string;
//   onSelect: (editor: PlateEditor, value: string) => void;
//   description?: string;
//   focusEditor?: boolean;
//   keywords?: string[];
//   label?: string;
// }

// const AIIcon = (props: LucideProps) => (
//   <svg
//     fill="url(#myGradient)"
//     viewBox="0 0 512 512"
//     xmlns="http://www.w3.org/2000/svg"
//     {...props}
//   >
//     <defs>
//       <linearGradient id="myGradient" x1="0%" x2="100%" y1="0%" y2="100%">
//         <stop offset="0%" stopColor="#6EB6F2" />
//         <stop offset="15%" stopColor="#6EB6F2" />
//         <stop offset="40%" stopColor="#c084fc" />
//         <stop offset="60%" stopColor="#f87171" />
//         <stop offset="100%" stopColor="#fcd34d" />
//       </linearGradient>
//     </defs>
//     <path d="M161.15 362.26a40.902 40.902 0 0 0 23.78 7.52v-.11a40.989 40.989 0 0 0 37.75-24.8l17.43-53.02a81.642 81.642 0 0 1 51.68-51.53l50.57-16.44a41.051 41.051 0 0 0 20.11-15.31 40.964 40.964 0 0 0 7.32-24.19 41.077 41.077 0 0 0-8.23-23.89 41.051 41.051 0 0 0-20.68-14.54l-49.92-16.21a81.854 81.854 0 0 1-51.82-51.85L222.7 27.33A41.11 41.11 0 0 0 183.63.01c-8.54.07-16.86 2.8-23.78 7.81A41.152 41.152 0 0 0 145 27.97l-16.58 50.97c-4 11.73-10.61 22.39-19.33 31.19s-19.33 15.5-31.01 19.61l-50.54 16.24a41.131 41.131 0 0 0-15.89 10.14 41.059 41.059 0 0 0-9.69 16.17 41.144 41.144 0 0 0-1.44 18.8c.98 6.29 3.42 12.27 7.11 17.46a41.312 41.312 0 0 0 20.39 15.19l49.89 16.18a82.099 82.099 0 0 1 32.11 19.91c2.42 2.4 4.68 4.96 6.77 7.65a81.567 81.567 0 0 1 12.94 24.38l16.44 50.49a40.815 40.815 0 0 0 14.98 19.91zm218.06 143.57c-5.42-3.86-9.5-9.32-11.66-15.61l-9.33-28.64a37.283 37.283 0 0 0-8.9-14.48c-4.05-4.06-9-7.12-14.45-8.93l-28.19-9.19a32.655 32.655 0 0 1-16.24-12.06 32.062 32.062 0 0 1-5.97-18.74c.01-6.76 2.13-13.35 6.06-18.86 3.91-5.53 9.46-9.68 15.87-11.86l28.61-9.27a37.013 37.013 0 0 0 14.08-9.01c3.95-4.04 6.91-8.93 8.67-14.29l9.22-28.22a32.442 32.442 0 0 1 11.72-15.87 32.476 32.476 0 0 1 18.74-6.17c6.74-.07 13.33 1.96 18.86 5.81 5.53 3.84 9.74 9.31 12.03 15.64l9.36 28.84a36.832 36.832 0 0 0 8.94 14.34c4.05 4.03 8.97 7.06 14.39 8.87l28.22 9.19a32.44 32.44 0 0 1 16.29 11.52 32.465 32.465 0 0 1 6.47 18.87 32.458 32.458 0 0 1-21.65 31.19l-28.84 9.36a37.384 37.384 0 0 0-14.36 8.93c-4.05 4.06-7.1 9.01-8.9 14.45l-9.16 28.13A32.492 32.492 0 0 1 417 505.98a32.005 32.005 0 0 1-18.74 6.03 32.508 32.508 0 0 1-19.05-6.18z" />
//   </svg>
// );

// const groups: Group[] = [
//   {
//     group: 'AI',
//     items: [
//       {
//         description: 'Use AI to generate content.',
//         focusEditor: false,
//         icon: <AIIcon />,
//         keywords: ['ai', 'generate', 'help', 'chat'],
//         value: 'AI',
//         onSelect: (editor) => {
//           editor.getApi(AIChatPlugin).aiChat.show();
//         },
//       },
//     ],
//   },
//   {
//     group: 'Basic blocks',
//     items: [
//       {
//         description: 'Plain text.',
//         icon: <PilcrowIcon />,
//         keywords: ['paragraph'],
//         label: 'Text',
//         value: ParagraphPlugin.key,
//       },
//       {
//         description: 'Large section heading.',
//         icon: <Heading1Icon />,
//         keywords: ['title', 'h1'],
//         label: 'Heading 1',
//         value: HEADING_KEYS.h1,
//       },
//       {
//         description: 'Medium section heading.',
//         icon: <Heading2Icon />,
//         keywords: ['subtitle', 'h2'],
//         label: 'Heading 2',
//         value: HEADING_KEYS.h2,
//       },
//       {
//         description: 'Small section heading.',
//         icon: <Heading3Icon />,
//         keywords: ['subtitle', 'h3'],
//         label: 'Heading 3',
//         value: HEADING_KEYS.h3,
//       },
//       {
//         description: 'Create a bulleted list.',
//         icon: <ListIcon />,
//         keywords: ['unordered', 'ul', '-'],
//         label: 'Bulleted list',
//         value: ListStyleType.Disc,
//       },
//       {
//         description: 'Create a numbered list.',
//         icon: <ListOrderedIcon />,
//         keywords: ['ordered', 'ol', '1'],
//         label: 'Numbered list',
//         value: ListStyleType.Decimal,
//       },
//       {
//         description: 'Insert a checklist for tasks.',
//         icon: <SquareIcon />,
//         keywords: ['checklist', 'task', 'checkbox', '[]'],
//         label: 'To-do list',
//         value: INDENT_LIST_KEYS.todo,
//       },
//       {
//         description: 'Insert a collapsible section.',
//         icon: <ChevronDownIcon />,
//         keywords: ['collapsible', 'expandable'],
//         label: 'Toggle',
//         value: TogglePlugin.key,
//       },
//       {
//         description: 'Insert a block for code.',
//         icon: <Code2Icon />,
//         keywords: ['```'],
//         label: 'Code Block',
//         value: CodeBlockPlugin.key,
//       },
//       {
//         description: 'Create a table for data.',
//         icon: <TableIcon />,
//         label: 'Table',
//         value: TablePlugin.key,
//       },
//       {
//         description: 'Insert a quote for emphasis.',
//         icon: <QuoteIcon />,
//         keywords: ['citation', 'blockquote', 'quote', '>'],
//         label: 'Blockquote',
//         value: BlockquotePlugin.key,
//       },
//       {
//         description: 'Insert a highlighted block.',
//         icon: <LightbulbIcon />,
//         keywords: ['note'],
//         label: 'Callout',
//         value: CalloutPlugin.key,
//       },
//     ].map((item) => ({
//       ...item,
//       onSelect: (editor, value) => {
//         insertBlock(editor, value);

//       },
//     })),
//   },
//   {
//     group: 'Media',
//     items: [
//       {
//         description: 'Upload or embed an image.',
//         icon: <ImageIcon />,
//         keywords: ['media', 'img', 'picture', 'photo'],
//         label: 'Image',
//         value: ImagePlugin.key,
//       },
//       {
//         description: 'Upload or embed a video.',
//         icon: <FilmIcon />,
//         keywords: ['media', 'video', 'movie'],
//         label: 'Video',
//         value: VideoPlugin.key,
//       },
//       {
//         description: 'Upload or embed audio.',
//         icon: <AudioLinesIcon />,
//         keywords: ['media', 'audio', 'sound'],
//         label: 'Audio',
//         value: AudioPlugin.key,
//       },
//       {
//         description: 'Upload or link any file type.',
//         icon: <FileUpIcon />,
//         keywords: ['media', 'file', 'document', 'attachment'],
//         label: 'File',
//         value: FilePlugin.key,
//       },
//     ].map((item) => ({
//       ...item,
//       focusEditor: false,
//       onSelect: (editor, value) => {
//         insertBlock(editor, value);
//       },
//     })),
//   },
//   {
//     group: 'Advanced blocks',
//     items: [
//       {
//         description: 'Generate a table of contents.',
//         icon: <TableOfContentsIcon />,
//         keywords: ['toc'],
//         label: 'Table of content',
//         value: TocPlugin.key,
//       },
//       {
//         description: 'Insert a block for equations.',
//         focusEditor: false,
//         icon: <RadicalIcon />,
//         keywords: ['math', 'formula'],
//         label: 'Equation',
//         value: EquationPlugin.key,
//       },
//       {
//         description: 'Create 3 columns of blocks.',
//         icon: <RectangleVerticalIcon />,
//         label: '3 columns',
//         value: 'action_three_columns',
//       },
//     ].map((item) => ({
//       ...item,
//       onSelect: (editor, value) => {
//         insertBlock(editor, value);
//       },
//     })),
//   },
//   {
//     group: 'Inline',
//     items: [
//       {
//         description: 'Insert an inline math equation.',
//         focusEditor: false,
//         icon: <RadicalIcon />,
//         keywords: ['math', 'inline', 'formula'],
//         label: 'Inline Equation',
//         value: InlineEquationPlugin.key,
//       },
//       {
//         description: 'Insert current or custom date.',
//         focusEditor: true,
//         icon: <CalendarIcon />,
//         keywords: ['time'],
//         label: 'Date',
//         value: DatePlugin.key,
//       },
//     ].map((item) => ({
//       ...item,
//       onSelect: (editor, value) => {
//         insertInlineElement(editor, value);
//       },
//     })),
//   },
//   {
//     group: 'Turn into',
//     items: turnIntoItems.map((item) => ({
//       ...item,
//       onSelect: (editor) => {
//         setBlockType(editor, item.value);
//       },
//     })),
//   },
//   {
//     group: 'Actions',
//     items: [
//       {
//         ...blockMenuItems.delete,
//         onSelect: (editor) => {
//           editor.tf.removeNodes();
//         },
//       },
//     ],
//   },
// ];

// export const SlashInputElement = withRef<typeof PlateElement>(
//   ({ className, ...props }, ref) => {
//     const { children, editor, element } = props;

//     return (
//       <PlateElement
//         ref={ref}
//         as="span"
//         data-slate-value={element.value}
//         {...props}
//       >
//         <InlineCombobox element={element} trigger="/">
//           <InlineComboboxInput />

//           <InlineComboboxContent variant="slash">
//             <InlineComboboxEmpty>No results</InlineComboboxEmpty>

//             {groups.map(({ group, items }) => (
//               <InlineComboboxGroup key={group}>
//                 <InlineComboboxGroupLabel>{group}</InlineComboboxGroupLabel>
//                 {items.map(
//                   ({
//                     description,
//                     focusEditor,
//                     icon,
//                     keywords,
//                     label,
//                     value,
//                     onSelect,
//                   }) => (
//                     <InlineComboboxItem
//                       key={value}
//                       value={value}
//                       onClick={() => onSelect(editor, value)}
//                       label={label}
//                       focusEditor={focusEditor}
//                       group={group}
//                       keywords={keywords}
//                     >
//                       {description ? (
//                         <>
//                           <div className="flex size-11 items-center justify-center rounded border border-foreground/15 bg-white [&_svg]:size-5 [&_svg]:text-subtle-foreground">
//                             {icon}
//                           </div>
//                           <div className="ml-3 flex flex-1 flex-col truncate">
//                             <span>{label ?? value}</span>
//                             <span className="truncate text-xs text-muted-foreground">
//                               {description}
//                             </span>
//                           </div>
//                         </>
//                       ) : (
//                         <>
//                           <div className="mr-2 text-subtle-foreground">
//                             {icon}
//                           </div>
//                           {label ?? value}
//                         </>
//                       )}
//                     </InlineComboboxItem>
//                   )
//                 )}
//               </InlineComboboxGroup>
//             ))}
//           </InlineComboboxContent>
//         </InlineCombobox>

//         {children}
//       </PlateElement>
//     );
//   }
// );
