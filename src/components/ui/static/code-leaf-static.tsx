import { cn } from "@udecode/cn";
import type { SlateLeafProps } from "@udecode/plate";
import { SlateLeaf } from "@udecode/plate";

export const CodeLeafStatic = ({ children, className, ...props }: SlateLeafProps) => {
  return (
    <SlateLeaf
      as="code"
      className={cn("rounded-md bg-muted px-[0.3em] py-[0.2em] font-mono text-sm whitespace-pre-wrap", className)}
      {...props}
    >
      {children}
    </SlateLeaf>
  );
};
