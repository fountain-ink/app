"use client";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn, withRef } from "@udecode/cn";
import { type VariantProps, cva } from "class-variance-authority";

export const Popover = PopoverPrimitive.Root;

export const PopoverTrigger = PopoverPrimitive.Trigger;

export const PopoverAnchor = PopoverPrimitive.Anchor;

export const PopoverPortal = PopoverPrimitive.Portal;

export const popoverVariants = cva(
  cn(
    "group/popover",
    "z-50 max-w-[calc(100vw-24px)] animate-popover overflow-hidden rounded-md bg-popover text-popover-foreground shadow-floating outline-none",
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        combobox: "",
        default: "w-72",
        equation: "w-[400px] rounded-lg px-2.5 py-2",
        media: "max-h-[70vh] min-w-[180px] rounded-lg",
      },
    },
  },
);

export type PopoverContentProps = React.ComponentProps<typeof PopoverContent>;

export const PopoverContent = withRef<typeof PopoverPrimitive.Content, VariantProps<typeof popoverVariants>>(
  ({ align = "center", className, sideOffset = 4, variant, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        ref={ref}
        className={cn(popoverVariants({ variant }), className)}
        align={align}
        sideOffset={sideOffset}
        {...props}
      />
    </PopoverPrimitive.Portal>
  ),
);
