import { cn } from "@udecode/cn";
import type { SlateElementProps } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";
import { cva } from "class-variance-authority";

interface HeadingElementViewProps extends SlateElementProps {
  variant?: "h1" | "h2" | "h3";
}

const headingVariants = cva("relative mb-1 px-0.5 py-[3px] font-semibold leading-[1.3]!", {
  variants: {
    variant: {
      h1: "mt-8 text-[1.875em]",
      h2: "mt-[1.4em] text-[1.5em]",
      h3: "mt-[1em] text-[1.25em]",
    },
  },
});

export const HeadingElementStatic = ({ children, className, variant = "h1", ...props }: HeadingElementViewProps) => {
  return (
    <SlateElement as={variant} className={cn(className, headingVariants({ variant }))} {...props}>
      {children}
    </SlateElement>
  );
};
