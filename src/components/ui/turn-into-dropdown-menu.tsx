"use client";

import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { ParagraphPlugin, focusEditor, useEditorRef, useSelectionFragmentProp } from "@udecode/plate-common/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { INDENT_LIST_KEYS, ListStyleType } from "@udecode/plate-indent-list";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import {
  ChevronDownIcon,
  Code2,
  Columns3,
  Heading1,
  Heading2,
  Heading3,
  Lightbulb,
  List,
  ListOrdered,
  Pilcrow,
  Quote,
  Square,
} from "lucide-react";

import { getBlockType, setBlockType } from "@/lib/transforms";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export const turnIntoItems = [
  {
    icon: <Pilcrow />,
    keywords: ["paragraph"],
    label: "Text",
    value: ParagraphPlugin.key,
  },
  {
    icon: <Heading1 />,
    keywords: ["title", "h1"],
    label: "Heading 1",
    value: HEADING_KEYS.h1,
  },
  {
    icon: <Heading2 />,
    keywords: ["subtitle", "h2"],
    label: "Heading 2",
    value: HEADING_KEYS.h2,
  },
  {
    icon: <Heading3 />,
    keywords: ["subtitle", "h3"],
    label: "Heading 3",
    value: HEADING_KEYS.h3,
  },
  {
    icon: <Square />,
    keywords: ["checklist", "task", "checkbox", "[]"],
    label: "To-do list",
    value: INDENT_LIST_KEYS.todo,
  },
  {
    icon: <List />,
    keywords: ["unordered", "ul", "-"],
    label: "Bulleted list",
    value: ListStyleType.Disc,
  },
  {
    icon: <ListOrdered />,
    keywords: ["ordered", "ol", "1"],
    label: "Numbered list",
    value: ListStyleType.Decimal,
  },
  {
    icon: <ChevronDownIcon />,
    keywords: ["collapsible", "expandable"],
    label: "Toggle list",
    value: TogglePlugin.key,
  },
  {
    icon: <Code2 />,
    keywords: ["```"],
    label: "Code",
    value: CodeBlockPlugin.key,
  },
  {
    icon: <Quote />,
    keywords: ["citation", "blockquote", ">"],
    label: "Quote",
    value: BlockquotePlugin.key,
  },
  {
    icon: <Lightbulb />,
    keywords: ["highlight", "note", "important"],
    label: "Callout",
    value: CalloutPlugin.key,
  },
  {
    icon: <Columns3 />,
    label: "3 columns",
    value: "action_three_columns",
  },
];

export function TurnIntoDropdownMenu(props: DropdownMenuProps) {
  const editor = useEditorRef();
  const openState = useOpenState();

  const value = useSelectionFragmentProp({
    defaultValue: ParagraphPlugin.key,
    getProp: (node) => getBlockType(node as any),
  });
  const selectedItem = React.useMemo(
    () => turnIntoItems.find((item) => item.value === (value ?? ParagraphPlugin.key)) ?? turnIntoItems[0],
    [value],
  );
  
  if (!selectedItem) return null;

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Turn into" isDropdown>
          {selectedItem.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent className="ignore-click-outside/toolbar min-w-0" data-plate-prevent-overlay align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Turn into</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              className="flex flex-col gap-0.5"
              value={selectedItem.value}
              onValueChange={(type) => {
                setBlockType(editor, type);
                focusEditor(editor);
              }}
            >
              {turnIntoItems.map(({ icon, label, value: itemValue }) => (
                <DropdownMenuRadioItem key={itemValue} className="min-w-[180px]" value={itemValue}>
                  <div className="mr-2 flex size-5 items-center justify-center rounded-sm border border-foreground/15 bg-white p-0.5 text-subtle-foreground [&_svg]:size-3">
                    {icon}
                  </div>
                  {label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}
