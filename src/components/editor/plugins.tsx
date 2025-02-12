import { LinkFloatingToolbar } from "@/components/ui/link-floating-toolbar";
import { useYjsState } from "@/hooks/use-yjs-state";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { PathApi } from "@udecode/plate";
import { AlignPlugin } from "@udecode/plate-alignment/react";
import { AutoformatPlugin } from "@udecode/plate-autoformat/react";
import {
  BasicMarksPlugin,
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
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CaptionPlugin } from "@udecode/plate-caption/react";
import { isCodeBlockEmpty, unwrapCodeBlock } from "@udecode/plate-code-block";
import { CodeBlockPlugin, CodeSyntaxPlugin } from "@udecode/plate-code-block/react";
import { CommentsPlugin } from "@udecode/plate-comments/react";
import { ParagraphPlugin, PlateEditor } from "@udecode/plate-core/react";
import { DatePlugin } from "@udecode/plate-date/react";
import { DndPlugin } from "@udecode/plate-dnd";
import { DocxPlugin } from "@udecode/plate-docx";
import { EmojiPlugin } from "@udecode/plate-emoji/react";
import { HEADING_KEYS, HEADING_LEVELS } from "@udecode/plate-heading";
import { HeadingPlugin, TocPlugin } from "@udecode/plate-heading/react";
import { HighlightPlugin } from "@udecode/plate-highlight/react";
import { HorizontalRulePlugin } from "@udecode/plate-horizontal-rule/react";
import { ListStyleType } from "@udecode/plate-indent-list";
import { IndentPlugin } from "@udecode/plate-indent/react";
import { JuicePlugin } from "@udecode/plate-juice";
import { KbdPlugin } from "@udecode/plate-kbd/react";
import { ColumnItemPlugin, ColumnPlugin } from "@udecode/plate-layout/react";
import { LinkPlugin } from "@udecode/plate-link/react";
import { ListPlugin, TodoListPlugin } from "@udecode/plate-list/react";
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
import { MentionInputPlugin, MentionPlugin } from "@udecode/plate-mention/react";
import { NodeIdPlugin } from "@udecode/plate-node-id";
import { ResetNodePlugin } from "@udecode/plate-reset-node/react";
import { DeletePlugin, SelectOnBackspacePlugin } from "@udecode/plate-select";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { SlashPlugin } from "@udecode/plate-slash-command/react";
import { TabbablePlugin } from "@udecode/plate-tabbable/react";
import { TableCellHeaderPlugin, TableCellPlugin, TablePlugin, TableRowPlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";
import { TrailingBlockPlugin } from "@udecode/plate-trailing-block";
import { YjsPlugin } from "@udecode/plate-yjs/react";
import Prism from "prismjs";
import { toast } from "sonner";
import { ImagePreview } from "../ui/image-preview";
import { RemoteCursorOverlay } from "../ui/remote-cursor-overlay";
import { autoformatRules } from "./plugins/autoformat-rules";
import { NormalizePlugin } from "./plugins/normalize-plugin";
import { LeadingBlockPlugin } from "./plugins/leading-block-plugin";
import { SubtitlePlugin, TITLE_KEYS, TitlePlugin } from "./plugins/title-plugin";

const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [...HEADING_LEVELS, BlockquotePlugin.key, ListStyleType.Disc, ListStyleType.Decimal, CalloutPlugin.key],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: ParagraphPlugin.key,
  types: [CodeBlockPlugin.key],
  onReset: unwrapCodeBlock,
};

