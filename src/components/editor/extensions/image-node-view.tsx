"use client";

import { Button } from "@/components/ui/button";
import { uploadFile } from "@/lib/upload-image";
import { NodeViewWrapper } from "@tiptap/react";
import { ArrowLeftRight, Maximize, Minimize, Trash2Icon, UploadIcon } from "lucide-react";
import { useRef } from "react";

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
          const newSrc = await uploadFile(file);
          props.updateAttributes({ src: newSrc });
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
    input.click();
  };

  const handleRemove = () => {
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
      className={`flex justify-center ${widthClass}`}
      contentEditable="false"
      data-drag-handle
    >
      <div
        className={
          "relative flex-grow-0 group border-2 border-secondary hover:border-primary transition-colors duration-300 ease-in-out rounded-lg w-full"
        }
      >
        {props.node.attrs.src ? (
          <img ref={imageRef} src={props.node.attrs.src} className="w-full h-full object-cover" />
        ) : (
          <div className="flex flex-col items-center justify-center space-y-2 w-full aspect-video rounded">
            {props.extension.options.uploadIcon}
            <Button className="z-20" onClick={handleUpload}>
              Upload Image
            </Button>
            <div className="placeholder-background" />
          </div>
        )}
        <div className="absolute top-2 left-2 space-x-1 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 rounded backdrop-blur-xl">
          <Button size="sm" onClick={() => handleWidth("column")}>
            <Minimize size={16} />
          </Button>
          <Button size="sm" onClick={() => handleWidth("wide")}>
            <ArrowLeftRight size={16} />
          </Button>
          <Button size="sm" onClick={() => handleWidth("full")}>
            <Maximize size={16} />
          </Button>
        </div>
        {props.node.attrs.src && (
          <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 bg-background/0 rounded backdrop-blur-sm flex">
            <Button size="sm" onClick={handleUpload} className="mr-1">
              <UploadIcon size={16} />
            </Button>
            <Button size="sm" onClick={handleRemove}>
              <Trash2Icon size={16} />
            </Button>
          </div>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageComponent;
