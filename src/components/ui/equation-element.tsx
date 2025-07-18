"use client";

import { cn, withRef } from "@udecode/cn";
import {
  createPrimitiveComponent,
  PlateElement,
  useEditorRef,
  useElement,
  useReadOnly,
  useSelected,
} from "@udecode/plate/react";
import type { TEquationElement } from "@udecode/plate-math";
import { useEquationElement, useEquationInput } from "@udecode/plate-math/react";
import { useMediaState } from "@udecode/plate-media/react";
import { RadicalIcon } from "lucide-react";
import { useRef, useState } from "react";
import { Caption, CaptionTextarea } from "./caption";
import { ELEMENT_WIDTH_CLASSES, ElementPopover, type ElementWidth } from "./element-popover";
import { TextareaAutosize } from "./textarea";

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

export const EquationElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const element = useElement<TEquationElement>();
  const editor = useEditorRef();
  const katexRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const readOnly = useReadOnly();
  const isSelected = useSelected();
  const { align = "center" } = useMediaState();
  const figureRef = useRef<HTMLElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const renderEquationInput = () => {
    if (readOnly) return null;

    return (
      <EquationInput
        className="grow w-full rounded-[4px]"
        state={{ isInline: false, open: true }}
        autoFocus
        variant={"default"}
      />
    );
  };

  useEquationElement({
    element,
    katexRef: katexRef,
    options: {
      displayMode: true,
      errorColor: "#cc0000",
      fleqn: false,
      leqno: false,
      macros: { "\\f": "#1f(#2)" },
      output: "htmlAndMathml",
      strict: "warn",
      throwOnError: false,
      trust: false,
    },
  });

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    editor.tf.setNodes({ width: newWidth }, { at: element });
  };

  return (
    <ElementPopover
      ref={popoverRef}
      open={isSelected}
      sideOffset={10}
      verticalContent={renderEquationInput()}
      defaultWidth={width}
      showWidth={false}
      onWidthChange={handleWidth}
    >
      <PlateElement
        ref={ref}
        className={cn("relative my-8", width && ELEMENT_WIDTH_CLASSES[width], className)}
        {...props}
      >
        <figure ref={figureRef} className={cn("group rounded-sm")} contentEditable={false}>
          <div className={cn(isSelected && "ring-2 ring-ring ", "rounded-sm p-2")}>
            {element?.texExpression?.length > 0 ? (
              <span ref={katexRef} />
            ) : (
              <div className="flex h-7 w-full items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
                <RadicalIcon className="size-6 text-muted-foreground/80" />
                <div>Add a Tex equation</div>
              </div>
            )}
          </div>

          <Caption className={ELEMENT_WIDTH_CLASSES[width]}>
            <CaptionTextarea
              readOnly={readOnly}
              onFocus={(e) => {
                e.preventDefault();
              }}
              placeholder="Write a caption..."
            />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    </ElementPopover>
  );
});
