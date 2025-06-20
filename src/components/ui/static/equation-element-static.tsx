import { cn } from "@udecode/cn";
import { SlateElement, type SlateElementProps } from "@udecode/plate";
import type { TEquationElement } from "@udecode/plate-math";
import { getEquationHtml } from "@udecode/plate-math";

export function EquationElementStatic({ children, className, ...props }: SlateElementProps) {
  const element = props.element as TEquationElement;

  const html = getEquationHtml({
    element,
    options: {
      displayMode: true,
      errorColor: "#cc0000",
      fleqn: false,
      leqno: false,
      macros: { "\\f": "#1f(#2)" },
      output: "htmlAndMathml",
      strict: "warn",
      throwOnError: false,
      trust: false,
    },
  });

  return (
    <SlateElement className={cn("my-1", className)} {...props}>
      <div
        className={cn(
          "flex items-center justify-center rounded-sm select-none",
          element.texExpression.length === 0 ? "bg-muted p-3" : "px-2 py-1",
        )}
      >
        <span
          // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
          dangerouslySetInnerHTML={{
            __html: html,
          }}
        />
      </div>
      {children}
    </SlateElement>
  );
}
