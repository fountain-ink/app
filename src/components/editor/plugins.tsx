import { LinkFloatingToolbar } from "@/components/ui/link-floating-toolbar";
import { useYjsState } from "@/hooks/use-yjs-state";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { PathApi, TElement, TNode, TText } from "@udecode/plate";
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
import { unwrapCodeBlock } from "@udecode/plate-code-block";
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
import { MarkdownPlugin, MdastTypes, remarkMention, remarkMdx, SerializeMdOptions } from "@udecode/plate-markdown";
import { EquationPlugin, InlineEquationPlugin } from "@udecode/plate-math/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  // MediaEmbedPlugin,
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
import { all, createLowlight } from "lowlight";
import { toast } from "sonner";
import { ImageElement } from "../ui/image-element";
import { ImagePreview } from "../ui/image-preview";
import { RemoteCursorOverlay } from "../ui/remote-cursor-overlay";
import { LeadingBlockPlugin } from "./plugins/leading-block-plugin";
import { NormalizePlugin } from "./plugins/normalize-plugin";
import { SubtitlePlugin, TITLE_KEYS, TitlePlugin } from "./plugins/title-plugin";
import emojiMartData, { type EmojiMartData } from "@emoji-mart/data";
import { autoformatRules } from "./plugins/autoformat-rules";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import { TEquationElement } from "@udecode/plate-math";
import { Heading, Text } from "mdast";
import { uploadFile } from "@/lib/upload/upload-file";
import { getRandomUid } from "@/lib/get-random-uid";
import { IframePlugin } from "./plugins/iframe-plugin";
import { BlockquoteNormalizePlugin } from "./plugins/blockquote-normalize-plugin";

const lowlight = createLowlight(all);

const resetBlockTypesCommonRule = {
  defaultType: ParagraphPlugin.key,
  types: [
    ...HEADING_LEVELS,
    ImagePlugin.key,
    BlockquotePlugin.key,
    ListStyleType.Disc,
    ListStyleType.Decimal,
    CalloutPlugin.key,
  ],
};

const resetBlockTypesCodeBlockRule = {
  defaultType: ParagraphPlugin.key,
  types: [CodeBlockPlugin.key],
  onReset: unwrapCodeBlock,
};

