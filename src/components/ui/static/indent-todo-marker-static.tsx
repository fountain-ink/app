import { cn } from "@udecode/cn";
import type { SlateRenderElementProps } from "@udecode/plate";

import { CheckboxStatic } from "./checkbox-static";

export const TodoMarkerStatic = ({ element }: Omit<SlateRenderElementProps, "children">) => {
  return (
    <div contentEditable={false}>
      <CheckboxStatic className="pointer-events-none absolute top-1 -left-6" checked={element.checked as boolean} />
    </div>
  );
};

export const TodoLiStatic = ({ children, element }: SlateRenderElementProps) => {
  return <span className={cn((element.checked as boolean) && "text-muted-foreground line-through")}>{children}</span>;
};
