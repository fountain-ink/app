"use client";

import React from "react";

import { cn } from "@udecode/cn";
import { withRef } from "@udecode/plate/react";

import { PlateElement } from "./plate-element";

export const ParagraphElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement ref={ref} className={cn(className)} {...props}>
      {children}
    </PlateElement>
  );
});
