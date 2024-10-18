"use client";

import { WidthColumn, WidthFull, WidthWide } from "@/components/custom-icons";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uploadFile } from "@/lib/upload-image";
import { NodeViewWrapper } from "@tiptap/react";
import { useRef } from "react";

import { useState } from "react";

const ImageComponent = (props: {
  node: {
    attrs: {
      src: string | null;
      width: "column" | "wide" | "full";
    };
  };

  updateAttributes: (attrs: Partial<{ src: string | null; width: "column" | "wide" | "full" }>) => void;
  deleteNode: () => void;
  extension: {
    options: {
      uploadIcon: React.ReactNode;
    };
  };
  editor: any;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleWidth = (width: "column" | "wide" | "full") => {
    props.updateAttributes({ width });
  };

  const handleUpload = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setIsLoading(true);
          const newSrc = await uploadFile(file);
          props.updateAttributes({ src: newSrc });
        } catch (error) {
          console.error("Error uploading image:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    input.click();
  };

  const handleRemove = () => {
    // TODO: Remove from ipfs
    props.updateAttributes({ src: null });
  };

  const getWidthClasses = (width: string) => {
    switch (width) {
      case "wide":
        return "w-[120%] -ml-[10%] max-w-[120%]";
      case "full":
        return "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center";
      default:
        return "w-full max-w-full";
    }
  };

  const width = props.node.attrs.width || "column";
  const widthClass = getWidthClasses(width);

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={`flex relative justify-center ${widthClass}`}
      contentEditable="false"
      data-drag-handle
    >
      <div
        className={`
        flex-grow-0 group border-2 border-muted-foreground group-hover:border-primary
        transition-colors duration-300 ease-in-out rounded-lg w-full
        ${isLoading ? "animate-pulse-slow transition-all duration-1000 delay-0" : ""}
      `}
      >
        {props.node.attrs.src ? (
          <>
            <img ref={imageRef} src={props.node.attrs.src} className="w-full h-full object-cover" />
            <div className="absolute inset-x-0 -top-4 space-x-1 w-full flex justify-center items-center h-fit opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100 ">
              <div className="w-fit rounded-md border border-border backdrop-blur-xl bg-card flex justify-center items-center h-10">
                <Button size="icon" variant="muted" onClick={() => handleWidth("column")}>
                  <WidthColumn />
                </Button>
                <Button size="icon" variant="muted" onClick={() => handleWidth("wide")}>
                  <WidthWide />
                </Button>
                <Button size="icon" variant="muted" onClick={() => handleWidth("full")}>
                  <WidthFull />
                </Button>
                <Separator className="m-2 h-6" orientation="vertical" />
                <Button className="w-fit px-2" variant="muted" onClick={handleUpload}>
                  {props.node.attrs.src ? "Change" : "Upload"}
                </Button>
                <Button className="w-fit px-2" variant="muted" onClick={handleRemove}>
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full aspect-video rounded">
            <Button className="z-20 flex gap-2" variant="muted" onClick={handleUpload} disabled={isLoading}>
              {isLoading ? (
                <>
                  <LoadingSpinner />
                  Uploading...
                </>
              ) : (
                <>
                  {props.extension.options.uploadIcon}
                  Upload Image
                </>
              )}
            </Button>
            <div className="placeholder-background" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageComponent;
