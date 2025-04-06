"use client";

import React from "react";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { ParagraphPlugin, useEditorRef, useSelectionFragmentProp } from "@udecode/plate/react";
import {
  Code2Icon,
  Columns3Icon,
  Heading1Icon,
  Heading2Icon,
  LightbulbIcon,
  ListIcon,
  ListOrderedIcon,
  PilcrowIcon,
  QuoteIcon,
  SquareIcon,
} from "lucide-react";

import { getBlockType, setBlockType } from "@/lib/transforms";
import { BulletedListPlugin, NumberedListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
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
    icon: <PilcrowIcon />,
    keywords: ["paragraph"],
    label: "Text",
    value: ParagraphPlugin.key,
  },
  {
    icon: <Heading1Icon />,
    keywords: ["title", "h1"],
    label: "Heading",
    value: HEADING_KEYS.h1,
  },
  {
    icon: <Heading2Icon />,
    keywords: ["subtitle", "h2"],
    label: "Subheading",
    value: HEADING_KEYS.h2,
  },
  {
    icon: <SquareIcon />,
    keywords: ["checklist", "task", "checkbox", "[]"],
    label: "To-do list",
    value: TodoListPlugin.key,
  },
  {
    icon: <ListIcon />,
    keywords: ["unordered", "ul", "-"],
    label: "Bulleted list",
    value: BulletedListPlugin.key,
  },
  {
    icon: <ListOrderedIcon />,
    keywords: ["ordered", "ol", "1"],
    label: "Numbered list",
    value: NumberedListPlugin.key,
  },
  // {
  //   icon: <ChevronDownIcon />,
  //   keywords: ["collapsible", "expandable"],
  //   label: "Toggle list",
  //   value: TogglePlugin.key,
  // },
  {
    icon: <Code2Icon />,
    keywords: ["```"],
    label: "Code",
    value: CodeBlockPlugin.key,
  },
  {
    icon: <QuoteIcon />,
    keywords: ["citation", "blockquote", ">"],
    label: "Quote",
    value: BlockquotePlugin.key,
  },
  // {
  //   icon: <LightbulbIcon />,
  //   keywords: ["highlight", "note", "important"],
  //   label: "Callout",
  //   value: CalloutPlugin.key,
  // },
  // {
  //   icon: <Columns3Icon />,
  //   label: "3 columns",
  //   value: "action_three_columns",
  // },
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

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Turn into" isDropdown>
          {selectedItem?.label}
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuPortal>
        <DropdownMenuContent className="ignore-click-outside/toolbar min-w-0" data-plate-prevent-overlay align="start">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Turn into</DropdownMenuLabel>

            <DropdownMenuRadioGroup
              className="flex flex-col gap-0.5"
              value={selectedItem?.value}
              onValueChange={(type) => {
                setBlockType(editor, type);
                editor.tf.focus();
              }}
            >
              {turnIntoItems.map(({ icon, label, value: itemValue }) => (
                <DropdownMenuRadioItem key={itemValue} className="min-w-[180px] rounded-sm" value={itemValue}>
                  <div className="mr-2 flex size-5 items-center justify-center rounded-[4px] border border-foreground/15 bg-muted/50 p-0.5 text-subtle-foreground [&_svg]:size-3">
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
