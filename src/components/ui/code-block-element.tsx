"use client";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn, withRef } from "@udecode/cn";
import { useCodeBlockElementState } from "@udecode/plate-code-block/react";
import { useEditorRef, useReadOnly } from "@udecode/plate/react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { CodeBlockCombobox } from "./code-block-combobox";
import "./code-block-element.css";
import { ElementPopover, widthVariants, type ElementWidth } from "./element-popover";
import { PlateElement } from "./plate-element";
import { ScrollArea } from "./scroll-area";
import { NodeApi } from "@udecode/plate";

export const CodeBlockElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { element } = props;
  const state = useCodeBlockElementState({ element });
  const editor = useEditorRef();
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const [isFocused, setIsFocused] = useState(false);
  const { copyToClipboard } = useCopyToClipboard();
  const figureRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const comboboxRef = useRef<HTMLDivElement>(null);
  const readOnly = useReadOnly();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (readOnly) return;

      const target = event.target as Node;

      // Check if target is a child of either ref
      const isClickInside =
        figureRef.current?.contains(target) ||
        popoverRef.current?.contains(target) ||
        comboboxRef.current?.contains(target);

      setIsFocused(isClickInside ?? false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [readOnly]);

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    editor.tf.setNodes({ width: newWidth }, { at: element },  ); 
  };

  const popoverContent = (
    <>
      <CodeBlockCombobox ref={comboboxRef} />

      <Button
        size="default"
        variant={"ghost"}
        onClick={() => {
          const lines = element.children.map((child) => NodeApi.string(child));
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
    <ElementPopover
      ref={popoverRef}
      open={isFocused}
      sideOffset={5}
      onWidthChange={handleWidth}
      content={popoverContent}
    >
      <PlateElement
        ref={ref}
        className={cn("relative my-8 rounded-sm flex flex-col items-center", state.className, className)}
        {...props}
      >
        <motion.figure
          ref={figureRef}
          className="group w-full flex flex-col items-center"
          layout="size"
          layoutDependency={width}
          initial={width}
          animate={width}
          variants={widthVariants}
          transition={{
            type: "spring",
            stiffness: 200,
            damping: 30,
          }}
        >
          <ScrollArea
            orientation="horizontal"
            className={cn(
              "rounded-sm bg-muted text-foreground overflow-hidden w-full",
              isFocused && "ring-2 ring-ring",
            )}
          >
            <pre className="bg-muted px-6 py-4 text-foreground/80 font-mono text-sm not-prose leading-[normal] [tab-size:2] min-w-full">
              <code>{children}</code>
            </pre>
          </ScrollArea>

          <Caption align="center" contentEditable={false}>
            <CaptionTextarea readOnly={readOnly} placeholder="Write a caption..." />
          </Caption>
        </motion.figure>
      </PlateElement>
    </ElementPopover>
  );
});
