import { uploadFile } from "@/lib/upload-image";
import { cn, withRef } from "@udecode/cn";
import { selectEditor, setNode, useEditorRef, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { Image, useMediaState } from "@udecode/plate-media/react";
import { UploadIcon } from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useReadOnly } from "slate-react";
import { LoadingSpinner } from "../loading-spinner";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { ELEMENT_WIDTH_CLASSES, ElementPopover, type ElementWidth } from "./element-popover";
import { PlateElement } from "./plate-element";

const ImagePlaceholder = () => (
  <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
    <div className="placeholder-background rounded-sm" />
  </div>
);

function ImagePopover({ children, url }: { children: React.ReactNode; url?: string }) {
  const editor = useEditorRef();
  const element = useElement();
  const { props: buttonProps } = useRemoveNodeButton({ element });
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    setNode(editor, element, { url, width: newWidth });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
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

  const changeButton = url && (
    <Button variant="ghost" disabled={isUploading}>
      <div className="relative flex gap-1 items-center justify-center">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={isUploading}
        />
        {isUploading ? <LoadingSpinner /> : <></>}
        Change
      </div>
    </Button>
  );

  return (
    <ElementPopover defaultWidth={width} onWidthChange={handleWidth} content={changeButton}>
      {children}
    </ElementPopover>
  );
}

export const ImageElement = withRef<typeof PlateElement>(
  ({ children, className, nodeProps, autoFocus = true, ...props }, ref) => {
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const [_isImageLoaded, setIsImageLoaded] = useState(false);
    const [url, setUrl] = useState<string | undefined>(props?.element?.url as string | undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [width, setWidth] = useState<ElementWidth>("column");
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
        setWidth(props.element.width as ElementWidth);
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
      <ImagePopover url={url}>
        <PlateElement ref={ref} className={cn(className, width && ELEMENT_WIDTH_CLASSES[width], "my-8")} {...props}>
          <figure className="group" contentEditable={false}>
            {!url ? (
              <div
                className={cn("rounded-sm flex items-center justify-center", focused && selected && "ring-2 ring-ring")}
              >
                <div className="absolute">
                  {!readonly && (
                    <Button className="hover:bg-transparent" size="lg" variant="ghost" disabled={isUploading}>
                      <div className="relative flex gap-1 text-muted-foreground hover:text-foreground duration-300 transition-colors cursor-pointer items-center justify-center">
                        <input
                          title=""
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="absolute inset-0 cursor-pointer opacity-0"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <LoadingSpinner />
                        ) : (
                          <>{!url && <UploadIcon className="size-5 mr-2 text-inherit" />}</>
                        )}
                        <span className="">{isUploading ? "Uploading..." : "Upload Image"}</span>
                      </div>
                    </Button>
                  )}
                </div>

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
      </ImagePopover>
    );
  },
);
