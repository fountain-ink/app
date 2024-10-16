"use client";

import { Button } from "@/components/ui/button";
import { NodeViewWrapper } from "@tiptap/react";
import { ArrowLeftRight, Maximize, Minimize } from "lucide-react";
import { useRef } from "react";

import { uploadFile } from "@/lib/upload-image";

const ImagePlaceholderComponent = (props: {
  node: {
    attrs: {
      width: "column" | "wide" | "full";
    };
  };
  updateAttributes: (attrs: Partial<{ width: "column" | "wide" | "full" }>) => void;
  deleteNode: () => void;
  extension: {
    options: {
      uploadIcon: React.ReactNode;
    };
  };
  editor: any;
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

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
          const { from, to } = props.editor.state.selection;
          props.editor
            .chain()
            .focus()
            .deleteRange({ from, to })
            .setImage({ src: newSrc, width: props.node.attrs.width })
            .run();
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      }
    };
    input.click();
  };
  const getWidthClasses = (width: string) => {
    switch (width) {
      case "wide":
        return "w-[120%] -ml-[10%] max-w-[120%]";
      case "full":
        return "w-screen max-w-[90vw] relative -translate-x-1/2 left-1/2 content-center justify-center";
      default: // column
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
      <div className="relative flex-grow-0 group border-2 border-dashed border-secondary hover:border-primary transition-colors duration-300 ease-in-out p-8 rounded-lg w-full aspect-video">
        <div className="flex flex-col items-center justify-center space-y-2 w-full h-full">
          {props.extension.options.uploadIcon}
          <Button onClick={handleUpload}>Upload Image</Button>
        </div>
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
      </div>
    </NodeViewWrapper>
  );
};

export default ImagePlaceholderComponent;
