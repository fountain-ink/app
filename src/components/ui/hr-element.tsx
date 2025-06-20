"use client";

import { cn } from "@udecode/cn";
import { PlateElement, useFocused, useSelected } from "@udecode/plate/react";
import React from "react";

export function HrElement({
  className,
  nodeProps,
  ...props
}: React.ComponentProps<typeof PlateElement> & {
  nodeProps?: React.ComponentProps<"hr">;
}) {
  const { children } = props;

  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement className={cn("my-4 py-2", className)} {...props}>
      <div contentEditable={false}>
        <hr
          {...nodeProps}
          className={cn(
            "h-0.5 w-[60%] mx-auto cursor-pointer rounded-sm border-none bg-muted bg-clip-content",
            selected && focused && "ring-2 ring-ring ring-offset-2",
          )}
        />
      </div>
      {children}
    </PlateElement>
  );
}
