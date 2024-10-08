"use client";

import { Button } from "@/components/ui/button";
import { NodeViewWrapper } from "@tiptap/react";
import { AlignCenterIcon, AlignLeftIcon, AlignRightIcon, Trash2Icon } from "lucide-react";
import { useRef } from "react";

const ImageResizeComponent = (props: {
  node: {
    attrs: {
      src: string;
      alt?: string;
      title?: string;
      width: number | string;
      height: number | string;
      alignment: "left" | "center" | "right";
    };
  };
  updateAttributes: (
    attrs: Partial<{
      width: number | string;
      height: number | string;
      alignment: "left" | "center" | "right";
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

  const handleAlign = (alignment: "left" | "center" | "right") => {
    props.updateAttributes({ alignment });
  };

  const handleRemove = () => {
    props.deleteNode();
  };

  const getAlignmentClasses = (alignment: string) => {
    switch (alignment) {
      case "left":
        return "float-left mr-4";
      case "right":
        return "float-right ml-4";
      default:
        return "mx-auto";
    }
  };
  
  const alignment = props.node.attrs.alignment || "center";
  const alignmentClass = getAlignmentClasses(alignment);

  return (
    <NodeViewWrapper
      ref={wrapperRef}
      class="drag-handle"
      contentEditable="false"
      data-drag-handle
      draggable="true"
      className={`block relative ${alignment === "center" ? "flex justify-center" : ""}`}
    >
      <div className={`inline-block relative flex-grow-0 group ${alignmentClass}`}>
        <img
          ref={imageRef}
          {...props.node.attrs}
          className="border-2 border-secondary group-hover:border-primary transition-colors duration-300 ease-in-out"
        />
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
        </div>
        <div className="absolute top-2 right-2 opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-80 bg-background/0 rounded backdrop-blur-sm">
          <Button size="sm" onClick={handleRemove}>
            <Trash2Icon size={16} />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

export default ImageResizeComponent;
