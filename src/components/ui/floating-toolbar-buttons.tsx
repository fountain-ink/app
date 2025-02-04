"use client";

import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { useEditorReadOnly, useEditorRef, useSelectionAcrossBlocks } from "@udecode/plate-common/react";
import { Bold, Code2, Italic, Strikethrough, Underline } from "lucide-react";

import { LinkToolbarButton } from "./link-toolbar-button";
import { MarkToolbarButton } from "./mark-toolbar-button";
import { MoreDropdownMenu } from "./more-dropdown-menu";
import { ToolbarGroup } from "./toolbar";
import { TurnIntoDropdownMenu } from "./turn-into-dropdown-menu";
import { InlineEquationToolbarButton } from "./inline-equation-toolbar-button";

export function FloatingToolbarButtons() {
  const _editor = useEditorRef();
  const readOnly = useEditorReadOnly();

  const isSelectionAcrossBlocks = useSelectionAcrossBlocks();

  return (
    <div
      className="flex"
      style={{
        transform: "translateX(calc(-1px))",
        whiteSpace: "nowrap",
      }}
    >
      {!readOnly && (
        <>
          {/* <ToolbarGroup>
            <AIToolbarButton
              className="gap-1.5"
              shortcut="⌘+J"
              tooltip="Edit, generate, and more"
            >
              <AIIcon className="!size-3" />
              <div className="hidden bg-[linear-gradient(120deg,#6EB6F2_10%,#a855f7,#ea580c,#eab308)] bg-clip-text text-transparent sm:inline">
                Ask AI
              </div>
            </AIToolbarButton>
          </ToolbarGroup> */}

          {/* <ToolbarGroup>{editor.plugins[CommentsPlugin.key] && <CommentToolbarButton />}</ToolbarGroup> */}
          <ToolbarGroup>
            <TurnIntoDropdownMenu />

            <MarkToolbarButton nodeType={BoldPlugin.key} tooltip="Bold">
              <Bold />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={ItalicPlugin.key} tooltip="Italic">
              <Italic />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={UnderlinePlugin.key} tooltip="Underline">
              <Underline />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={StrikethroughPlugin.key} tooltip="Strikethrough">
              <Strikethrough />
            </MarkToolbarButton>

            <MarkToolbarButton nodeType={CodePlugin.key} tooltip="Code">
              <Code2 />
            </MarkToolbarButton>

            <LinkToolbarButton />
          </ToolbarGroup>
          <ToolbarGroup>{!isSelectionAcrossBlocks && <MoreDropdownMenu />}</ToolbarGroup>
        </>
      )}
    </div>
  );
}
