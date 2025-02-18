"use client";

import { AnimatePresence, motion } from "motion/react";
import type * as React from "react";

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
    "z-49 max-w-[calc(100vw-24px)] animate-popover overflow-hidden rounded-md bg-popover border border-border text-popover-foreground shadow-floating outline-none",
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

const popoverAnimationVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    transition: {
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      opacity: { duration: 0.2 },
      scale: { duration: 0.2 },
    },
  },
};

export const PopoverContent = withRef<typeof PopoverPrimitive.Content, VariantProps<typeof popoverVariants>>(
  ({ align = "center", className, sideOffset = 4, variant, ...props }, ref) => (
    <PopoverPrimitive.Portal>
      <AnimatePresence>
        <PopoverPrimitive.Content
          ref={ref}
          asChild
          align={align}
          side="top"
          avoidCollisions={false}
          sideOffset={sideOffset}
          {...props}
        >
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={popoverAnimationVariants}
            style={{
              overflow: "hidden",
              transformOrigin: "top",
              willChange: "transform, opacity, height",
            }}
            className={cn(popoverVariants({ variant }), className)}
          >
            {props.children}
          </motion.div>
        </PopoverPrimitive.Content>
      </AnimatePresence>
    </PopoverPrimitive.Portal>
  ),
);