export const getEditorPlugins = (path: string, appToken?: string, isReadOnly?: boolean, collaborative = false) => {
  const pluginsList = [...plugins];

  const username = appToken ? getTokenClaims(appToken)?.metadata.username : undefined;

  if (appToken && collaborative) {
    pluginsList.push(
      YjsPlugin.configure({
        render: {
          beforeEditable: RemoteCursorOverlay,
        },
        options: {
          cursors: {
            autoSend: true,
            data: {
              name: username || "anonymous",
              color: "#0101af",
            },
          },
          providers: [
            {
              type: "hocuspocus",
              options: {
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
          ],
        },
      }) as any,
      // ExtendedCommentsPlugin.configure({
      //   render: {
      //     aboveNodes: BlockDiscussion as any,
      //     afterEditable: AfterEditableComments as any,
      //   },
      // }),
    );
  }

  if (!isReadOnly) {
    pluginsList.push(
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

  return pluginsList;
};

export const plugins = [
  NormalizePlugin,
  BlockquoteNormalizePlugin,
  TrailingBlockPlugin,
  LeadingBlockPlugin.configure({
    options: {
      type: TitlePlugin.key,
    },
  }),
  TitlePlugin.configure({
    handlers: {
      onPaste: (ctx) => {
        const { editor, event } = ctx;
        const anchor = editor.selection?.anchor?.path;
        if (!anchor) return false;

        const currentNode = editor.api.parent(anchor);
        if (!currentNode) return false;

        const [node] = currentNode;
        const isTitle = node.type === TITLE_KEYS.title;
        const isSubtitle = node.type === TITLE_KEYS.subtitle;

        if (isTitle || isSubtitle) {
          event.preventDefault();
          event.stopPropagation();

          const textToPaste = event.clipboardData?.getData("text/plain");
          if (textToPaste) {
            const singleLineText = textToPaste.replace(/(\r\n|\n|\r)/gm, "").trim();
            editor.tf.insertText(singleLineText);
          }
          return true;
        }
        return false;
      },
    },
  }),
  SubtitlePlugin,
  IframePlugin,
  HeadingPlugin.configure({
    options: { levels: 2 },
    handlers: {
      onKeyDown: (ctx) => {
        const { editor, event } = ctx;
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
  CodeBlockPlugin.configure({ options: { lowlight } }),
  CodePlugin,
  HorizontalRulePlugin,
  LinkPlugin.extend({
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),
  // MediaEmbedPlugin,
  CaptionPlugin.configure({
    options: { plugins: [ImagePlugin, IframePlugin, CodeBlockPlugin, EquationPlugin] },
  }),
  DatePlugin,
  MentionPlugin.configure({
    options: { triggerPreviousCharPattern: /^$|^[\s"']$/ },
  }),
  SlashPlugin.extend({
    options: {
      trigger: "/",
      // triggerQuery(editor) {
      //   return !editor.api.some({
      //     match: { type: editor.getType(CodeBlockPlugin) },
      //   });
      // },
    },
  }),

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
    node: {
      isVoid: true,
      isElement: true,
    },
  }),
  ImagePlugin.extend({
    render: {
      afterEditable: ImagePreview,
      node: ImageElement,
    },
    node: {
      isVoid: true,
      isElement: true,
    },
    options: {
      uploadImage: uploadFile,
    },
  }),
  VideoPlugin,
  AudioPlugin,
  FilePlugin,
  InlineEquationPlugin,
  EquationPlugin,
  CalloutPlugin,
  ColumnPlugin,
  BasicMarksPlugin,
  HighlightPlugin,
  KbdPlugin,
  AlignPlugin.extend({
    inject: {
      nodeProps: {
        validNodeValues: ["start", "left", "center", "right", "end"],
      },
      targetPlugins: [ParagraphPlugin.key, HEADING_KEYS.h1, HEADING_KEYS.h2, ImagePlugin.key],
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
  EmojiPlugin.configure({ options: { data: emojiMartData as EmojiMartData } }),
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
        allow: [
          ImagePlugin.key,
          PlaceholderPlugin.key,
          VideoPlugin.key,
          AudioPlugin.key,
          FilePlugin.key,
          IframePlugin.key,
          // TitlePlugin.key,
          // SubtitlePlugin.key
        ],
      },
    },
    handlers: {
      onKeyDown: ({ event, editor }: { event: React.KeyboardEvent; editor: PlateEditor }) => {
        if (event.key !== "Backspace") return;

        if (!editor.selection || !editor.selection.anchor || !editor.selection.focus) return;

        const anchor = editor.selection.anchor.path;
        if (!anchor) return;

        const currentNode = editor.api.parent(anchor);
        if (!currentNode) return;

        const [node, path] = currentNode;

        if (node.type === ParagraphPlugin.key && editor.api.isEmpty(editor.selection, { block: true })) {
          event.preventDefault();

          // Get the previous node's path before removing the current one
          const prevPath = PathApi.previous(path);

          editor.tf.removeNodes({ at: path });

          // Select the end of the previous node if it exists
          if (prevPath) {
            editor.tf.select(prevPath);
            editor.tf.collapse({ edge: "end" });
          }
        }
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
  DocxPlugin,
  MarkdownPlugin.configure({
    options: {
      remarkPlugins: [remarkMath, remarkGfm, remarkMdx, remarkMention],
      rules: {
        [TitlePlugin.key]: {
          serialize: (slateNode: TElement): Heading | Text => {
            const text = slateNode.children[0]?.text;

            if (!text || text === "") {
              return { type: "text", value: "" };
            }

            return {
              type: "heading",
              children: [{ type: "text", value: text as string }],
              depth: 1,
            };
          },
          deserialize: (mdastNode: Heading) => {
            if (!mdastNode || !mdastNode.children[0]) return;

            if (mdastNode.depth === 1) {
              const text = "value" in mdastNode.children[0] ? mdastNode.children[0].value : "";
              return {
                type: TitlePlugin.key,
                children: [{ text }],
              };
            }
          },
        },
        [SubtitlePlugin.key]: {
          serialize: (slateNode: TElement): Heading | Text => {
            const text = slateNode.children[0]?.text;

            if (!text || text === "") {
              return { type: "text", value: "" };
            }

            return {
              type: "heading",
              children: [{ type: "text", value: text as string }],
              depth: 2,
            };
          },
          deserialize: (mdastNode: Heading) => {
            if (!mdastNode || !mdastNode.children[0]) return;

            const text = "value" in mdastNode.children[0] ? mdastNode.children[0].value : "";
            if (mdastNode.depth === 2) {
              return {
                type: SubtitlePlugin.key,
                children: [{ text }],
              };
            }
          },
        },
        [EquationPlugin.key]: {
          serialize: (node: TEquationElement) => ({
            type: "math",
            value: node.texExpression,
          }),
        },
      },
    },
  }),
  JuicePlugin,
  CodeSyntaxPlugin,
  MentionInputPlugin,
  ColumnItemPlugin,
  BoldPlugin,
  ItalicPlugin,
  UnderlinePlugin,
  StrikethroughPlugin,
  CodePlugin,
  SubscriptPlugin,
  SuperscriptPlugin,
  ResetNodePlugin.configure({
    options: {
      rules: [
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Enter",
          predicate: (editor) => {
            if (!editor.selection) return false;
            return editor.api.isEmpty(editor.selection, { block: true });
          },
        },
        {
          ...resetBlockTypesCommonRule,
          hotkey: "Backspace",
          predicate: (editor) => {
            if (!editor.selection) return false;
            return editor.api.isEmpty(editor.selection, { block: true });
          },
        },
        // {
        //   ...resetBlockTypesCommonRule,
        //   hotkey: "Backspace",
        //   predicate: (editor) => editor.api.isAt({ start: true }),
        // },
        // {
        //   ...resetBlockTypesCodeBlockRule,
        //   hotkey: "Enter",
        //   predicate: (editor) => isCodeBlockEmpty(editor),
        // },
        // {
        //   ...resetBlockTypesCodeBlockRule,
        //   hotkey: "Backspace",
        //   predicate: (editor) => editor.api.isAt({ start: true, empty: true }),
        // },
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
