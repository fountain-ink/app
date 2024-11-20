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
          "rounded-md border-[1.5px] border-input bg-muted/80 px-1 pb-0.5 pt-1 focus:border-border/50 focus:ring-2 focus:ring-primary/30 [&:read-only]:ring-0 [&:read-only]:focus:border-input",
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
