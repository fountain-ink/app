"use client";

import { cn } from "@udecode/cn";
import { useBlockSelected } from "@udecode/plate-selection/react";
import { cva, type VariantProps } from "class-variance-authority";

export const blockSelectionVariants = cva(
  cn(
    'before:pointer-events-none before:absolute before:inset-0 before:z-[1] before:size-full before:rounded-[4px] before:content-[""]',
    "before:bg-primary/15",
    "before:transition-opacity before:duration-100",
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
    <span
      className={blockSelectionVariants({
        active: isBlockSelected,
        className,
      })}
      {...props}
    />
  );
}
