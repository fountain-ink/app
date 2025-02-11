"use client";

import { cn } from "@udecode/cn";
import { createNodeHOC, createNodesHOC, ParagraphPlugin, usePlaceholderState, type PlaceholderProps } from "@udecode/plate/react";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { useReadOnly } from "slate-react";
import { TITLE_KEYS } from "@/components/editor/plugins/title-plugin";
import React from "react";

export const Placeholder = (props: PlaceholderProps) => {
  const { children, nodeProps, placeholder } = props;

  const readonly = useReadOnly();

  const { enabled } = usePlaceholderState(props);

  if (readonly) {
    return children;
  }

  return React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      className: child.props.className,
      nodeProps: {
        ...nodeProps,
        className: cn(
          enabled &&
          "before:absolute before:cursor-text before:opacity-30 before:left-0 before:right-0 before:content-[attr(placeholder)]",
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
    // {
    //   key: HEADING_KEYS.h3,
    //   hideOnBlur: false,
    //   placeholder: "Subheading",
    // },
    // {
    //   key: HEADING_KEYS.h4,
    //   hideOnBlur: false,
    //   placeholder: "Subheading",
    // },
  ]);
