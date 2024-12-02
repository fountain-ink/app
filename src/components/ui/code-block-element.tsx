"use client";

import { cn, withRef } from "@udecode/cn";
import { useCodeBlockElementState } from "@udecode/plate-code-block/react";

import { CodeBlockCombobox } from "./code-block-combobox";
import { PlateElement } from "./plate-element";

import "./code-block-element.css";

export const CodeBlockElement = withRef<typeof PlateElement>(({ children, className, ...props }, ref) => {
  const { element } = props;
  const state = useCodeBlockElementState({ element });

  return (
    <PlateElement
      ref={ref}
      className={cn("relative my-4 py-1 bg-muted text-foreground rounded-sm", state.className, className)}
      {...props}
    >
      <pre className="overflow-x-auto rounded-md bg-muted px-6 py-8 text-foreground/80 font-mono text-sm not-prose leading-[normal] [tab-size:2]">
        <code>{children}</code>
      </pre>

      {state.syntax && (
        <div className="absolute right-2 top-2 z-10 select-none" contentEditable={false}>
          <CodeBlockCombobox />
        </div>
      )}
    </PlateElement>
  );
});
