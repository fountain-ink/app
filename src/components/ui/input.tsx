import { withVariants } from "@udecode/cn";
import { cva } from "class-variance-authority";

export const inputVariants = cva(
  "flex w-full rounded-md bg-transparent text-sm file:border-0 file:bg-background file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    defaultVariants: {
      h: "md",
      variant: "default",
    },
    variants: {
      h: {
        md: "h-10 px-3 py-2",
        sm: "h-[28px] px-1.5 py-1",
      },
      variant: {
        default:
          "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        ghost: "border-none focus-visible:ring-transparent",
      },
    },
  },
);

export const Input = withVariants("input", inputVariants, ["variant", "h"]);
