import type { FC } from "react";

import { BlockquotePlugin } from "@udecode/plate-block-quote/react";
import { CalloutPlugin } from "@udecode/plate-callout/react";
import { CodeBlockPlugin } from "@udecode/plate-code-block/react";
import { ParagraphPlugin, createNodesWithHOC } from "@udecode/plate-common/react";
import { type WithDraggableOptions, withDraggable as withDraggablePrimitive } from "@udecode/plate-dnd";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { TocPlugin } from "@udecode/plate-heading/react";
import { ColumnPlugin } from "@udecode/plate-layout/react";
import { EquationPlugin } from "@udecode/plate-math/react";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  MediaEmbedPlugin,
  PlaceholderPlugin,
  VideoPlugin,
} from "@udecode/plate-media/react";
import { TablePlugin } from "@udecode/plate-table/react";
import { TogglePlugin } from "@udecode/plate-toggle/react";

import { type DraggableProps, Draggable } from "./draggable";

export const withDraggable = (
  Component: FC,
  options?: WithDraggableOptions<Partial<Omit<DraggableProps, "children" | "editor" | "element">>>,
) => withDraggablePrimitive<DraggableProps>(Draggable, Component, options as any);

export const withDraggablesPrimitive = createNodesWithHOC(withDraggable);

export const withDraggables = (components: any) => {
  return withDraggablesPrimitive(components, [
    {
      keys: [
        ParagraphPlugin.key,
        BlockquotePlugin.key,
        CalloutPlugin.key,
        CodeBlockPlugin.key,
        TocPlugin.key,
        ColumnPlugin.key,
        EquationPlugin.key,
        ImagePlugin.key,
        VideoPlugin.key,
        AudioPlugin.key,
        MediaEmbedPlugin.key,
        PlaceholderPlugin.key,
        TablePlugin.key,
        TogglePlugin.key,
        HEADING_KEYS.h3,
        FilePlugin.key,
      ],
      level: 0,
    },
    {
      key: TablePlugin.key,
      draggableProps: {
        className: "[&_.slate-gutterLeft]:top-[14px]",
      },
    },
  ]);
};
