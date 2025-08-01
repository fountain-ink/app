"use client";

import { cn } from "@udecode/cn";
import { PlateElement, useSelected } from "@udecode/plate/react";
import React from "react";

export function TableRowElement({ children, className, ...props }: React.ComponentProps<typeof PlateElement>) {
  const selected = useSelected();

  return (
    <PlateElement as="tr" className={cn(className, "h-full")} data-selected={selected ? "true" : undefined} {...props}>
      {children}
    </PlateElement>
  );
}
