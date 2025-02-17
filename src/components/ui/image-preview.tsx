import { cn } from "@udecode/cn";
import { PreviewImage, useImagePreview, useImagePreviewValue, useScaleInput } from "@udecode/plate-media/react";
import { useEditorRef } from "@udecode/plate/react";
import { ArrowLeftIcon, ArrowRightIcon, Minimize2, Minus, Plus } from "lucide-react";

import { Button } from "./button";
import { RefObject } from "react";

const SCROLL_SPEED = 4;

export const ImagePreview = () => {
  const editor = useEditorRef();
  const isOpen = useImagePreviewValue("isOpen", editor.id);
  const scale = useImagePreviewValue("scale");
  const isEditingScale = useImagePreviewValue("isEditingScale");
  const currentPreview = useImagePreviewValue("currentPreview");
  const {
    closeProps,
    maskLayerProps,
    nextDisabled,
    nextProps,
    prevDisabled,
    prevProps,
    scaleTextProps,
    zommOutProps,
    zoomInDisabled,
    zoomInProps,
    zoomOutDisabled,
  } = useImagePreview({
    scrollSpeed: SCROLL_SPEED,
  });

  return (
    <div
      className={cn(
        "fade-in fixed top-0 left-0 z-50 h-screen w-screen animate-in cursor-default text-sm duration-200 ease-in-out",
        !isOpen && "hidden",
      )}
      onContextMenu={(e) => e.stopPropagation()}
      {...maskLayerProps}
    >
      <div className="absolute inset-0 size-full bg-black/80" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative flex max-h-screen w-full items-center">
          <PreviewImage
            className={cn(
              "mx-auto block max-h-[calc(100vh-4rem)] w-auto object-contain transition-transform select-none",
            )}
          />
        </div>
      </div>

      <div
        className="absolute bottom-[40px] left-1/2 z-40 flex -translate-x-1/2 justify-center gap-2 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {!prevDisabled && !nextDisabled && (
          <div className="flex rounded-md bg-secondary/70">
            <Button size={'icon'} variant={"ghost"} {...prevProps} disabled={prevDisabled}>
              <ArrowLeftIcon className="size-5" />
            </Button>
            <Button size={'icon'} variant={"ghost"} {...nextProps} disabled={nextDisabled}>
              <ArrowRightIcon className="size-5" />
            </Button>
          </div>
        )}

        <div className="flex gap-2 rounded-md bg-secondary/70">
          <Button size={'icon'} variant={'ghost'} {...zommOutProps} disabled={zoomOutDisabled} tooltip="Zoom out">
            <Minus className="size-4" />
          </Button>
          <div className="flex w-[46px] items-center justify-center space-x-1 text-neutral-400">
            {isEditingScale ? (
              <ScaleInput className="h-[19px] w-full rounded-sm border border-border/70 bg-transparent text-sm text-white outline-hidden" />
            ) : (
              <div {...scaleTextProps}>{scale * 100}</div>
            )}
            <div>%</div>
          </div>
          <Button size={'icon'} variant={"ghost"} {...zoomInProps} disabled={zoomInDisabled} tooltip="Zoom in">
            <Plus className="size-4" />
          </Button>
          <Button size={'icon'} variant={"ghost"} {...closeProps} tooltip="Minimize">
            <Minimize2 className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export function ScaleInput(props: React.ComponentProps<"input">) {
  const { props: scaleInputProps, ref } = useScaleInput();

  return <input {...scaleInputProps} {...props} ref={ref as RefObject<HTMLInputElement>} />;
}
