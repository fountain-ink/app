import { cn } from "@udecode/cn";
import type { SlateElementProps } from "@udecode/plate";
import { SlateElement } from "@udecode/plate";
import type { TAudioElement } from "@udecode/plate-media";

export function MediaAudioElementStatic({ children, className, ...props }: SlateElementProps) {
  const { url } = props.element as TAudioElement;

  return (
    <SlateElement className={cn(className, "mb-1")} {...props}>
      <figure className="group relative cursor-default">
        <div className="h-16">
          <audio className="size-full" src={url} controls>
            <track kind="captions" />
          </audio>
        </div>
      </figure>
      {children}
    </SlateElement>
  );
}
