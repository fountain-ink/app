"use client";

import { useRef, useState } from "react";

import type { TEquationElement } from "@udecode/plate-math";

import { cn, withRef } from "@udecode/cn";
import { useElement } from "@udecode/plate-common/react";
import { useEquationElement } from "@udecode/plate-math/react";
import { RadicalIcon } from "lucide-react";

import { BlockActionButton } from "./block-context-menu";

import { EquationPopoverContent } from "./equation-popover";
import { PlateElement } from "./plate-element";
import { Popover, PopoverTrigger } from "./popover";

export const EquationElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const element = useElement<TEquationElement>();

  const [open, setOpen] = useState(false);
  const katexRef = useRef<HTMLDivElement | null>(null);

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
    <PlateElement ref={ref} className={cn("relative my-1", className)} {...props}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger asChild>
          <div
            classNam={cn(
              "group flex cursor-pointer select-none items-center justify-center rounded-sm transition-bg-ease hover:bg-primary/10",
              element?.texExpression?.length === 0 ? "bg-muted p-3 pr-9" : "px-2 py-1",
            )}
            contentEditable={false}
            role="button"
          >
            {element?.texExpression?.length > 0 ? (
              <span ref={katexRef} />
            ) : (
              <div className="flex h-7 w-full items-center gap-2 whitespace-nowrap text-sm text-muted-foreground">
                <RadicalIcon className="size-6 text-muted-foreground/80" />
                <div>Add a Tex equation</div>
              </div>
            )}
          </div>
        </PopoverTrigger>

        <EquationPopoverContent
          variant="equation"
          placeholder={
            "f(x) = \\begin{cases}\n  x^2, &\\quad x > 0 \\\\\n  0, &\\quad x = 0 \\\\\n  -x^2, &\\quad x < 0\n\\end{cases}"
          }
          setOpen={setOpen}
        />
      </Popover>

      <BlockActionButton />

      {children}
    </PlateElement>
  );
});
