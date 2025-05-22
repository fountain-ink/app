"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";

export function HighlightLeaf({ children, className, ...props }: React.ComponentProps<typeof PlateLeaf>) {
  return (
    <PlateLeaf className={cn("bg-primary/20 text-inherit", className)} {...props}>
      <mark>{children}</mark>
    </PlateLeaf>
  );
}
