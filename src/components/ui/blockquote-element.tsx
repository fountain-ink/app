"use client";

import { cn, withRef } from "@udecode/cn";

import { PlateElement } from "./plate-element";

export const BlockquoteElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement ref={ref} as="blockquote" className={cn("my-1 px-0.5 py-[3px]", className)} {...props}>
      {children}
    </PlateElement>
  );
});
