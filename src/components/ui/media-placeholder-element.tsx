"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

import { cn } from "@udecode/cn";
import {
  AudioPlugin,
  FilePlugin,
  ImagePlugin,
  PlaceholderPlugin,
  PlaceholderProvider,
  useMediaState,
  usePlaceholderElementState,
  usePlaceholderPopoverState,
  VideoPlugin,
} from "@udecode/plate-media/react";
import { useEditorPlugin, withHOC, withRef, useReadOnly, useEditorRef, useElement } from "@udecode/plate/react";
import { AudioLinesIcon, FileUpIcon, FilmIcon, ImageIcon } from "lucide-react";
import { motion } from "framer-motion";

import { BlockActionButton } from "./block-context-menu";
import { PlateElement } from "@udecode/plate/react";
import { LoadingSpinner } from "../misc/loading-spinner";
import { Button } from "./button";
import { useFilePicker } from "use-file-picker";
import { nanoid } from "@udecode/plate";
import { setMediaNode } from "@udecode/plate-media";
import { useUploadFile } from "@/hooks/use-upload-file";
import { ElementPopover, ElementWidth, widthVariants } from "./element-popover";
import { uploadFile } from "@/lib/upload/upload-file";

const MEDIA_CONFIG: Record<
  string,
  {
    accept: string[];
    buttonText: string;
    icon: ReactNode;
  }
> = {
  [AudioPlugin.key]: {
    accept: ["audio/*"],
    buttonText: "Upload Audio",
    icon: <AudioLinesIcon className="size-5" />,
  },
  [FilePlugin.key]: {
    accept: ["*"],
    buttonText: "Choose a file",
    icon: <FileUpIcon className="size-5" />,
  },
  [ImagePlugin.key]: {
    accept: ["image/*"],
    buttonText: "Upload Image",
    icon: <ImageIcon className="size-5" />,
  },
  [VideoPlugin.key]: {
    accept: ["video/*"],
    buttonText: "Upload Video",
    icon: <FilmIcon className="size-5" />,
  },
};

