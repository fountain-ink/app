"use client";

import { WidthColumn, WidthFull, WidthWide } from "@/components/custom-icons";
import { LoadingSpinner } from "@/components/loading-spinner";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { uploadFile } from "@/lib/upload-image";
import { NodeViewWrapper } from "@tiptap/react";
import { useState } from "react";
import { IMAGE_WIDTH_CLASSES } from "./image";

const ImageActions = ({
  handleUpload,
  handleRemove,
  isLoading,
}: {
  handleUpload: () => void;
  handleRemove: () => void;
  isLoading: boolean;
}) => {
  return (
    <div className="flex gap-1">
      <Button className="w-fit px-2" variant="muted" onClick={handleUpload} disabled={isLoading}>
        Change
      </Button>
      <Button className="w-fit px-2" variant="muted" onClick={handleRemove}>
        Remove
      </Button>
    </div>
  );
};

const ImageMenu = ({
  width,
  handleWidth,
  handleUpload,
  handleRemove,
  isLoading,
  isPlaceholder,
}: {
  width: "column" | "wide" | "full";
  handleWidth: (width: "column" | "wide" | "full") => void;
  handleUpload: () => void;
  handleRemove: () => void;
  isLoading: boolean;
  isPlaceholder: boolean;
}) => {
  return (
    <div
      className="absolute inset-x-0 -top-5 space-x-1 w-full flex justify-center items-center
      h-fit transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none
      group-hover:opacity-100 group-hover:pointer-events-auto
      [.has-focus_&]:opacity-100 [.has-focus_&]:pointer-events-auto"
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
        {!isPlaceholder && (
          <>
            <Separator className="m-2 h-6" orientation="vertical" />
            <ImageActions handleUpload={handleUpload} handleRemove={handleRemove} isLoading={isLoading} />
          </>
        )}
      </div>
    </div>
  );
};

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
  const [isLoading, setIsLoading] = useState(false);
  const width = props.node.attrs.width || "column";

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
    props.editor.commands.focus();
  };

  const widthClass = IMAGE_WIDTH_CLASSES[width];

  return (
    <NodeViewWrapper className={`flex rounded-sm relative my-[--image-margin-y] justify-center ${widthClass}`}>
      <div className="flex-grow-0 group transition-colors duration-300 ease-in-out rounded-sm w-full">
        {props.node.attrs.src && (
          <div className="relative">
            <img
              src={props.node.attrs.src}
              className={`rounded-sm w-full border-2 group-hover:border-primary [.has-focus_&]:border-primary  ${isLoading ? "animate-pulse opacity-50" : ""}`}
            />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center gap-2">
                <LoadingSpinner />
                Uploading...
              </div>
            )}
          </div>
        )}
        {!props.node.attrs.src && (
          <div className="flex flex-col items-center justify-center w-full aspect-[16/8] rounded-sm border-2 border-muted-foreground/10 group-hover:border-primary [.has-focus_&]:border-primary [.has-focus_&]:ring-1 [.has-focus_&]:ring-primary">
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

        <div
          className="transition-opacity duration-300 ease-in-out opacity-0 pointer-events-none
          group-hover:opacity-100 group-hover:pointer-events-auto
          [.has-focus_&]:opacity-100 [.has-focus_&]:pointer-events-auto"
        >
          <ImageMenu
            width={width}
            handleWidth={(w) => props.updateAttributes({ width: w })}
            handleUpload={handleUpload}
            handleRemove={handleRemove}
            isLoading={isLoading}
            isPlaceholder={props.node.attrs.src === null}
          />
        </div>
      </div>
    </NodeViewWrapper>
  );
};
export default ImageComponent;
