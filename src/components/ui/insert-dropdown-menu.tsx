"use client";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";
import { type PlateEditor, useEditorRef } from "@udecode/plate/react";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { ExcalidrawPlugin } from "@udecode/plate-excalidraw/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { LinkPlugin } from "@udecode/plate-link/react";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  CalendarIcon,
  ChevronRightIcon,
  Columns3Icon,
  FileCodeIcon,
  FilmIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  Heading4Icon,
  ImageIcon,
  Link2Icon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  PenToolIcon,
  PlusIcon,
  QuoteIcon,
  SquareIcon,
  TableIcon,
  TableOfContentsIcon,
} from "lucide-react";
import type React from "react";

import { DropdownMenu, DropdownMenuTrigger, useOpenState } from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

type Group = {
  group: string;
  items: Item[];
};

interface Item {
  icon: React.ReactNode;
  onSelect: (editor: PlateEditor, value: string) => void;
  value: string;
  focusEditor?: boolean;
  label?: string;
}

export const insertItems = [
  {
    icon: <Heading1Icon />,
    keywords: ["header", "heading", "h1"],
    label: "Header",
    value: HEADING_KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    keywords: ["subheader", "heading", "h2"],
    label: "Subheader",
    value: HEADING_KEYS.h2,
  },
  {
    icon: <Heading3Icon />,
    keywords: ["heading", "h3"],
    label: "Heading 3",
    value: HEADING_KEYS.h3,
  },
  {
    icon: <Heading4Icon />,
    keywords: ["heading", "h4"],
    label: "Heading 4",
    value: HEADING_KEYS.h4,
  },
  {
    icon: <TableIcon />,
    label: "Table",
    value: TablePlugin.key,
  },
  {
    icon: <FileCodeIcon />,
    label: "Code",
    value: CodeBlockPlugin.key,
  },
  {
    icon: <QuoteIcon />,
    label: "Quote",
    value: BlockquotePlugin.key,
  },
  {
    icon: <MinusIcon />,
    label: "Divider",
    value: HorizontalRulePlugin.key,
  },
  {
    icon: <ListIcon />,
    label: "Bulleted list",
    value: ListStyleType.Disc,
  },
  {
    icon: <ListOrderedIcon />,
    label: "Numbered list",
    value: ListStyleType.Decimal,
  },
  {
    icon: <SquareIcon />,
    label: "To-do list",
    value: INDENT_LIST_KEYS.todo,
  },
  {
    icon: <ChevronRightIcon />,
    label: "Toggle list",
    value: TogglePlugin.key,
  },
  {
    icon: <ImageIcon />,
    label: "Image",
    value: ImagePlugin.key,
  },
  {
    icon: <FilmIcon />,
    label: "Embed",
    value: MediaEmbedPlugin.key,
  },
  {
    icon: <PenToolIcon />,
    label: "Excalidraw",
    value: ExcalidrawPlugin.key,
  },
  {
    icon: <TableOfContentsIcon />,
    label: "Table of contents",
    value: TocPlugin.key,
  },
  {
    icon: <Columns3Icon />,
    label: "3 columns",
    value: "action_three_columns",
  },
  {
    icon: <Link2Icon />,
    label: "Link",
    value: LinkPlugin.key,
  },
  {
    focusEditor: true,
    icon: <CalendarIcon />,
    label: "Date",
    value: DatePlugin.key,
  },
];

export function InsertDropdownMenu(props: DropdownMenuProps) {
  const _editor = useEditorRef();
  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Insert" isDropdown>
          <PlusIcon />
        </ToolbarButton>
      </DropdownMenuTrigger>

      {/* <DropdownMenuContent className="flex max-h-[500px] min-w-0 flex-col overflow-y-auto" align="start">
        {groups.map(({ group, items: nestedItems }) => (
          <DropdownMenuGroup key={group} label={group}>
            {nestedItems.map(({ icon, label, value, onSelect }) => (
              <DropdownMenuItem
                key={value}
                className="min-w-[180px]"
                onSelect={() => {
                  onSelect(editor, value);
                  focusEditor(editor);
                }}
              >
                {icon}
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        ))}
      </DropdownMenuContent> */}
    </DropdownMenu>
  );
}
