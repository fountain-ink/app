"use client";

import React from "react";

import { cn } from "@udecode/cn";
import { PlateElement } from "@udecode/plate/react";

export function BlockquoteElement({ children, className, ...props }: React.ComponentProps<typeof PlateElement>) {
  return (
    <PlateElement as="blockquote" className={cn("my-1 px-0.5 py-[3px]", className)} {...props}>
      {children}
    </PlateElement>
  );
}
