"use client";

import type { DropdownMenuProps } from "@radix-ui/react-dropdown-menu";

import { useEditorPlugin, useEditorSelector } from "@udecode/plate/react";
import { deleteColumn, deleteRow, deleteTable, insertTable, insertTableRow } from "@udecode/plate-table";
import { TablePlugin } from "@udecode/plate-table/react";
import { Minus, Plus, RectangleHorizontal, RectangleVertical, Table, Trash } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  useOpenState,
} from "./dropdown-menu";
import { ToolbarButton } from "./toolbar";

export function TableDropdownMenu(props: DropdownMenuProps) {
  const tableSelected = useEditorSelector((editor) => editor.api.some({ match: { type: TablePlugin.key } }), []);

  const { editor, tf } = useEditorPlugin(TablePlugin);

  const openState = useOpenState();

  return (
    <DropdownMenu modal={false} {...openState} {...props}>
      <DropdownMenuTrigger asChild>
        <ToolbarButton pressed={openState.open} tooltip="Table" isDropdown>
          <Table />
        </ToolbarButton>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="flex w-[180px] min-w-0 flex-col" align="start">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <Table />
              <span>Table</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                onSelect={() => {
                  insertTable(editor, {}, { select: true });
                  editor.tf.focus();
                }}
              >
                <Plus />
                Insert table
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  deleteTable(editor);
                  editor.tf.focus();
                }}
              >
                <Trash />
                Delete table
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!tableSelected}>
              <RectangleVertical />
              <span>Column</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  tf.insert.tableColumn();
                  editor.tf.focus();
                }}
              >
                <Plus />
                Insert column after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  deleteColumn(editor);
                  editor.tf.focus();
                }}
              >
                <Minus />
                Delete column
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>

          <DropdownMenuSub>
            <DropdownMenuSubTrigger disabled={!tableSelected}>
              <RectangleHorizontal />
              <span>Row</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  insertTableRow(editor);
                  editor.tf.focus();
                }}
              >
                <Plus />
                Insert row after
              </DropdownMenuItem>
              <DropdownMenuItem
                className="min-w-[180px]"
                disabled={!tableSelected}
                onSelect={() => {
                  deleteRow(editor);
                  editor.tf.focus();
                }}
              >
                <Minus />
                Delete row
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
