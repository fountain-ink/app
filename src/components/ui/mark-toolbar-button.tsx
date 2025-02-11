"use client";

import { withRef } from "@udecode/cn";
import { useEditorRef, useMarkToolbarButton, useMarkToolbarButtonState } from "@udecode/plate/react";

import { ToolbarButton } from "./toolbar";

export const MarkToolbarButton = withRef<
  typeof ToolbarButton,
  {
    nodeType: string;
    clear?: string[] | string;
  }
>(({ clear, nodeType, ...rest }, ref) => {
  const editor = useEditorRef();
  const state = useMarkToolbarButtonState({ clear, nodeType });
  const { props } = useMarkToolbarButton(state);

  return (
    <ToolbarButton
      ref={ref}
      {...props}
      {...rest}
      onClick={() => {
        props.onClick?.();
        editor.tf.focus();
      }}
    />
  );
});
