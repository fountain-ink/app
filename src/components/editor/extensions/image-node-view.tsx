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

  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const toggleMenu = () => {
    setIsMenuVisible(!isMenuVisible);
  };

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
        setIsLoading(true);
        try {
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
    props.deleteNode();
  };

  const getWidthClasses = (width: string) => {
    switch (width) {
      case "wide":
        return "w-[160%] -ml-[30%]";
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
      className={`

        flex rounded-sm  relative my-[--image-margin-y] justify-center ${widthClass} ${isMenuVisible && "ring-2 ring-primary"}
      `}
      suppressContentEditableWarning
      data-drag-handle
      tabIndex={0}
    >
      <div className={" flex-grow-0 group transition-colors duration-300 ease-in-out rounded-sm w-full "}>
        {props.node.attrs.src ? (
          <>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center w-full aspect-video rounded-sm animate-pulse-slow transition-all duration-1000 delay-0">
                <Button className={"z-20 flex gap-2"} variant="muted" disabled>
                  <LoadingSpinner />
                  Uploading...
                </Button>
                <div className="placeholder-background rounded-sm" />
              </div>
            ) : (
              <img
                ref={imageRef}
                src={props.node.attrs.src}
                className="w-full h-full object-cover cursor-pointer rounded-sm border-2 border-muted-foreground/50 group-hover:border-primary"
                onClick={toggleMenu}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    toggleMenu();
                  }
                }}
              />
            )}
            <div
              className={`absolute inset-x-0 -top-4 space-x-1 w-full flex justify-center items-center h-fit transition-opacity duration-300 ease-in-out ${
                isMenuVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            >
              <div className="w-fit rounded-sm border border-border backdrop-blur-xl bg-card flex justify-center items-center h-10">
                <Button
                  size="icon"
                  variant="muted"
                  className={width === "column" ? "text-primary" : "muted"}
                  onClick={() => handleWidth("column")}
                >
                  <WidthColumn />
                </Button>
                <Button
                  size="icon"
                  variant="muted"
                  className={width === "wide" ? "text-primary" : "muted"}
                  onClick={() => handleWidth("wide")}
                >
                  <WidthWide />
                </Button>
                <Button
                  size="icon"
                  variant="muted"
                  className={width === "full" ? "text-primary" : "muted"}
                  onClick={() => handleWidth("full")}
                >
                  <WidthFull />
                </Button>

                <Separator className="m-2 h-6" orientation="vertical" />
                <Button className="w-fit px-2" variant="muted" onClick={handleUpload} disabled={isLoading}>
                  {isLoading ? "Uploading..." : "Change"}
                </Button>
                <Button className="w-fit px-2" variant="muted" onClick={handleRemove}>
                  Remove
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center w-full aspect-video rounded-sm">
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
            <div className="placeholder-background rounded-sm" />
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageComponent;
