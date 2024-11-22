import { uploadFile } from "@/lib/upload-image";
import { cn, withRef } from "@udecode/cn";
import { selectEditor, setNode, useEditorRef, useElement } from "@udecode/plate-common/react";
import { Image, ImagePlugin, useMediaState } from "@udecode/plate-media/react";
import { UploadIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useReadOnly } from "slate-react";
import { LoadingSpinner } from "../loading-spinner";
import { Button } from "./button";
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
  wide: "w-screen max-w-[65vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  full: "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center",
  column: "w-full max-w-full",
} as const;

export const ImageElement = withRef<typeof PlateElement>(
  ({ children, className, nodeProps, autoFocus = true, ...props }, ref) => {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const [_isImageLoaded, setIsImageLoaded] = useState(false);
    const [url, setUrl] = useState<string | undefined>(props?.element?.url as string | undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [width, setWidth] = useState("");
    const editor = useEditorRef();
    const readonly = useReadOnly();
    const element = useElement();

    useEffect(() => {
      if (props.element?.url) {
        setUrl(props.element.url as string);
      } else {
        setUrl(undefined);
      }
    }, [props.element.url]);

    useEffect(() => {
      if (props.element?.width) {
        const imageWidth = props.element?.width as ImageWidth;
        setWidth(IMAGE_WIDTH_CLASSES[imageWidth]);
      }
    }, [props.element.width]);

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsUploading(true);
      try {
        const url = await uploadFile(file);
        if (url) {
          setUrl(url);
          setNode(editor, element, { url, width });
          selectEditor(editor, {
            at: editor.selection || undefined,
            edge: editor.selection ? undefined : "end",
            focus: true,
          });
        }
      } finally {
        setIsUploading(false);
      }
    };

    
    return (
      <ImagePopover url={url} plugin={ImagePlugin}>
        <PlateElement ref={ref} className={cn(className, width)} {...props}>
          <figure className="group" contentEditable={false}>
            {!url ? (
              <div className={cn("rounded-sm relative ", focused && selected && "ring-2 ring-ring ")}>
                {!readonly && (
                  <Button
                    className="absolute inset-0 hover:bg-transparent group m-auto z-10"
                    size="lg"
                    variant="ghost"
                    disabled={isUploading}
                  >
                    <div className="relative flex gap-1 cursor-pointer items-center justify-center">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="absolute inset-0 cursor-pointer opacity-0"
                        disabled={isUploading}
                      />
                      {isUploading ? <LoadingSpinner /> : <>{!url && <UploadIcon className="size-4 mr-2" />}</>}
                      <span>{isUploading ? "Uploading..." : "Upload Image"}</span>
                    </div>
                  </Button>
                )}

                <ImagePlaceholder />
              </div>
            ) : (
              <Image
                className={cn(
                  "block w-full max-w-full cursor-pointer object-cover px-0",
                  "rounded-sm",
                  focused && selected && "ring-2 ring-ring ",
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
  },
);
