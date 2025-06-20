import { cn } from "@udecode/cn";
import { SlateElement, type SlateElementProps } from "@udecode/plate";

export function HrElementStatic({ children, className, attributes: { ...attributes }, ...props }: SlateElementProps) {
  return (
    <SlateElement
      attributes={{
        ...attributes,
      }}
      className={cn("my-4 py-2", className)}
      {...props}
    >
      <div contentEditable={false}>
        <hr className={cn("h-0.5 w-[60%] mx-auto cursor-pointer rounded-sm border-none bg-muted bg-clip-content")} />
      </div>
      {children}
    </SlateElement>
  );
}
