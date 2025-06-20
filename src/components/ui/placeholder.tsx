"use client";

import { cn } from "@udecode/cn";
import {
  createNodeHOC,
  createNodesHOC,
  ParagraphPlugin,
  type PlaceholderProps,
  usePlaceholderState,
  useReadOnly,
} from "@udecode/plate/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import React from "react";
import { TITLE_KEYS } from "../editor/plugins/title-plugin";

export const Placeholder = (props: PlaceholderProps) => {
  const { children, attributes, placeholder } = props;

  const { enabled } = usePlaceholderState(props);
  const isReadOnly = useReadOnly();

  if (isReadOnly) {
    return props.children;
  }

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      attributes: {
        ...attributes,
        className: cn(
          attributes.className,
          enabled &&
            "before:absolute before:cursor-text before:opacity-30 before:content-[attr(placeholder)] before:left-0 before:right-0 before:text-inherit",
        ),
        placeholder,
      },
    });
  });
};

export const withPlaceholder = createNodeHOC(Placeholder);

export const withPlaceholdersPrimitive = createNodesHOC(Placeholder);

export const withPlaceholders = (components: any) =>
  withPlaceholdersPrimitive(components, [
    // {
    //   key: ParagraphPlugin.key,
    //   hideOnBlur: true,
    //   placeholder: "Tell your story...",
    //   query: {
    //     filter: (entry) => {
    //       const [node, path] = entry;
    //       return node.type === "paragraph" && path[0] === 0;
    //     },
    //   },
    // },
    {
      key: ParagraphPlugin.key,
      hideOnBlur: true,
      placeholder: "Press `/` for commands",
      query: {
        maxLevel: 1,
      },
    },
    {
      key: TITLE_KEYS.title,
      hideOnBlur: false,
      placeholder: "Title",
    },
    {
      key: TITLE_KEYS.subtitle,
      hideOnBlur: false,
      placeholder: "Subtitle",
    },
    {
      key: HEADING_KEYS.h1,
      hideOnBlur: false,
      placeholder: "Heading",
    },
    {
      key: HEADING_KEYS.h2,
      hideOnBlur: false,
      placeholder: "Subheading",
    },
  ]);
