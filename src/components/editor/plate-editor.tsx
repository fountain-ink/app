"use client";

import { proseClasses } from "@/styles/prose";
import { cn, withProps } from "@udecode/cn";
import { AlignPlugin } from "@udecode/plate-alignment/react";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import {
  BoldPlugin,
  CodePlugin,
  ItalicPlugin,
  StrikethroughPlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  UnderlinePlugin,
} from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { CaptionPlugin } from "@udecode/plate-caption/react";
import { isCodeBlockEmpty, isSelectionAtCodeBlockStart, unwrapCodeBlock } from "@udecode/plate-code-block";
import { CodeBlockPlugin, CodeLinePlugin, CodeSyntaxPlugin } from "@udecode/plate-code-block/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import { isBlockAboveEmpty, isSelectionAtBlockStart, someNode } from "@udecode/plate-common";
import { ParagraphPlugin, Plate, PlateLeaf, usePlateEditor } from "@udecode/plate-common/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { DndPlugin } from "@udecode/plate-dnd";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
// import { ExcalidrawPlugin } from '@udecode/plate-excalidraw/react';
import { FontBackgroundColorPlugin, FontColorPlugin, FontSizePlugin } from "@udecode/plate-font/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HeadingPlugin, TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { IndentListPlugin } from "@udecode/plate-indent-list/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
// import { LineHeightPlugin } from '@udecode/plate-line-height/react';
import { LinkPlugin } from "@udecode/plate-link/react";
import { TodoListPlugin } from "@udecode/plate-list/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { ImagePlugin, MediaEmbedPlugin } from "@udecode/plate-media/react";
import { MentionInputPlugin, MentionPlugin } from "@udecode/plate-mention/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { NormalizeTypesPlugin } from "@udecode/plate-normalizers";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { SelectOnBackspacePlugin } from "@udecode/plate-select";
import { BlockMenuPlugin, BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { SlashInputPlugin, SlashPlugin } from "@udecode/plate-slash-command/react";
import { TabbablePlugin } from "@udecode/plate-tabbable/react";
import { TableCellHeaderPlugin, TableCellPlugin, TablePlugin, TableRowPlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { YjsPlugin } from "@udecode/plate-yjs/react";
import { useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import * as Y from "yjs";
// import { AILeaf } from '../ui/ai-leaf';
import { BlockContextMenu } from "../ui/block-context-menu";
import { BlockquoteElement } from "../ui/blockquote-element";
import { CodeBlockElement } from "../ui/code-block-element";
import { CodeLeaf } from "../ui/code-leaf";
import { CodeLineElement } from "../ui/code-line-element";
import { CodeSyntaxLeaf } from "../ui/code-syntax-leaf";
import { ColumnElement } from "../ui/column-element";
import { ColumnGroupElement } from "../ui/column-group-element";
import { CommentLeaf } from "../ui/comment-leaf";
import { CommentsPopover } from "../ui/comments-popover";
import { CursorOverlay, DragOverCursorPlugin, SelectionOverlayPlugin } from "../ui/cursor-overlay";
import { DateElement } from "../ui/date-element";
import { Editor } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { HeadingElement } from "../ui/heading-element";
import { HighlightLeaf } from "../ui/highlight-leaf";
import { HrElement } from "../ui/hr-element";
import { ImageElement } from "../ui/image-element";
import { TodoLi, TodoMarker } from "../ui/indent-todo-marker";
import { KbdLeaf } from "../ui/kbd-leaf";
import { LinkElement } from "../ui/link-element";
import { LinkFloatingToolbar } from "../ui/link-floating-toolbar";
import { MediaEmbedElement } from "../ui/media-embed-element";
import { MentionElement } from "../ui/mention-element";
import { MentionInputElement } from "../ui/mention-input-element";
import { ParagraphElement } from "../ui/paragraph-element";
import { withPlaceholders } from "../ui/placeholder";
import { SlashInputElement } from "../ui/slash-input-element";
import { TableCellElement, TableCellHeaderElement } from "../ui/table-cell-element";
import { TableElement } from "../ui/table-element";
import { TableRowElement } from "../ui/table-row-element";
import { TocElement } from "../ui/toc-element";
import { TodoListElement } from "../ui/todo-list-element";
import { ToggleElement } from "../ui/toggle-element";
import { withDraggables } from "../ui/with-draggables";
import { autoformatRules } from "./plate-autoformat";
import { createPotionUI } from "./plate-create-ui";
import { commonPlugins } from "./plate-plugins";
import { RenderAboveEditableYjs } from "./yjs-above-editable";

export default function PlateEditor() {
  const containerRef = useRef(null);
  const editor = useMyEditor();

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor}>
        <div
          id="scroll_container"
          ref={containerRef}
          className={cn(
            "relative",
            // Block selection
            "[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4",
          )}
        >
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor disableDefaultStyles className={proseClasses} autoFocus focusRing={false} variant="ghost" />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <CommentsPopover />

          <CursorOverlay containerRef={containerRef} />
        </div>

        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...commonPlugins],
    override: {
      components: createPotionUI(),
      // value: [
      //   {
      //     id: "1",
      //     type: "h1",
      //     children: [{ text: "Playground" }],
      //   },
      //   {
      //     id: "2",
      //     type: ParagraphPlugin.key,
      //     children: [
      //       { text: "A rich-text editor with AI capabilities. Try the " },
      //       { text: "AI commands", bold: true },
      //       { text: " or use " },
      //       { text: "Cmd+J", kbd: true },
      //       { text: " to open the AI menu." },
      //     ],
      //   },
      // ],
    },
  });
};
