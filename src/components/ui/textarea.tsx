import * as React from "react";

import { cn } from "@udecode/cn";
import { TextareaAutosize as ReactTextareaAutosize } from "@udecode/plate-caption/react";
import { type VariantProps, cva } from "class-variance-authority";

export const textareaVariants = cva(
  cn("resize-none text-sm disabled:cursor-not-allowed disabled:opacity-50", "placeholder:text-muted-foreground/80"),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      variant: {
        ai: "max-h-[240px] border-transparent bg-transparent py-2",
        default:
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        equation: "max-h-[50vh] min-h-[60px] font-mono text-sm",
        equationInline: "max-h-[50vh] font-mono text-sm",
      },
    },
  },
);

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement> & VariantProps<typeof textareaVariants>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, variant, ...props }, ref) => {
  return <textarea ref={ref} className={cn(textareaVariants({ variant }), className)} {...props} />;
});
Textarea.displayName = "Textarea";

export type TextareaAutosizeProps = React.ComponentProps<typeof ReactTextareaAutosize> &
  VariantProps<typeof textareaVariants>;

const TextareaAutosize = React.forwardRef<HTMLTextAreaElement, TextareaAutosizeProps>(
  ({ children, className, variant, ...props }, ref) => {
    return (
      <ReactTextareaAutosize
        ref={ref}
        className={cn(textareaVariants({ variant }), className)}
        autoComplete="off"
        {...props}
      />
    );
  },
);
TextareaAutosize.displayName = "TextareaAutosize";

export { Textarea, TextareaAutosize };
