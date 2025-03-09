"use client";

import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import * as React from "react";

import { cn } from "@/lib/utils";

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  orientation?: "vertical" | "horizontal" | "both";
}

const ScrollArea = React.forwardRef<React.ElementRef<typeof ScrollAreaPrimitive.Root>, ScrollAreaProps>(
  ({ className, orientation = "vertical", children, ...props }, ref) => (
    <ScrollAreaPrimitive.Root ref={ref} className={cn("relative", className)} {...props}>
      <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
        {children}
      </ScrollAreaPrimitive.Viewport>
      {(orientation === "vertical" || orientation === "both") && <ScrollBar />}
      {(orientation === "horizontal" || orientation === "both") && <ScrollBar orientation="horizontal" />}
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  ),
);
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

const ScrollBar = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>
>(({ className, orientation = "vertical", ...props }, ref) => (
  <ScrollAreaPrimitive.ScrollAreaScrollbar
    ref={ref}
    orientation={orientation}
    tabIndex={-1}
    contentEditable={false}
    className={cn(
      "flex touch-none select-none transition-colors cursor-pointer caret-transparent hover:bg-muted/50",
      orientation === "vertical" && "h-[calc(100%-1rem)] w-2.5 border-l border-l-transparent p-[1px] my-2",
      orientation === "horizontal" && "h-2.5 flex-col border-t border-t-transparent p-[1px] w-[calc(100%-1rem)] mx-2",
      className,
    )}
    {...props}
  >
    <ScrollAreaPrimitive.ScrollAreaThumb 
      className="relative flex-1 rounded-full bg-primary/80 hover:bg-primary/60 cursor-pointer" 
      tabIndex={-1}
      contentEditable="false"
    />
  </ScrollAreaPrimitive.ScrollAreaScrollbar>
));
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;

export { ScrollArea, ScrollBar };
