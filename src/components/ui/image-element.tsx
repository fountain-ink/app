import { cn, withRef } from "@udecode/cn";
import { withHOC } from "@udecode/plate-common/react";
import { Image, ImagePlugin, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider, useResizableStore } from "@udecode/plate-resizable";
import React from "react";

import { Caption, CaptionTextarea } from "./caption";
import { ImagePopover } from "./image-popover";
import { PlateElement } from "./plate-element";
import { mediaResizeHandleVariants, Resizable, ResizeHandle } from "./resizable";

const ImagePlaceholder = () => (
  <div className="flex relative aspect-video w-full rounded-sm">
    <div className="placeholder-background rounded-sm" />
  </div>
);

export const ImageElement = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, nodeProps, ...props }, ref) => {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const width = useResizableStore().get.width();
    const [isImageLoaded, setIsImageLoaded] = React.useState(false);
    const url = props.element.url;
    const showPlaceholder = !url;
    console.log(nodeProps, props);

    return (
      <ImagePopover plugin={ImagePlugin}>
        <PlateElement ref={ref} className={cn(className)} {...props}>
          <figure className="group relative py-2" contentEditable={false}>
            <Resizable
              align={align}
              options={{
                align,
                readOnly,
              }}
            >
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "left" })}
                options={{ direction: "left" }}
              />
              {showPlaceholder ? (
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
                  onLoad={() => setIsImageLoaded(true)}
                />
              )}
              <ResizeHandle
                className={mediaResizeHandleVariants({
                  direction: "right",
                })}
                options={{ direction: "right" }}
              />
            </Resizable>

            <Caption style={{ width }} align={align}>
              <CaptionTextarea readOnly={readOnly} placeholder="Write a caption..." />
            </Caption>
          </figure>

          {children}
        </PlateElement>
      </ImagePopover>
    );
  }),
);
