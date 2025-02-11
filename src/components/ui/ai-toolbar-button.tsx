"use client";

import React from "react";

import { withRef } from "@udecode/cn";
import { AIChatPlugin } from "@udecode/plate-ai/react";

import { ToolbarButton } from "./toolbar";
import { useEditorPlugin } from "@udecode/plate/react";

export const AIToolbarButton = withRef<typeof ToolbarButton>(({ children, ...rest }, ref) => {
  const { api } = useEditorPlugin(AIChatPlugin);

  return (
    <ToolbarButton
      ref={ref}
      {...rest}
      onClick={() => {
        api.aiChat.show();
      }}
    >
      {children}
    </ToolbarButton>
  );
});
