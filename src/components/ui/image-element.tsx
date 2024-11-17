import { cn, withRef } from "@udecode/cn";
import { withHOC } from "@udecode/plate-common/react";
import { Image, ImagePlugin, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider, useResizableStore } from "@udecode/plate-resizable";
import React, { useEffect, useState } from "react";
import { Caption, CaptionTextarea } from "./caption";
import { ImagePopover } from "./image-popover";
import { PlateElement } from "./plate-element";

const ImagePlaceholder = () => (
  <div className="flex relative aspect-video w-full rounded-sm">
    <div className="placeholder-background rounded-sm" />
  </div>
);

type ImageWidth = "column" | "wide" | "full";

const IMAGE_WIDTH_CLASSES: Record<ImageWidth, string> = {
  wide: "w-[160%] -ml-[30%] max-w-[160%]",
  full: "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  column: "w-full max-w-full",
} as const;

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, nodeProps, ...props }, ref) => {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const pixelWidth = useResizableStore().get.width();
    const [_isImageLoaded, setIsImageLoaded] = React.useState(false);
    const [url, setUrl] = useState(props.element.url);
    const [width, setWidth] = useState("");

    useEffect(() => {
      if (props.element?.url) {
        setUrl(props.element.url);
      }
    }, [props.element.url]);

    useEffect(() => {
      if (props.element?.width) {
        const imageWidth = props.element?.width as ImageWidth;
        setWidth(IMAGE_WIDTH_CLASSES[imageWidth]);
      }
    }, [props.element.width]);

    return (
      <ImagePopover plugin={ImagePlugin}>
        <PlateElement ref={ref} className={cn(className, width)} {...props}>
          <figure className="group relative" contentEditable={false}>
            {!url ? (
              <div className={cn("rounded-sm", focused && selected && "ring-2 ring-ring ring-offset-2")}>
                <ImagePlaceholder />
              </div>
            ) : (
              <Image
                className={cn(
                  "block w-full max-w-full cursor-pointer object-cover px-0",
                  "rounded-sm",
                  focused && selected && "ring-2 ring-ring ring-offset-2",
                )}
                alt=""
                {...nodeProps}
                onLoad={() => setIsImageLoaded(true)}
              />
            )}
            <Caption className={width} align={align}>
              <CaptionTextarea readOnly={readOnly} placeholder="Write a caption..." />
            </Caption>
          </figure>

          {children}
        </PlateElement>
      </ImagePopover>
    );
  }),
);
