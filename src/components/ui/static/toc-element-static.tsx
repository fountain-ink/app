import { cn } from "@udecode/cn";
import { NodeApi, type SlateEditor, SlateElement, type SlateElementProps, type TElement } from "@udecode/plate";
import { BaseTocPlugin, HEADING_KEYS, type Heading, isHeading } from "@udecode/plate-heading";
import { cva } from "class-variance-authority";
import { Button } from "../button";

const headingItemVariants = cva(
  "block h-auto w-full cursor-pointer truncate rounded-none px-0.5 py-1.5 text-left font-medium text-muted-foreground underline decoration-[0.5px] underline-offset-4 hover:bg-accent hover:text-muted-foreground",
  {
    variants: {
      depth: {
        1: "pl-0.5",
        2: "pl-[26px]",
        3: "pl-[50px]",
      },
    },
  },
);

export function TocElementStatic({ children, className, ...props }: SlateElementProps) {
  const { editor } = props;
  const headingList = getHeadingList(editor);

  return (
    <SlateElement className={cn(className, "mb-1 p-0")} {...props}>
      <div>
        {headingList.length > 0 ? (
          headingList.map((item) => (
            <Button key={item.title} variant="ghost" className={cn(headingItemVariants({ depth: item.depth as any }))}>
              {item.title}
            </Button>
          ))
        ) : (
          <div className="text-sm text-gray-500">Create a heading to display the table of contents.</div>
        )}
      </div>
      {children}
    </SlateElement>
  );
}

const headingDepth: Record<string, number> = {
  [HEADING_KEYS.h1]: 1,
  [HEADING_KEYS.h2]: 2,
  [HEADING_KEYS.h3]: 3,
  [HEADING_KEYS.h4]: 4,
  [HEADING_KEYS.h5]: 5,
  [HEADING_KEYS.h6]: 6,
};

const getHeadingList = (editor?: SlateEditor) => {
  if (!editor) return [];

  const options = editor.getOptions(BaseTocPlugin);

  if (options.queryHeading) {
    return options.queryHeading(editor);
  }

  const headingList: Heading[] = [];

  const values = editor.api.nodes({
    at: [],
    match: (n) => isHeading(n),
  });

  if (!values) return [];

  Array.from(values, ([node, path]) => {
    const { type } = node as TElement;
    const title = NodeApi.string(node);
    const depth = headingDepth[type];
    const id = node.id as string;
    title && headingList.push({ id, depth: depth ?? 1, path, title, type });
  });

  return headingList;
};
