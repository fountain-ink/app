"use client";

import React, { useEffect, useMemo, useState } from "react";

import type { TImageElement } from "@udecode/plate-media";

import { cn, withRef } from "@udecode/cn";
import { PlaceholderPlugin, useImage, useMediaState } from "@udecode/plate-media/react";
import { ResizableProvider } from "@udecode/plate-resizable";
import { useEditorPlugin, withHOC } from "@udecode/plate/react";

import { blockSelectionVariants } from "./block-selection";
import { Caption, CaptionTextarea } from "./caption";
import { PlateElement } from "./plate-element";
import { mediaResizeHandleVariants, Resizable, ResizeHandle } from "./resizable";

export const ImageElementPlate = withHOC(
  ResizableProvider,
  withRef<typeof PlateElement>(({ children, className, nodeProps, ...props }, ref) => {
    const { api, editor } = useEditorPlugin(PlaceholderPlugin);

    const print = editor.mode === "print";

    const element = props.element as TImageElement;

    const currentUploadingFile = useMemo(() => {
      if (!element.placeholderId) return;

      return api.placeholder.getUploadingFile(element.placeholderId);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [element.placeholderId]);

    const { align = "center", focused, readOnly, selected } = useMediaState();

    const [loading, setLoading] = React.useState(true);

    const width = 100;

    const { props: imageProps } = useImage();

    const height = useMemo<number | null>(() => {
      if (print) return null;
      if (!element.initialHeight || !element.initialWidth) {
        // Embed image we don't have height and width using 200 by default
        return loading ? 200 : null;
      }
      if (typeof width !== "number") return Number(element.initialHeight.toFixed(2));

      const aspectRatio = Number((element.initialWidth! / element.initialHeight!).toFixed(2));

      return Number((width / aspectRatio).toFixed(2));
    }, [element.initialHeight, element.initialWidth, loading, print, width]);

    // const { isDragging, handleRef } = useDraggable({
    //   element: props.element,
    // });

    return (
      <PlateElement ref={ref} className={cn("my-1", className)} {...props}>
        <figure className="relative m-0" contentEditable={false}>
          <Resizable
            align={align}
            options={{
              align,
              readOnly,
            }}
          >
            <div className="group/media">
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "left" })}
                options={{ direction: "left" }}
              />
              <ResizeHandle
                className={mediaResizeHandleVariants({ direction: "right" })}
                options={{ direction: "right" }}
              />

              <div
                className={cn(
                  "relative block w-full max-w-full cursor-pointer object-cover px-0",
                  blockSelectionVariants({ active: focused && selected }),
                  "group-has-[[data-resizing=true]]/media:before:opacity-0",
                )}
                style={{
                  height: height ? `${height}px` : "auto",
                }}
              >
                {print ? (
                  <img className={cn("h-full rounded-xs")} height="auto" width="100%" {...imageProps} {...nodeProps} />
                ) : (
                  <img
                    className={cn(
                      "h-full rounded-xs opacity-100",
                      loading && "opacity-0",
                      // isDragging && 'opacity-50'
                    )}
                    onLoad={() => {
                      setLoading(false);
                      currentUploadingFile &&
                        api.placeholder.removeUploadingFile(props.element.fromPlaceholderId as string);
                    }}
                    // effect="opacity"
                    // height="auto"
                    // width="100%"
                    // wrapperProps={
                    //   {
                    //     className: cn('block h-full', loading && 'absolute'),
                    //     // ref: handleRef,
                    //   } as any
                    // }
                    {...imageProps}
                    {...nodeProps}
                  />
                )}

                {loading && <ImagePlaceholder file={currentUploadingFile} />}
              </div>

              {/* <MediaToolbar /> */}
            </div>
          </Resizable>

          <Caption style={{ width }} align={align}>
            <CaptionTextarea
              readOnly={readOnly}
              onFocus={(e) => {
                e.preventDefault();
              }}
              placeholder="Write a caption..."
            />
          </Caption>
        </figure>

        {children}
      </PlateElement>
    );
  }),
);

const ImagePlaceholder = ({ file }: { file?: File }) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) return;

    const url = URL.createObjectURL(file);
    setObjectUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  return (
    <div
      className="relative h-full overflow-hidden bg-[rgb(247,246,245)] before:absolute before:inset-0 before:z-10 before:animate-shimmer
    before:bg-gradient-to-r before:from-transparent before:via-gray-200/50 before:to-transparent"
    >
      {file && objectUrl && <img className="h-auto w-full rounded-xs object-cover" alt={file.name} src={objectUrl} />}
    </div>
  );
};
