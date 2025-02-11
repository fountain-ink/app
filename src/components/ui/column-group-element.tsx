"use client";

import { cn, withRef } from "@udecode/cn";
import { PlateElement } from "./plate-element";

export const ColumnGroupElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  return (
    <PlateElement ref={ref} className={cn(className, "mb-1")} {...props}>
      <div className={cn("flex size-full gap-4 rounded")}>{children}</div>
    </PlateElement>
  );
});
