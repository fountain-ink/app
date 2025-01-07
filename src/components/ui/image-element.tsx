import { uploadFile } from "@/lib/upload-file";
import { cn, withRef } from "@udecode/cn";
import { selectEditor, setNode, useEditorRef, useElement, useRemoveNodeButton } from "@udecode/plate-common/react";
import { Image, useMediaState } from "@udecode/plate-media/react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadIcon } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useReadOnly } from "slate-react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { ElementPopover, widthVariants, type ElementWidth } from "./element-popover";
import { PlateElement } from "./plate-element";

const ImagePlaceholder = () => (
  <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
    <div className="placeholder-background rounded-sm" />
  </div>
);

function ImagePopover({
  children,
  url,
  open,
  popoverRef,
}: { children: React.ReactNode; url?: string; open: boolean; popoverRef: React.RefObject<HTMLDivElement> }) {
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
    <ElementPopover
      ref={popoverRef}
      open={open}
      defaultWidth={width}
      onWidthChange={handleWidth}
      content={changeButton}
    >
      {children}
    </ElementPopover>
  );
}

export const ImageElement = withRef<typeof PlateElement>(
  ({ children, className, nodeProps, autoFocus = true, ...props }, ref) => {
    const { align = "center" } = useMediaState();
    const [_isImageLoaded, setIsImageLoaded] = useState(false);
    const [url, setUrl] = useState<string | undefined>(props?.element?.url as string | undefined);
    const [isUploading, setIsUploading] = useState(false);
    const [width, setWidth] = useState<ElementWidth>((props.element.width as ElementWidth) || "column");
    const [isFocused, setIsFocused] = useState(false);
    const editor = useEditorRef();
    const readonly = useReadOnly();
    const element = useElement();
    const figureRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (readonly) return;

        const target = event.target as Node;
        const isClickInside = figureRef.current?.contains(target) || popoverRef.current?.contains(target);

        setIsFocused(!!isClickInside);
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [readonly]);

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
      <ImagePopover url={url} open={isFocused} popoverRef={popoverRef}>
        <PlateElement ref={ref} className={cn(className, "my-8 flex flex-col items-center")} {...props}>
          <motion.figure
            ref={figureRef}
            className="group w-full flex flex-col items-center"
            contentEditable={false}
            layout={true}
            initial={width}
            animate={width}
            variants={widthVariants}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30,
            }}
          >
            {!url ? (
              <div
                className={cn("rounded-sm flex items-center justify-center w-full", isFocused && "ring-2 ring-ring")}
              >
                <div className="absolute">
                  {!readonly && (
                    <Button className="hover:bg-transparent" size="lg" variant="ghost" disabled={isUploading}>
                      <div className="relative flex gap-1 text-base text-muted-foreground hover:text-foreground duration-300 transition-colors cursor-pointer items-center justify-center">
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
                          <>{!url && <UploadIcon className="size-4 mr-2 text-inherit" />}</>
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
                  isFocused && "ring-2 ring-ring",
                )}
                alt=""
                {...nodeProps}
                onLoad={() => setIsImageLoaded(true)}
              />
            )}

            <AnimatePresence mode="wait">
              <div className="w-full flex justify-center">
                <Caption align={align}>
                  <CaptionTextarea
                    readOnly={readonly}
                    onFocus={(e) => {
                      e.preventDefault();
                    }}
                    placeholder="Write a caption..."
                  />
                </Caption>
              </div>
            </AnimatePresence>
          </motion.figure>

          {children}
        </PlateElement>
      </ImagePopover>
    );
  },
);
