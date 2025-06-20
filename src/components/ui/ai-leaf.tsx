"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateLeaf } from "@udecode/plate/react";

export const AILeaf = withRef<typeof PlateLeaf>(({ children, className, ...props }, ref) => {
  return (
    <PlateLeaf
      ref={ref}
      className={cn(
        "border-b-2 border-b-purple-100 bg-purple-50 text-purple-800",
        "transition-all duration-200 ease-in-out",
        className,
      )}
      {...props}
    >
      {children}
    </PlateLeaf>
  );
});
