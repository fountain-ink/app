"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn, withRef } from "@udecode/cn";
import { useCodeBlockElementState } from "@udecode/plate-code-block/react";
import { getNodeString } from "@udecode/plate-common";
import { setNode, useEditorRef } from "@udecode/plate-common/react";
import { useMediaState } from "@udecode/plate-media/react";
import { useState } from "react";
import { useReadOnly } from "slate-react";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { CodeBlockCombobox } from "./code-block-combobox";
import "./code-block-element.css";
import { ELEMENT_WIDTH_CLASSES, ElementPopover, type ElementWidth } from "./element-popover";
import { PlateElement } from "./plate-element";
import { ScrollArea } from "./scroll-area";

export const CodeBlockElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { element } = props;
  const state = useCodeBlockElementState({ element });
  const { focused, selected } = useMediaState();
  const editor = useEditorRef();
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const { copyToClipboard } = useCopyToClipboard();
  const readonly = useReadOnly();

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    setNode(editor, element, { width: newWidth });
  };

  const popoverContent = (
    <>
      <CodeBlockCombobox />

      <Button
        size="default"
        variant={"ghost"}
        onClick={() => {
          const lines = element.children.map((child) => getNodeString(child));
          copyToClipboard(lines.join("\n\n"), {
            tooltip: "Copied code to clipboard",
          });
        }}
      >
        Copy
      </Button>
    </>
  );

  return (
    <ElementPopover sideOffset={5} onWidthChange={handleWidth} content={popoverContent}>
      <PlateElement
        ref={ref}
        className={cn("relative my-8 rounded-sm", width && ELEMENT_WIDTH_CLASSES[width], state.className, className)}
        {...props}
      >
        <figure className="group">
          <ScrollArea
            orientation="horizontal"
            className={cn(
              "rounded-sm bg-muted text-foreground  overflow-hidden",
              focused && selected && "ring-2 ring-ring",
            )}
          >
            <pre className="bg-muted px-6 py-4 text-foreground/80 font-mono text-sm not-prose leading-[normal] [tab-size:2] min-w-full">
              <code>{children}</code>
            </pre>
          </ScrollArea>

          <Caption className={width} align="center" contentEditable={false}>
            <CaptionTextarea readOnly={readonly} placeholder="Write a caption..." />
          </Caption>
        </figure>
      </PlateElement>
    </ElementPopover>
  );
});
