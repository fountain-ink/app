"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";

export const CodeLeaf = withRef<typeof PlateLeaf>(({ children, className, ...props }, ref) => {
  return (
    <PlateLeaf
      ref={ref}
      asChild
      className={cn(
        "whitespace-pre-wrap rounded-[4px] border border-secondary/60 bg-muted px-[0.3em] py-[0.2em] font-mono text-sm",
        className,
      )}
      {...props}
    >
      <code>{children}</code>
    </PlateLeaf>
  );
});
