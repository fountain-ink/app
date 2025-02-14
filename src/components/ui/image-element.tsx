import { uploadFile } from "@/lib/upload/upload-file";
import { cn, withRef } from "@udecode/cn";
import { TImageElement } from "@udecode/plate-media";
import { Image, PlaceholderPlugin, useImage, useMediaState } from "@udecode/plate-media/react";
import { useEditorPlugin, useEditorRef, useElement, useReadOnly, useRemoveNodeButton } from "@udecode/plate/react";
import { AnimatePresence, motion } from "framer-motion";
import { UploadIcon } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { ElementPopover, type ElementWidth, widthVariants } from "./element-popover";
import { PlateElement } from "./plate-element";

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
    <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
      <div className="placeholder-background rounded-sm absolute inset-0" />
      {file && objectUrl && (
        <img 
          className="h-auto w-full rounded-sm object-cover opacity-50" 
          alt={file.name} 
          src={objectUrl} 
        />
      )}
      <div className="absolute inset-0 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  );
};

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
    editor.tf.setNodes({ url, width: newWidth }, { at: element });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        editor.tf.setNodes({ url, width }, { at: element });
        editor.tf.select(editor, {
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
    const [_isImageLoaded, setIsImageLoaded] = useState(false);
    const [url, setUrl] = useState<string | undefined>(props?.element?.url as string | undefined);
    const [width, setWidth] = useState<ElementWidth>((props.element.width as ElementWidth) || "column");
    const [isFocused, setIsFocused] = useState(false);
    const readonly = useReadOnly();
    const figureRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    const { api, editor } = useEditorPlugin(PlaceholderPlugin);
    const print = editor.mode === "print";
    const element = props.element as TImageElement;

    const { align = "center", focused, readOnly, selected } = useMediaState();
    const [loading, setLoading] = useState(true);
    const { props: imageProps } = useImage();

    const currentUploadingFile = useMemo(() => {
      if (!element.placeholderId) return;

      return api.placeholder.getUploadingFile(element.placeholderId);
    }, [element.placeholderId, api.placeholder]);

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

    return (
      <ImagePopover url={url} open={isFocused} popoverRef={popoverRef}>
        <PlateElement ref={ref} className={cn(className, "my-9 flex flex-col items-center")} {...props}>
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
            {!url && loading && currentUploadingFile ? (
              <ImagePlaceholder file={currentUploadingFile} />
            ) : (
              <Image
                className={cn(
                  "block w-full max-w-full cursor-pointer object-cover px-0",
                  "rounded-sm",
                  isFocused && "ring-2 ring-ring",
                )}
                alt=""
                {...nodeProps}
                {...imageProps}
                onLoad={() => {
                  setIsImageLoaded(true);
                  setLoading(false);
                  currentUploadingFile &&
                    api.placeholder.removeUploadingFile(props.element.fromPlaceholderId as string);
                }}
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
