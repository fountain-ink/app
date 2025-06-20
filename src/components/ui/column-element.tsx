"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement, useElement, useReadOnly, withHOC } from "@udecode/plate/react";
import type { TColumnElement } from "@udecode/plate-layout";
import { ResizableProvider } from "@udecode/plate-resizable";

export const ColumnElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
    const readOnly = useReadOnly();
    const { width } = useElement<TColumnElement>();

    return (
      <PlateElement
        ref={ref}
        className={cn(className, !readOnly && "rounded-lg border border-dashed p-1.5")}
        style={{ width }}
        {...props}
      >
        {children}
      </PlateElement>
    );
  }),
);
