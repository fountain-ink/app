"use client";

import { cn } from "@udecode/cn";
import { useBlockSelected } from "@udecode/plate-selection/react";
import { type VariantProps, cva } from "class-variance-authority";

export const blockSelectionVariants = cva(
  cn(
    'before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:size-full before:rounded-[4px] before:content-[""]',
    "before:bg-brand/15",
    "before:transition-opacity before:duration-200",
  ),
  {
    defaultVariants: {
      active: false,
    },
    variants: {
      active: {
        false: "before:opacity-0",
        true: "before:opacity-100",
      },
    },
  },
);

export function BlockSelection({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof blockSelectionVariants>) {
  const isBlockSelected = useBlockSelected();

  return (
    <div
      className={blockSelectionVariants({
        active: isBlockSelected,
        className,
      })}
      {...props}
    />
  );
}
