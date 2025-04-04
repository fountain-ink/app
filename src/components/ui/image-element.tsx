import { uploadFile } from "@/lib/upload/upload-file";
import { cn, withRef } from "@udecode/cn";
import { TImageElement } from "@udecode/plate-media";
import { PlaceholderPlugin, useImage, useMediaState } from "@udecode/plate-media/react";
import { useEditorPlugin, useEditorRef, useElement, useReadOnly, useRemoveNodeButton } from "@udecode/plate/react";
import { UploadIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { Button } from "./button";
import { Caption, CaptionTextarea } from "./caption";
import { ElementPopover, type ElementWidth, widthVariants } from "./element-popover";
import { PlateElement } from "./plate-element";
import Image from "next/image";

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
        <img className="h-auto w-full rounded-sm object-cover opacity-50" alt={file.name} src={objectUrl} />
      )}
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
        editor.tf.select(editor.selection?.focus, { focus: true, edge: "end" });
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
    const [isUploading, setIsUploading] = useState(false);
    const [width, setWidth] = useState<ElementWidth>((props.element.width as ElementWidth) || "column");
    const readonly = useReadOnly();
    const figureRef = useRef<HTMLElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { api, editor } = useEditorPlugin(PlaceholderPlugin);
    const print = editor.mode === "print";
    const element = props.element as TImageElement;
    const { align = "center", focused, readOnly, selected } = useMediaState();
    const { props: imageProps } = useImage();

    const currentUploadingFile = useMemo(() => {
      if (!element.placeholderId) return;

      return api.placeholder.getUploadingFile(element.placeholderId);
    }, [element.placeholderId, api.placeholder]);

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
          editor.tf.setNodes({ url, width }, { at: element });
          editor.tf.select(editor.selection?.focus, { focus: true, edge: "end" });
        }
      } finally {
        setIsUploading(false);
      }
    };

    return (
      <ImagePopover url={url} open={selected} popoverRef={popoverRef}>
        <PlateElement ref={ref} className={cn(className, "my-9 flex flex-col items-center  ")} {...props}>
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
              <div className={cn("rounded-sm flex items-center justify-center w-full", selected && "ring-2 ring-ring")}>
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

                <ImagePlaceholder file={currentUploadingFile} />
              </div>
            ) : (
              <div className="relative w-full aspect-auto">
                <Image
                  className={cn("block w-full h-auto max-h-full", "rounded-sm", selected && "ring-2 ring-ring")}
                  alt=""
                  width={1200}
                  height={800}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  style={{ height: 'auto', objectFit: 'contain' }}
                  {...nodeProps}
                  {...imageProps}
                  onLoad={() => {
                    setIsImageLoaded(true);
                    currentUploadingFile &&
                      api.placeholder.removeUploadingFile(props.element.fromPlaceholderId as string);
                  }}
                />
              </div>
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
