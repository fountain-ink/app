import React from "react";

import type { SlateElementProps } from "@udecode/plate";

import { cn } from "@udecode/cn";
import { SlateElement } from "@udecode/plate";

export function HrElementStatic({ children, className, ...props }: SlateElementProps) {
  return (
    <SlateElement className={cn("mb-1 py-2", className)} {...props}>
      <div contentEditable={false}>
        <hr
          {...props.nodeProps}
          className={cn("h-0.5 cursor-pointer rounded-sm border-none bg-muted bg-clip-content")}
        />
      </div>
      {children}
    </SlateElement>
  );
}
