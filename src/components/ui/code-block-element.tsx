"use client";

import { cn, withRef } from "@udecode/cn";
import { useCodeBlockElementState } from "@udecode/plate-code-block/react";
import { setNode, useEditorRef, useRemoveNodeButton } from "@udecode/plate-common/react";
import { useMediaState } from "@udecode/plate-media/react";
import { useState } from "react";
import { useReadOnly } from "slate-react";
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
  const { props: removeButtonProps } = useRemoveNodeButton({ element });
  const editor = useEditorRef();
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const readonly = useReadOnly();

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    setNode(editor, element, { width: newWidth });
  };

  const popoverContent = <CodeBlockCombobox />;

  return (
    <ElementPopover onWidthChange={handleWidth} content={popoverContent}>
      <PlateElement
        ref={ref}
        className={cn(
          "relative my-8 bg-muted text-foreground rounded-sm",
          width && ELEMENT_WIDTH_CLASSES[width],
          state.className,
          className,
        )}
        {...props}
      >
        <figure className="group">
          <ScrollArea
            orientation="horizontal"
            className={cn("rounded-sm overflow-hidden", focused && selected && "ring-2 ring-ring")}
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
