import React from "react";

import type { SlateElementProps } from "@udecode/plate";

import { cn } from "@udecode/cn";
import { SlateElement } from "@udecode/plate";
import { ChevronRightIcon } from "lucide-react";

export function ToggleElementStatic({ children, className, ...props }: SlateElementProps) {
  return (
    <SlateElement className={cn("mb-1 pl-6", className)} {...props}>
      <div>
        <span
          className="absolute top-0.5 left-0 flex cursor-pointer items-center justify-center rounded-sm p-px transition-bg-ease select-none hover:bg-slate-200"
          contentEditable={false}
        >
          <ChevronRightIcon className={cn("transition-transform duration-75", "rotate-0")} />
        </span>
        {children}
      </div>
    </SlateElement>
  );
}
