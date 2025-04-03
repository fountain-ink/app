"use client";

import React from "react";

import type { PlateContentProps } from "@udecode/plate/react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@udecode/cn";
import { PlateContent, useEditorContainerRef, useEditorRef } from "@udecode/plate/react";
import { cva } from "class-variance-authority";

const editorContainerVariants = cva("relative flex cursor-text", {
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "w-full",
      demo: "h-[650px] w-full overflow-y-auto",
    },
  },
});

export const EditorContainer = ({
  className,
  variant,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof editorContainerVariants>) => {
  const editor = useEditorRef();
  const containerRef = useEditorContainerRef();

  return (
    <div
      id={editor.uid}
      ref={containerRef as any}
      className={cn("ignore-click-outside/toolbar", editorContainerVariants({ variant }), className)}
      {...props}
    />
  );
};

EditorContainer.displayName = "EditorContainer";

const editorVariants = cva(
  cn(
    "group/editor",
    "relative w-full overflow-visible whitespace-pre-wrap break-words",
    "rounded-md ring-offset-background placeholder:text-muted-foreground/80 focus-visible:outline-none",
    "[&_[data-slate-placeholder]]:text-muted-foreground/80 [&_[data-slate-placeholder]]:!opacity-100",
    "[&_[data-slate-placeholder]]:top-[auto_!important]",
    "[&_strong]:font-bold",
  ),
  {
    defaultVariants: {
      variant: "default",
    },
    variants: {
      disabled: {
        true: "cursor-not-allowed opacity-50",
      },
      focused: {
        true: "ring-2 ring-ring ring-offset-2",
      },
      variant: {
        ai: "px-0 text-base md:text-sm",
        aiChat: "max-h-[min(70vh,320px)] max-w-[700px] overflow-y-auto px-3 py-2 text-base md:text-sm",
        comment: cn("rounded-none border-none bg-transparent text-sm"),
        default: "min-h-full px-16 text-base sm:px-[max(64px,calc(50%-350px))]",
        demo: "h-full px-16 pt-4 text-base sm:px-[max(64px,calc(50%-350px))]",
        fullWidth: "min-h-full px-16 text-base sm:px-24",
        select: "px-3 py-2 text-base data-[readonly]:w-fit",
        update: "px-0 text-sm",
        versionHistory: "px-0 pb-[30vh] text-base",
      },
    },
  },
);

export type EditorProps = PlateContentProps & VariantProps<typeof editorVariants>;

export const Editor = React.forwardRef<HTMLDivElement, EditorProps>(
  ({ className, disabled, focused, variant, onClick, onMouseDown, ...props }, ref) => {
    return (
      <PlateContent
        ref={ref}
        className={cn(
          editorVariants({
            disabled,
            focused,
            variant,
          }),
          className,
        )}
        onClick={(e) => {
          if (variant === "comment") {
            e.stopPropagation();
          }

          onClick?.(e);
        }}
        onMouseDown={(e) => {
          if (variant === "comment") {
            e.stopPropagation();
          }

          onMouseDown?.(e);
        }}
        disableDefaultStyles
        {...props}
      />
    );
  },
);

Editor.displayName = "Editor";
