"use client";

import { cn, withRef } from "@udecode/cn";
import type { TEquationElement } from "@udecode/plate-math";
import { useEquationElement, useEquationInput } from "@udecode/plate-math/react";
import { createPrimitiveComponent, useEditorRef, useElement } from "@udecode/plate/react";
import { RadicalIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReadOnly, useSelected } from "@udecode/plate/react";
import { ElementPopover } from "./element-popover";
import { PlateElement } from "@udecode/plate/react";
import { TextareaAutosize } from "./textarea";

const EquationInput = createPrimitiveComponent(TextareaAutosize)({
  propsHook: useEquationInput,
});

export const InlineEquationElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const element = useElement<TEquationElement>();
  const editor = useEditorRef();
  const katexRef = useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = useState(false);
  const readOnly = useReadOnly();
  const selected = useSelected();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(selected);
  }, [selected]);

  const handleClose = () => {
    setOpen(false);
    editor.tf.select(element, { next: true });
  };

  const renderEquationInput = () => {
    if (readOnly) return null;

    return (
      <EquationInput
        className="grow w-full rounded-[4px]"
        state={{ isInline: true, open: true, onClose: handleClose }}
        autoFocus
        variant="equationInline"
        placeholder="E = mc^2"
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

  return (
    <PlateElement
      ref={ref}
      className={cn("inline-block select-none rounded-sm [&_.katex-display]:my-0", className)}
      {...props}
    >
      <ElementPopover
        open={selected}
        ref={popoverRef}
        showWidth={false}
        showCaption={false}
        sideOffset={5}
        verticalContent={renderEquationInput()}
      >
        <div
          className={cn(
            'relative after:absolute after:inset-0 after:-left-1 after:-top-0.5 after:z-[1] after:h-[calc(100%)+4px] after:w-[calc(100%+8px)] after:rounded-sm after:content-[""]',
            "h-6",
            element.texExpression.length > 0 && open && "after:bg-brand/15",
            element.texExpression.length === 0 && "text-muted-foreground after:bg-neutral-500/10",
            className,
          )}
          contentEditable={false}
        >
          <span
            ref={katexRef}
            className={cn(element.texExpression.length === 0 && "hidden", "font-mono leading-none")}
          />
          {element.texExpression.length === 0 && (
            <span>
              <RadicalIcon className="mr-1 inline-block h-[19px] w-4 py-[1.5px] align-text-bottom" />
              New equation
            </span>
          )}
        </div>
        {children}
      </ElementPopover>
    </PlateElement>
  );
});
