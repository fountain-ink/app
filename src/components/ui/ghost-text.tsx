"use client";

import { useEditorPlugin, useElement } from "@udecode/plate/react";
import type { CopilotPluginConfig } from "@udecode/plate-ai/react";

export const GhostText = () => {
  const { getOption } = useEditorPlugin<CopilotPluginConfig>({
    key: "copilot",
  });
  const element = useElement();

  const isSuggested = getOption("isSuggested", element.id as string);

  if (!isSuggested) return null;

  return <GhostTextContent />;
};

export function GhostTextContent() {
  const { getOption } = useEditorPlugin<CopilotPluginConfig>({
    key: "copilot",
  });

  const suggestionText = getOption("suggestionText");

  return (
    <span className="text-muted-foreground/70" contentEditable={false}>
      {suggestionText && suggestionText}
    </span>
  );
}
