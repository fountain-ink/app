"use client";

import { BasicMarksPlugin } from "@udecode/plate-basic-marks/react";
import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { ExitBreakPlugin, SoftBreakPlugin } from "@udecode/plate-break/react";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CaptionPlugin } from "@udecode/plate-caption/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import { ParagraphPlugin } from "@udecode/plate-common/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { DndPlugin } from "@udecode/plate-dnd";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HeadingPlugin, TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { HtmlReactPlugin } from "@udecode/plate-html/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { EquationPlugin, InlineEquationPlugin } from "@udecode/plate-math/react";
import {
    AudioPlugin,
    FilePlugin,
    ImagePlugin,
    MediaEmbedPlugin,
    PlaceholderPlugin,
    VideoPlugin,
} from "@udecode/plate-media/react";
import { MentionPlugin } from "@udecode/plate-mention/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { DeletePlugin, SelectOnBackspacePlugin } from "@udecode/plate-select";
import { BlockMenuPlugin, BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TableCellPlugin, TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
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
import { isCodeBlockEmpty, isSelectionAtCodeBlockStart, unwrapCodeBlock } from "@udecode/plate-code-block";
import { CodeBlockPlugin, CodeSyntaxPlugin } from "@udecode/plate-code-block/react";
import {
    getNextNode,
    getParentNode,
    insertNodes,
    isBlockAboveEmpty,
    isSelectionAtBlockStart,
    someNode,
} from "@udecode/plate-common";
import { FontSizePlugin } from "@udecode/plate-font/react";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { ListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
import { MentionInputPlugin } from "@udecode/plate-mention/react";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { TabbablePlugin } from "@udecode/plate-tabbable/react";
import { TableCellHeaderPlugin, TableRowPlugin } from "@udecode/plate-table/react";
import { YjsPlugin } from "@udecode/plate-yjs/react";
import { Path } from "slate";
import { toast } from "sonner";
import { autoformatRules } from "./plugins/editor-autoformat";
import Prism from "prismjs";
import { RenderAboveEditableYjs } from "./plugins/yjs-above-editable";
import { NormalizePlugin } from "./plugins/editor-normalization";
import { LinkFloatingToolbar } from "../ui/link-floating-toolbar";
import { ImageElement } from "../ui/image-element";
import { BlockContextMenu } from "../ui/block-context-menu";

export const getEditorPlugins = (path: string, handle?: string, refreshToken?: string, readOnly?: boolean) => {
  const plugins = [...staticPlugins];

  if (refreshToken && handle) {
    plugins.push(
      YjsPlugin.configure({
        render: {
          aboveEditable: RenderAboveEditableYjs,
        },
        options: {
          cursorOptions: {
            autoSend: true,
            data: {
              name: handle || "kualta",
              color: "#ff0000",
            },
          },
          disableCursors: false,
          hocuspocusProviderOptions: {
            // url: "ws://0.0.0.0:4444",
            url: "https://collab.fountain.ink",
            name: path,
            connect: false,
            token: refreshToken,
            onStatus(data) {
              console.log(`[Collab] Status ${data.status}`);
            },
            onClose(data) {
              console.log(`[Collab] Closed ${data.event.code} ${data.event.reason}`);
              console.log(data);
            },
            onAuthenticated() {
              console.log("[Collab] Authenticated");
            },
            onConnect() {
              console.log("[Collab] Connected");
            },
            onSynced() {
              console.log("[Collab] Synced");
            },
            onAuthenticationFailed(data) {
              toast.error(`Authentication failed: ${data.reason}`);
              console.error(`[Collab] Authentication failed: ${data.reason}`);
            },
            onDisconnect(data) {
              console.error(`[Collab] Disconnected: ${data.event.reason}`);
            },
          },
        },
      }) as any,
      CommentsPlugin.configure({
        options: {
          users: {
            1: {
              id: "1",
              name: handle || "kualta",
              avatarUrl: "https://avatars.githubusercontent.com/u/19695832?s=96&v=4",
            },
          },
          myUserId: "1",
        },
      }) as any,
    );
  }

  if (!readOnly) {
    plugins.push(
      BlockSelectionPlugin.configure({
        inject: {
          excludeBelowPlugins: ["tr"],
          excludePlugins: ["table", "code_line", "column_group", "column"],
        },
        options: {
          areaOptions: {
            behaviour: {
              scrolling: {
                speedDivider: 1.5,
              },
              startThreshold: 4,
            },
            boundaries: "#scroll_container",
            container: "#scroll_container",
            selectables: "#scroll_container .slate-selectable",
            selectionAreaClass: "slate-selection-area",
          },
          enableContextMenu: true,
        },
      }) as any,
    );
  }

  return plugins;
};

export const staticPlugins = [
  NormalizePlugin,
  HeadingPlugin.configure({
    options: { levels: 4 },
    handlers: {
      onKeyDown: ({ event, editor }) => {
        const anchor = editor.selection?.anchor?.path;
        if (!anchor) return;

        const currentNode = getParentNode(editor, anchor);
        if (!currentNode) return;

        const [node, path] = currentNode;
        const isTitle = node.type === HEADING_KEYS.h1;
        const isSubtitle = node.type === HEADING_KEYS.h2;
        const isImage = node.type === ImagePlugin.key;

        if (event.key === "Enter") {
          if (!isTitle && !isSubtitle && !isImage) return;

          event.preventDefault();

          if (isTitle) {
            const nextNode = getNextNode(editor, { at: path });
            const isNextSubtitle = nextNode?.[0]?.type === HEADING_KEYS.h2;

            if (!isNextSubtitle) {
              insertNodes(
                editor,
                { type: HEADING_KEYS.h2, children: [{ text: "" }] },
                { at: Path.next(path), select: true },
              );
            } else {
              editor.select(nextNode[1]);
              editor.collapse({ edge: "end" });
            }
            return;
          }

          if (isSubtitle) {
            insertNodes(
              editor,
              { type: ParagraphPlugin.key, children: [{ text: "" }] },
              { at: Path.next(path), select: true },
            );

            return;
          }

          if (isImage) {
            insertNodes(
              editor,
              { type: ParagraphPlugin.key, children: [{ text: "" }] },
              { at: Path.next(path), select: true },
            );

            return;
          }
        }
      },
    },
  }),
  BlockquotePlugin,
  CodeBlockPlugin.configure({ options: { prism: Prism, syntaxPopularFirst: true, syntax: true } }),
  HorizontalRulePlugin,
  LinkPlugin.extend({
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),
  MediaEmbedPlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin, MediaEmbedPlugin] },
  }),
  DatePlugin,
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }),

  SlashPlugin,
  TablePlugin.configure({ options: { enableMerging: true } }),
  TogglePlugin,
  TocPlugin.configure({
    options: {
      isScroll: true,
      topOffset: 80,
    },
  }),
  PlaceholderPlugin,
  ImagePlugin.extend({
    render: {
      // afterEditable: ImagePreview,
      node: ImageElement,
    },
  }),
  VideoPlugin,
  AudioPlugin,
  MediaEmbedPlugin,
  FilePlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin] },
  }),
  InlineEquationPlugin,
  EquationPlugin,
  CalloutPlugin,
  ColumnPlugin,

  // Marks
  BasicMarksPlugin,
  HighlightPlugin,
  KbdPlugin,

  // Block Style
  AlignPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        MediaEmbedPlugin.key,
        // HEADING_KEYS.h1,
        // HEADING_KEYS.h2,
        HEADING_KEYS.h3,
        HEADING_KEYS.h4,
        HEADING_KEYS.h5,
        ImagePlugin.key,
        HEADING_KEYS.h6,
      ],
    },
  }),
  IndentPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        // HEADING_KEYS.h1,
        // HEADING_KEYS.h2,
        HEADING_KEYS.h3,
        HEADING_KEYS.h4,
        HEADING_KEYS.h5,
        HEADING_KEYS.h6,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        TogglePlugin.key,
      ],
    },
  }),
  // IndentListPlugin.extend({
  //   inject: {

  //     targetPlugins: [
  //       // ParagraphPlugin.key,
  //       // HEADING_KEYS.h1,
  //       // HEADING_KEYS.h2,
  //       HEADING_KEYS.h3,
  //       HEADING_KEYS.h4,
  //       HEADING_KEYS.h5,
  //       HEADING_KEYS.h6,
  //       BlockquotePlugin.key,
  //       CodeBlockPlugin.key,
  //       TogglePlugin.key,
  //     ],
  //   },
  //   options: {
  //     listStyleTypes: {
  //       todo: {
  //         liComponent: TodoLi,
  //         markerComponent: TodoMarker,
  //         type: "todo",
  //       },
  //     },
  //   },
  // }),

  ListPlugin,
  TodoListPlugin,

  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: autoformatRules,
    },
  }),

  BlockMenuPlugin.extend(({ api }) => ({
    handlers: {
      onMouseDown: ({ event, getOptions }) => {
        // Prevent unset block selection when menu is closing
        if (event.button === 0 && getOptions().openId) {
          event.preventDefault();
          api.blockMenu.hide();
        }
        if (event.button === 2) event.preventDefault();
      },
    },
  })).configure({
    render: { aboveEditable: BlockContextMenu },
  }),
  DndPlugin.configure({ options: { enableScroller: true } }),
  EmojiPlugin,
  ExitBreakPlugin.configure({
    options: {
      rules: [
        {
          hotkey: "mod+enter",
        },
        {
          before: true,
          hotkey: "mod+shift+enter",
        },
        {
          hotkey: "enter",
          level: 1,
          query: {
            allow: HEADING_LEVELS,
            end: true,
            start: true,
          },
          relative: true,
        },
      ],
    },
  }),
  NodeIdPlugin,
  SelectOnBackspacePlugin.configure({
    options: {
      query: {
        allow: [ImagePlugin.key, HorizontalRulePlugin.key],
      },
    },
  }),
  DeletePlugin,
  SoftBreakPlugin.configure({
    options: {
      rules: [
        { hotkey: "shift+enter" },
        {
          hotkey: "enter",
          query: {
            allow: [CodeBlockPlugin.key, BlockquotePlugin.key, TableCellPlugin.key, CalloutPlugin.key],
          },
        },
      ],
    },
  }),
  TrailingBlockPlugin.configure({
    options: { type: ParagraphPlugin.key },
  }),

  // Deserialization
  DocxPlugin,
  MarkdownPlugin.configure({
    options: {
      indentList: false,
    },
  }),
  JuicePlugin,
  HtmlReactPlugin,
  CodeSyntaxPlugin,
  MentionInputPlugin,
  TableRowPlugin,
  TableCellPlugin,
  TableCellHeaderPlugin,
  // ExcalidrawPlugin,
  ColumnItemPlugin,

  // Marks
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  FontSizePlugin,

  // Functionality
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          types: [BlockquotePlugin.key, TodoListPlugin.key],
          defaultType: ParagraphPlugin.key,
          hotkey: "Enter",
          predicate: isBlockAboveEmpty,
        },
        {
          types: [BlockquotePlugin.key, TodoListPlugin.key],
          defaultType: ParagraphPlugin.key,
          hotkey: "Backspace",
          predicate: isSelectionAtBlockStart,
        },
        {
          types: [CodeBlockPlugin.key],
          defaultType: ParagraphPlugin.key,
          onReset: unwrapCodeBlock,
          hotkey: "Enter",
          predicate: isCodeBlockEmpty,
        },
        {
          types: [CodeBlockPlugin.key],
          defaultType: ParagraphPlugin.key,
          onReset: unwrapCodeBlock,
          hotkey: "Backspace",
          predicate: isSelectionAtCodeBlockStart,
        },
      ],
    },
  }),
  TabbablePlugin.configure(({ editor }) => ({
    options: {
      query: () => {
        if (isSelectionAtBlockStart(editor)) return false;

        return !someNode(editor, {
          match: (n) => {
            return !!(
              n.type &&
              ([TablePlugin.key, TodoListPlugin.key, CodeBlockPlugin.key].includes(n.type as string) || n.listStyleType)
            );
          },
        });
      },
    },
  })),
];
