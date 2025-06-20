import { cn } from "@udecode/cn";
import type { SlateElementProps } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";

export const ParagraphElementStatic = ({ children, className, ...props }: SlateElementProps) => {
  return (
    <SlateElement
      className={cn(className, "my-px px-0.5 py-[3px]")}
      style={{
        ...props.style,
        backgroundColor: props.element.backgroundColor as any,
      }}
      {...props}
    >
      {children}
    </SlateElement>
  );
};