function MediaPopover({
  children,
  file,
  open,
  popoverRef,
  mediaType,
}: {
  children: React.ReactNode;
  file?: File;
  open: boolean;
  popoverRef: React.RefObject<HTMLDivElement>;
  mediaType?: string;
}) {
  const editor = useEditorRef();
  const element = useElement();
  const [isUploading, setIsUploading] = useState(false);
  const [width, setWidth] = useState<ElementWidth>((element?.width as ElementWidth) || "column");

  const handleWidth = (newWidth: ElementWidth) => {
    setWidth(newWidth);
    editor.tf.setNodes({ width: newWidth }, { at: element });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFile = e.target.files?.[0];
    if (!newFile) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(newFile);
      if (url) {
        editor.tf.setNodes({ url, width }, { at: element });
        editor.tf.select(editor.selection?.focus, { focus: true, edge: "end" });
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ElementPopover ref={popoverRef} open={open} defaultWidth={width} onWidthChange={handleWidth} showCaption={false}>
      {children}
    </ElementPopover>
  );
}

export const MediaPlaceholderElement = withHOC(
  PlaceholderProvider,
  withRef<typeof PlateElement>(({ children, className, editor, ...props }, ref) => {
    const { mediaType, progresses, progressing, setSize, updatedFiles, element } = usePlaceholderElementState();
    const { setIsUploading, setProgresses, setUpdatedFiles } = usePlaceholderPopoverState();
    const { api } = useEditorPlugin(PlaceholderPlugin);
    const currentMedia = MEDIA_CONFIG[mediaType];
    const file: File | undefined = updatedFiles?.[0];
    const progress = file ? progresses?.[file.name] : undefined;
    const { isUploading, uploadedFile, uploadFile, uploadingFile } = useUploadFile({});
    const readonly = useReadOnly();
    const containerRef = useRef<HTMLDivElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);
    const { selected } = useMediaState();
    const [width, setWidth] = useState<ElementWidth>((element.width as ElementWidth) || "column");
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const { openFilePicker } = useFilePicker({
      accept: currentMedia?.accept ?? [],
      multiple: false,
      onFilesSelected: (data) => {
        if (data.errors && data.errors.length > 0) {
          console.error('File selection errors:', data.errors);
          return;
        }

        if (data.plainFiles && data.plainFiles.length > 0) {
          const firstFile = data.plainFiles[0];
          replaceCurrentPlaceholder(firstFile);
        }
      },
    });

    const replaceCurrentPlaceholder = useCallback(
      (file: File) => {
        setUpdatedFiles([file]);
        void uploadFile(file);
        if (element.id && typeof element.id === "string") {
          api.placeholder.addUploadingFile(element.id, file);
        }
      },
      [element.id, uploadFile, setUpdatedFiles, api.placeholder],
    );

    // React dev mode will call useEffect twice
    const isReplaced = useRef(false);
    /** Paste and drop */
    useEffect(() => {
      if (isReplaced.current) return;

      isReplaced.current = true;
      const currentFiles = api.placeholder.getUploadingFile(element.id as string);

      if (!currentFiles) return;

      replaceCurrentPlaceholder(currentFiles);
    }, [isReplaced, element.id, replaceCurrentPlaceholder, api.placeholder]);

    useEffect(() => {
      if (!uploadedFile) return;

      const path = editor.api.findPath(element);

      setMediaNode(
        editor,
        {
          id: nanoid(),
          initialHeight: undefined,
          initialWidth: undefined,
          isUpload: true,
          name: mediaType === FilePlugin.key ? uploadedFile.name : "",
          placeholderId: element.id as string,
          type: mediaType!,
          url: uploadedFile.url,
        },
        { at: path },
      );
    }, [uploadedFile, element.id, element, editor, mediaType]);

    useEffect(() => {
      setProgresses({ [uploadingFile?.name ?? ""]: isUploading ? 100 : 0 });
      setIsUploading(isUploading);
    }, [isUploading, uploadingFile, setProgresses, setIsUploading]);

    useEffect(() => {
      if (!file) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
        return;
      }

      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      return () => {
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
      };
    }, [file]);

    useEffect(() => {
      if (element.width && element.width !== width) {
        setWidth(element.width as ElementWidth);
      }
    }, [element.width, width]);

    if (readonly) return null;

    return (
      <MediaPopover file={file} open={selected} popoverRef={popoverRef} mediaType={mediaType}>
        <PlateElement
          editor={editor}
          className={cn(className, "my-9 flex flex-col items-center cursor-default [&_*]:caret-transparent ")}
          {...props}
        >
          <motion.div
            ref={containerRef}
            className={cn(
              "relative flex aspect-video w-full flex-col items-center justify-center rounded-sm overflow-hidden",
              selected && "ring-2 ring-ring",
            )}
            layout={true}
            initial={width}
            animate={width}
            variants={widthVariants as any}
            contentEditable={false}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 30,
            }}
          >
            <div className="placeholder-background absolute inset-0" />
            {progressing ? (
              <>
                {file && (
                  <>
                    {previewUrl && mediaType === ImagePlugin.key && (
                      <img
                        src={previewUrl}
                        alt="Upload preview"
                        className="h-full w-full object-cover opacity-40 animate-pulse"
                      />
                    )}
                    <div className="absolute inset-0 text-muted-foreground flex items-center justify-center">
                      <LoadingSpinner />
                      <span className="ml-2 text-sm">Uploading</span>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Button variant="ghostText" className="relative" onClick={() => openFilePicker()}>
                  <div className="flex text-base items-center gap-2">
                    {currentMedia?.icon}
                    {currentMedia?.buttonText}
                  </div>
                </Button>
              </div>
            )}
          </motion.div>

          {children}
        </PlateElement>
      </MediaPopover>
    );
  }),
);

export function formatBytes(
  bytes: number,
  opts: {
    decimals?: number;
    sizeType?: "accurate" | "normal";
  } = {},
) {
  const { decimals = 0, sizeType = "normal" } = opts;

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const accurateSizes = ["Bytes", "KiB", "MiB", "GiB", "TiB"];

  if (bytes === 0) return "0 Byte";

  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / 1024 ** i).toFixed(decimals)} ${sizeType === "accurate" ? (accurateSizes[i] ?? "Bytest") : (sizes[i] ?? "Bytes")
    }`;
}
