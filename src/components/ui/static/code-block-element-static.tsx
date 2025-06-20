import { cn } from "@udecode/cn";
import type { SlateElementProps } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";
import type { TCodeBlockElement } from "@udecode/plate-code-block";

export const CodeBlockElementStatic = ({ children, className, ...props }: SlateElementProps<TCodeBlockElement>) => {
  const { element } = props;

  const codeClassName = element?.lang ? `${element.lang} language-${element.lang}` : "";

  return (
    <SlateElement className={cn(className, "py-1", codeClassName)} {...props}>
      <pre className="overflow-x-auto rounded-md bg-muted pt-[34px] pr-4 pb-8 pl-8 font-mono text-sm leading-[normal] [tab-size:2] print:break-inside-avoid">
        <code>{children}</code>
      </pre>
    </SlateElement>
  );
};
