"use client";

import { cn, withRef } from "@udecode/cn";
import {
    createPrimitiveComponent,
    selectSiblingNodePoint,
    setNode,
    useEditorRef,
    useElement,
} from "@udecode/plate-common/react";
import type { TEquationElement } from "@udecode/plate-math";
import { useEquationElement, useEquationInput } from "@udecode/plate-math/react";
import { RadicalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReadOnly, useSelected } from "slate-react";
import { ELEMENT_WIDTH_CLASSES, ElementPopover, ElementWidth } from "./element-popover";
import { PlateElement } from "./plate-element";
import { TextareaAutosize } from "./textarea";

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

export const EquationElement = withRef<typeof PlateElement>(({ children, className, ...props },  ref) => {
  const element = useElement<TEquationElement>();
  const editor = useEditorRef();
  const [open, setOpen] = useState(false);
  const katexRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");
  const readOnly = useReadOnly();
  const selected = useSelected();

  useEffect(() => {
    setOpen(selected);
  }, [selected]);

  const handleClose = () => {
    setOpen(false);
      selectSiblingNodePoint(editor, { node: element });

  };

  const renderEquationInput = () => {
    if (readOnly) return null;

    return (
      <EquationInput
        className="grow w-full rounded-[4px]"
        state={{ isInline:false , open: true, onClose: handleClose }}
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
    setNode(editor, element, { width: newWidth });
  };

  return (
    <ElementPopover
      sideOffset={10}
      verticalContent={renderEquationInput()}
      defaultWidth={width}
      onWidthChange={handleWidth}
    >
      <PlateElement
        ref={ref}
        className={cn("relative my-8", width && ELEMENT_WIDTH_CLASSES[width], className)}
        {...props}
      >
        {element?.texExpression?.length > 0 ? (
          <span ref={katexRef} />
        ) : (
          <div className="flex h-7 w-full items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
            <RadicalIcon className="size-6 text-muted-foreground/80" />
            <div>Add a Tex equation</div>
          </div>
        )}

        {children}
      </PlateElement>
    </ElementPopover>
  );
});
