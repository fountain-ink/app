"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";

export const HighlightLeaf = withRef<typeof PlateLeaf>(({ children, className, ...props }, ref) => (
  <PlateLeaf ref={ref} asChild className={cn("bg-primary/20 text-inherit", className)} {...props}>
    <mark>{children}</mark>
  </PlateLeaf>
));
