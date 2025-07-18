"use client";

import { cn } from "@udecode/cn";
import type { SlateRenderElementProps } from "@udecode/plate";
import { useIndentTodoListElement, useIndentTodoListElementState } from "@udecode/plate-indent-list/react";

import { Checkbox } from "./checkbox";

export const TodoMarker = ({ element }: Omit<SlateRenderElementProps, "children">) => {
  const state = useIndentTodoListElementState({ element });
  const { checkboxProps } = useIndentTodoListElement(state);

  return (
    <div contentEditable={false}>
      <Checkbox style={{ left: -24, position: "absolute", top: 4 }} {...checkboxProps} />
    </div>
  );
};

export const TodoLi = (props: SlateRenderElementProps) => {
  const { children, element } = props;

  return <span className={cn((element.checked as boolean) && "text-muted-foreground line-through")}>{children}</span>;
};
