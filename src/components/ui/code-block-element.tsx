"use client";

import { cn, withRef } from "@udecode/cn";
import { useCodeBlockElementState } from "@udecode/plate-code-block/react";
import { setNode, useEditorRef, useRemoveNodeButton } from "@udecode/plate-common/react";
import { useState } from "react";
import { useReadOnly } from "slate-react";
import { WidthColumn, WidthFull, WidthWide } from "../custom-icons";
import { Button } from "./button";
import { Caption, CaptionButton, CaptionTextarea } from "./caption";
import { CodeBlockCombobox } from "./code-block-combobox";
import "./code-block-element.css";
import { ElementPopover } from "./element-popover";
import type { ImageWidth } from "./image-element";
import { IMAGE_WIDTH_CLASSES } from "./image-element";
import { PlateElement } from "./plate-element";
import { ScrollArea } from "./scroll-area";
import { Separator } from "./separator";

import { useMediaState } from "@udecode/plate-media/react";
export const CodeBlockElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { element } = props;
  const state = useCodeBlockElementState({ element });
  const { focused, selected } = useMediaState();
  const { props: removeButtonProps } = useRemoveNodeButton({ element });
  const editor = useEditorRef();
  const [width, setWidth] = useState<ImageWidth>((element?.width as ImageWidth) || "column");
  const readonly = useReadOnly();

  const handleWidth = (newWidth: ImageWidth) => {
    setWidth(newWidth);
    setNode(editor, element, { width: newWidth });
  };

  const popoverContent = (
    <div className="box-content flex h-9 items-center gap-1">
      <Button
        size="icon"
        variant="muted"
        className={width === "column" ? "text-primary" : "muted"}
        onClick={() => handleWidth("column")}
      >
        <WidthColumn />
      </Button>
      <Button
        size="icon"
        variant="muted"
        className={width === "wide" ? "text-primary" : "muted"}
        onClick={() => handleWidth("wide")}
      >
        <WidthWide />
      </Button>
      <Button
        size="icon"
        variant="muted"
        className={width === "full" ? "text-primary" : "muted"}
        onClick={() => handleWidth("full")}
      >
        <WidthFull />
      </Button>
      <Separator orientation="vertical" className="my-1" />
      <CodeBlockCombobox />
      <CaptionButton variant="ghost">Caption</CaptionButton>
      <Button variant="ghost" {...removeButtonProps}>
        Remove
      </Button>
    </div>
  );

  return (
    <ElementPopover content={popoverContent}>
      <PlateElement
        ref={ref}
        className={cn(
          "relative my-8 bg-muted text-foreground rounded-sm",
          width && IMAGE_WIDTH_CLASSES[width],
          state.className,
          className,
        )}
        {...props}
      >
        <figure className="group">
          <ScrollArea 
            orientation="horizontal" 
            className={cn(
              "rounded-sm overflow-hidden",
              focused && selected && "ring-2 ring-ring"
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
