"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";

export const KbdLeaf = withRef<typeof PlateLeaf>(({ children, className, ...props }, ref) => (
  <PlateLeaf
    ref={ref}
    asChild
    className={cn(
      "rounded border border-border bg-muted px-1 py-0.5 not-prose font-mono text-sm outline outline-1 outline-[rgb(193,_200,_205)] dark:outline-[rgb(76,_81,_85)]",
      className,
    )}
    {...props}
  >
    <kbd>{children}</kbd>
  </PlateLeaf>
));
