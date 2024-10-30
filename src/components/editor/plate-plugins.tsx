'use client';

import { AlignPlugin } from '@udecode/plate-alignment/react';
import { AutoformatPlugin } from '@udecode/plate-autoformat/react';
import { BasicMarksPlugin } from '@udecode/plate-basic-marks/react';
import { BlockquotePlugin } from '@udecode/plate-block-quote/react';
import { ExitBreakPlugin, SoftBreakPlugin } from '@udecode/plate-break/react';
import { CalloutPlugin } from '@udecode/plate-callout/react';
import { CaptionPlugin } from '@udecode/plate-caption/react';
import { CodeBlockPlugin } from '@udecode/plate-code-block/react';
import { CommentsPlugin } from '@udecode/plate-comments/react';
import { ParagraphPlugin } from '@udecode/plate-common/react';
import { DatePlugin } from '@udecode/plate-date/react';
import { DndPlugin } from '@udecode/plate-dnd';
import { DocxPlugin } from '@udecode/plate-docx';
import { EmojiPlugin } from '@udecode/plate-emoji/react';
import {
  FontBackgroundColorPlugin,
  FontColorPlugin,
} from '@udecode/plate-font/react';
import { HEADING_KEYS, HEADING_LEVELS } from '@udecode/plate-heading';
import { HeadingPlugin, TocPlugin } from '@udecode/plate-heading/react';
import { HighlightPlugin } from '@udecode/plate-highlight/react';
import { HorizontalRulePlugin } from '@udecode/plate-horizontal-rule/react';
import { IndentPlugin } from '@udecode/plate-indent/react';
import { IndentListPlugin } from '@udecode/plate-indent-list/react';
import { JuicePlugin } from '@udecode/plate-juice';
import { KbdPlugin } from '@udecode/plate-kbd/react';
import { ColumnPlugin } from '@udecode/plate-layout/react';
import { LinkPlugin } from '@udecode/plate-link/react';
import { MarkdownPlugin } from '@udecode/plate-markdown';
import {
  EquationPlugin,
  InlineEquationPlugin,
} from '@udecode/plate-math/react';
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from '@udecode/plate-media/react';
import { MentionPlugin } from '@udecode/plate-mention/react';
import { NodeIdPlugin } from '@udecode/plate-node-id';
import { DeletePlugin, SelectOnBackspacePlugin } from '@udecode/plate-select';
import {
  BlockMenuPlugin,
  BlockSelectionPlugin,
} from '@udecode/plate-selection/react';
import { SlashPlugin } from '@udecode/plate-slash-command/react';
import { TableCellPlugin, TablePlugin } from '@udecode/plate-table/react';
import { TogglePlugin } from '@udecode/plate-toggle/react';
import { TrailingBlockPlugin } from '@udecode/plate-trailing-block';
import Prism from 'prismjs';

// import { aiPlugins } from '@/example/ai-plugins';
import { BlockContextMenu } from '@/components/potion-ui/block-context-menu';
import { CommentsPopover } from '@/components/potion-ui/comments-popover';
import {
  DragOverCursorPlugin,
  SelectionOverlayPlugin,
} from '@/components/potion-ui/cursor-overlay';
import { ImageElement } from '@/components/potion-ui/image-element';
import { ImagePreview } from '@/components/potion-ui/image-preview';
import {
  TodoLi,
  TodoMarker,
} from '@/components/potion-ui/indent-todo-marker';
import { LinkFloatingToolbar } from '@/components/potion-ui/link-floating-toolbar';
import { autoformatRules } from './plate-autoformat';

// import { resetNodePlugin } from './reset-node-plugin';

export const commonPlugins = [
  // Nodes
  HeadingPlugin.configure({ options: { levels: 3 } }),
  BlockquotePlugin,
  CodeBlockPlugin.configure({ options: { prism: Prism } }),
  HorizontalRulePlugin,
  LinkPlugin.extend({
    render: { afterEditable: () => <LinkFloatingToolbar /> },
  }),
  ImagePlugin.extend({
    render: { afterEditable: ImagePreview },
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
      scrollContainerSelector: '#scroll_container',
      topOffset: 80,
    },
  }),
  PlaceholderPlugin,
  ImagePlugin.extend({
    render: {
      afterEditable: ImagePreview,
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
  FontColorPlugin,
  FontBackgroundColorPlugin,
  HighlightPlugin,
  KbdPlugin,

  // Block Style
  AlignPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        MediaEmbedPlugin.key,
        HEADING_KEYS.h1,
        HEADING_KEYS.h2,
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
        HEADING_KEYS.h1,
        HEADING_KEYS.h2,
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
  IndentListPlugin.extend({
    inject: {
      targetPlugins: [
        ParagraphPlugin.key,
        HEADING_KEYS.h1,
        HEADING_KEYS.h2,
        HEADING_KEYS.h3,
        HEADING_KEYS.h4,
        HEADING_KEYS.h5,
        HEADING_KEYS.h6,
        BlockquotePlugin.key,
        CodeBlockPlugin.key,
        TogglePlugin.key,
      ],
    },
    options: {
      listStyleTypes: {
        todo: {
          liComponent: TodoLi,
          markerComponent: TodoMarker,
          type: 'todo',
        },
      },
    },
  }),

  // Functionality
  AutoformatPlugin.configure({
    options: {
      enableUndoOnDelete: true,
      rules: autoformatRules,
    },
  }),
  BlockSelectionPlugin.configure({
    options: {
      areaOptions: {
        behaviour: {
          scrolling: {
            startScrollMargins: { x: 0, y: 0 },
          },
        },
        boundaries: '#scroll_container',
        container: '#scroll_container',
        selectables: '#scroll_container .slate-selectable',
        selectionAreaClass: 'slate-selection-area',
      },
      enableContextMenu: true,
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
          hotkey: 'mod+enter',
        },
        {
          before: true,
          hotkey: 'mod+shift+enter',
        },
        {
          hotkey: 'enter',
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
  // resetNodePlugin,
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
        { hotkey: 'shift+enter' },
        {
          hotkey: 'enter',
          query: {
            allow: [
              CodeBlockPlugin.key,
              BlockquotePlugin.key,
              TableCellPlugin.key,
              CalloutPlugin.key,
            ],
          },
        },
      ],
    },
  }),
  TrailingBlockPlugin.configure({
    options: { type: ParagraphPlugin.key },
  }),
  DragOverCursorPlugin,
  SelectionOverlayPlugin,

  // Collaboration
  CommentsPlugin.configure({
    options: {
      myUserId: '1',
      users: {
        1: {
          id: '1',
          avatarUrl:
            'https://avatars.githubusercontent.com/u/19695832?s=96&v=4',
          name: 'zbeyens',
        },
      },
    },
    render: { afterEditable: () => <CommentsPopover /> },
  }),

  // Deserialization
  DocxPlugin,
  MarkdownPlugin.configure({
    options: {
      indentList: true,
    },
  }),
  JuicePlugin,

  // AI
  // ...aiPlugins,
];