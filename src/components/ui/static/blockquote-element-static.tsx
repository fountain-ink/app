import React from "react";

import type { SlateElementProps } from "@udecode/plate";

import { cn } from "@udecode/cn";
import { SlateElement } from "@udecode/plate";

export const BlockquoteElementStatic = ({ children, className, ...props }: SlateElementProps) => {
  return (
    <SlateElement as="blockquote" className={cn("my-1 px-0.5 py-[3px]", className)} {...props}>
      <div className="border-l-[3px] border-primary px-4">{children}</div>
    </SlateElement>
  );
};
