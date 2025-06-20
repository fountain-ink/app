"use client";

import { withRef } from "@udecode/cn";
import { useEditorPlugin } from "@udecode/plate/react";
import { AIChatPlugin } from "@udecode/plate-ai/react";
import { ToolbarButton } from "./toolbar";

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
