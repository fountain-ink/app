import { cn } from "@udecode/cn";
import { NodeApi, SlateElement, type SlateElementProps } from "@udecode/plate";
import type { TCaptionElement } from "@udecode/plate-caption";
import type { TImageElement } from "@udecode/plate-media";

export function ImageElementStatic({ children, className, ...props }: SlateElementProps) {
  const {
    align = "center",
    caption,
    url,
    width,
  } = props.element as TImageElement &
    TCaptionElement & {
      width: number;
    };

  return (
    <SlateElement className={cn(className, "py-2.5")} {...props}>
      <figure className="group relative m-0 inline-block">
        <div className="relative max-w-full min-w-[92px]" style={{ textAlign: align }}>
          <div className="inline-block" style={{ width }}>
            <img className={cn("w-full max-w-full cursor-default object-cover px-0", "rounded-sm")} alt="" src={url} />
            {caption?.[0] && (
              <figcaption className="mx-auto mt-2 h-[24px] max-w-full">{NodeApi.string(caption[0])}</figcaption>
            )}
          </div>
        </div>
      </figure>
      {children}
    </SlateElement>
  );
}