export const getEditorPlugins = (path: string, appToken?: string, isReadOnly?: boolean) => {
  const plugins = [...staticPlugins];

  const username = appToken ? getTokenClaims(appToken)?.metadata.username : undefined;

  if (appToken) {
    plugins.push(
      YjsPlugin.configure({
        render: {
          beforeEditable: RemoteCursorOverlay,
        },
        options: {
          cursorOptions: {
            autoSend: true,
            data: {
              name: username || "anonymous",
              color: "#0101af",
            },
          },
          disableCursors: false,
          hocuspocusProviderOptions: {
            // url: "ws://0.0.0.0:4444",
            url: "https://collab.fountain.ink",
            name: path,
            connect: false,
            token: appToken,
            onOpen: () => {
              useYjsState.getState().setActiveDocument(path);
            },
            onDestroy: () => {
              useYjsState.getState().setStatus(path, "disconnected");
              useYjsState.getState().setActiveDocument(null);
            },
            onStatus(data: any) {
              useYjsState.getState().setStatus(path, data.status);
            },
            onClose(data: any) {
              useYjsState.getState().setError(path, `Connection closed: ${data.event.reason}`);
            },
            onAuthenticated() {
              useYjsState.getState().setStatus(path, "connected");
            },
            onConnect() {
              useYjsState.getState().setStatus(path, "connected");
            },
            onSynced() {
              useYjsState.getState().setStatus(path, "synced");
            },
            onAuthenticationFailed(data: any) {
              toast.error(`Authentication failed: ${data.reason}`);
              useYjsState.getState().setError(path, `Authentication failed: ${data.reason}`);
            },
            onDisconnect(data: any) {
              useYjsState.getState().setStatus(path, "disconnected");
              if (data.event.reason) {
                useYjsState.getState().setError(path, data.event.reason);
              }
            },
          },
        },
      }) as any,
      CommentsPlugin.configure({
        options: {
          users: {
            1: {
              id: "1",
              name: username || "anonymous",
              avatarUrl: "https://avatars.githubusercontent.com/u/19695832?s=96&v=4",
            },
          },
          myUserId: "1",
        },
      }) as any,
    );
  }

  if (!isReadOnly) {
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
  LeadingBlockPlugin.configure({
    options: {
      type: TitlePlugin.key,
    },
  }),
  TitlePlugin,
  SubtitlePlugin,
  HeadingPlugin.configure({
    options: { levels: 4 },
    handlers: {
      onKeyDown: ({ event, editor }: { event: any; editor: PlateEditor }) => {
        const anchor = editor.selection?.anchor?.path;
        if (!anchor) return;

        const currentNode = editor.api.parent(anchor);
        if (!currentNode) return;

        const [node, path] = currentNode;

        const isTitle = node.type === TITLE_KEYS.title;
        const isSubtitle = node.type === TITLE_KEYS.subtitle;
        const isImage = node.type === ImagePlugin.key;

        if (event.key === "Enter") {
          if (!isTitle && !isSubtitle && !isImage) return;

          event.preventDefault();

          if (isTitle) {
            const nextNode = editor.api.next({ at: path });
            const isNextSubtitle = nextNode?.[0]?.type === TITLE_KEYS.subtitle;

            if (!isNextSubtitle) {
              editor.tf.insertNodes(
                { type: TITLE_KEYS.subtitle, children: [{ text: "" }] },
                { at: PathApi.next(path), select: true },
              );
            } else {
              editor.tf.select(nextNode[1]);
              editor.tf.collapse({ edge: "end" });
            }
            return;
          }

          if (isSubtitle) {
            editor.tf.insertNodes(
              { type: ParagraphPlugin.key, children: [{ text: "" }] },
              { at: PathApi.next(path), select: true },
            );

            return;
          }

          if (isImage) {
            editor.tf.insertNodes(
              { type: ParagraphPlugin.key, children: [{ text: "" }] },
              { at: PathApi.next(path), select: true },
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
    options: { plugins: [ImagePlugin, MediaEmbedPlugin, CodeBlockPlugin, EquationPlugin] },
  }),
  DatePlugin,
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }),

  SlashPlugin,

  TablePlugin.configure({
    options: {
      // minColumnWidth: 60,
      // disableExpandOnInsert: true,
      // initialTableWidth: 500,
    },
  }),
  TogglePlugin,
  TocPlugin.configure({
    options: {
      // isScroll: true,
      topOffset: 80,
    },
  }),
  PlaceholderPlugin.configure({
    options: {
      // disableEmptyPlaceholder: true,
    },
    // render: { afterEditable: MediaUploadToast },
  }),
  ImagePlugin.extend({
    render: {
      afterEditable: ImagePreview,
    },
  }),
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  MediaEmbedPlugin,

  // ImagePlugin.extend({
  //   render: {
  //     node: ImageElement,
  //   },
  // }).configure({
  //   options: {
  //     uploadImage: uploadFile,
  //     // disableUploadInsert: true,
  //     // disableEmbedInsert: true,
  //   },
  // }),
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
      targetPlugins: [ParagraphPlugin.key, MediaEmbedPlugin.key, HEADING_KEYS.h1, HEADING_KEYS.h2, ImagePlugin.key],
    },
  }),
  IndentPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        HEADING_KEYS.h1,
        HEADING_KEYS.h2,
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

  // BlockMenuPlugin.extend(({ api }) => ({
  //   handlers: {
  //     onMouseDown: ({ event, getOptions }) => {
  //       // Prevent unset block selection when menu is closing
  //       if (event.button === 0 && getOptions().openId) {
  //         event.preventDefault();
  //         api.blockMenu.hide();
  //       }
  //       if (event.button === 2) event.preventDefault();
  //     },
  //   },
  // })).configure({
  //   render: { aboveEditable: BlockContextMenu },
  // }),
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
        allow: [ImagePlugin.key, VideoPlugin.key, AudioPlugin.key, FilePlugin.key, MediaEmbedPlugin.key],
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
  // FontSizePlugin,

  // Functionality
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Enter",
          predicate: (editor) => editor.api.isEmpty(editor.selection, { block: true }),
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Backspace",
          predicate: (editor) => editor.api.isAt({ start: true }),
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: "Enter",
          predicate: (editor) => isCodeBlockEmpty(editor),
        },
        {
          ...resetBlockTypesCodeBlockRule,
          hotkey: "Backspace",
          predicate: (editor) => editor.api.isAt({ start: true }),
        },
      ],
    },
  }),
  TabbablePlugin.configure(({ editor }: { editor: any }) => ({
    options: {
      query: (event) => {
        const inList = editor.api.node(editor, { match: { type: ListPlugin.key } });
        const inCodeBlock = editor.api.node(editor, { match: { type: CodeBlockPlugin.key } });
        return !inList && !inCodeBlock;
      },
    },
  })),
];
