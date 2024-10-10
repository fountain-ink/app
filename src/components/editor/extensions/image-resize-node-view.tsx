"use client";

import { Button } from "@/components/ui/button";
import { NodeViewWrapper } from "@tiptap/react";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, MaximizeIcon, Trash2Icon, UploadIcon } from "lucide-react";
import { useRef } from "react";

import { uploadFile } from "@/lib/upload-image";

const ImageResizeComponent = (props: {
  suppressContentEditableWarning?: boolean;

  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width: number | string;
      height: number | string;
      showControls: boolean;
      alignment: "left" | "center" | "right" | "wide";
    };
  };
  updateAttributes: (
    attrs: Partial<{
      width: number | string;
      height: number | string;
      src: string;
      showControls: boolean;
      alignment: "left" | "center" | "right" | "wide";
    }>,
  ) => void;
  deleteNode: () => void;
  extension: {
    options: {
      resizeIcon: React.ReactNode;
    };
  };
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const handler = (mouseDownEvent: React.MouseEvent<HTMLDivElement>) => {
    const image = imageRef.current;
    if (!image) return;

    const startSize = { x: image.clientWidth, y: image.clientHeight };
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      const minSize = 200;
      const newWidth = Math.max(startSize.x - startPosition.x + mouseMoveEvent.pageX, minSize);
      const newHeight = Math.max(startSize.y - startPosition.y + mouseMoveEvent.pageY, minSize);

      props.updateAttributes({
        width: newWidth,
        height: newHeight,
      });
    }

    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
    }

    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });

    mouseDownEvent.stopPropagation();
  };
  const handleAlign = (alignment: "left" | "center" | "right" | "wide") => {
    props.updateAttributes({ alignment });
  };

  const handleRemove = () => {
    props.deleteNode();
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

  const getAlignmentClasses = (alignment: string) => {
    switch (alignment) {
      case "left":
        return "justify-start mr-4";
      case "right":
        return "justify-end ml-4";
      case "wide":
        return "w-screen max-w-none relative -translate-x-1/2 left-1/2 content-center justify-center";
      default:
        return "justify-center mx-auto";
    }
  };

  const alignment = props.node.attrs.alignment || "center";
  const alignmentClass = getAlignmentClasses(alignment);
  const { showControls, ...imgAttributes } = props.node.attrs;

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      className={`flex ${alignmentClass}`}
      contentEditable="false"
      data-drag-handle
      draggable="true"
      suppressContentEditableWarning={true}
    >
      <div className="inline-block relative flex-grow-0 group">
        <img
          ref={imageRef}
          {...imgAttributes}
          className={`border-2 border-secondary group-hover:border-primary transition-colors duration-300 ease-in-out ${alignment === "wide" ? "w-[80vw] max-w-none" : ""}`}
        />
        {showControls && (
          <>
            <div
              className="absolute -right-2 -bottom-2 opacity-0 transition-opacity \
            duration-300 ease-in-out hover:opacity-100 group-hover:opacity-100 \
            cursor-move  text-primary hover:text-muted-foreground"
              onMouseDown={handler}
            >
              {props.extension.options.resizeIcon}
            </div>
            <div className="absolute top-2 left-2 space-x-1 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 rounded backdrop-blur-xl">
              <Button size="sm" onClick={() => handleAlign("left")}>
                <AlignLeftIcon size={16} />
              </Button>
              <Button size="sm" onClick={() => handleAlign("center")}>
                <AlignCenterIcon size={16} />
              </Button>
              <Button size="sm" onClick={() => handleAlign("right")}>
                <AlignRightIcon size={16} />
              </Button>
              <Button size="sm" onClick={() => handleAlign("wide")}>
                <MaximizeIcon size={16} />
              </Button>
            </div>
          </>
        )}
        <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 bg-background/0 rounded backdrop-blur-sm flex">
          <Button size="sm" onClick={handleUpload} className="mr-1">
            <UploadIcon size={16} />
          </Button>
          <Button size="sm" onClick={handleRemove}>
            <Trash2Icon size={16} />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default ImageResizeComponent;
