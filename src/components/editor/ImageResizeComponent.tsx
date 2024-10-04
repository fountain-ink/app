"use client";
import { NodeViewWrapper } from "@tiptap/react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ImageResizeProps {
  node: any;
  updateAttributes: (attrs: Record<string, any>) => void;
  editor: any;
}

const ImageResizeComponent: React.FC<ImageResizeProps> = ({ node, updateAttributes, editor }) => {
  const [isResizing, setIsResizing] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [aspectRatio, setAspectRatio] = useState(0);

  useEffect(() => {
    if (imgRef.current) {
      setAspectRatio(imgRef.current.naturalWidth / imgRef.current.naturalHeight);
    }
  }, []);

  const handleImageClick = () => {
    setShowControls(true);
  };

  const handleOutsideClick = useCallback((e: MouseEvent) => {
    if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
      setShowControls(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [handleOutsideClick]);

  const handleResize = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (!imgRef.current) return;

      const startX = e.clientX;
      const startY = e.clientY;
      const startWidth = imgRef.current.width;
      const startHeight = imgRef.current.height;

      const onMouseMove = (e: MouseEvent) => {
        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newWidth = startWidth + deltaX;
        const newHeight = newWidth / aspectRatio;

        updateAttributes({ width: Math.round(newWidth), height: Math.round(newHeight) });
      };

      const onMouseUp = () => {
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        setIsResizing(false);
      };

      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
      setIsResizing(true);
    },
    [updateAttributes, aspectRatio]
  );

  const handleAlign = (alignment: "left" | "center" | "right") => {
    let alignClass = "";
    switch (alignment) {
      case "left":
        alignClass = "float-left mr-4";
        break;
      case "center":
        alignClass = "mx-auto block";
        break;
      case "right":
        alignClass = "float-right ml-4";
        break;
    }
    updateAttributes({ alignment: alignClass });
  };

  const handleKeyDown = (e: React.KeyboardEvent, alignment: "left" | "center" | "right") => {
    if (e.key === "Enter" || e.key === " ") {
      handleAlign(alignment);
    }
  };

  const alignmentClass = node.attrs.alignment || "";

  return (
    <NodeViewWrapper>
      <div ref={containerRef} className={`relative inline-block ${alignmentClass}`}>
        <img
          ref={imgRef}
          src={node.attrs.src}
          alt={node.attrs.alt || "Editable image"}
          width={node.attrs.width}
          height={node.attrs.height}
          onClick={handleImageClick}
          className={`cursor-pointer ${showControls ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
        />
        {showControls && (
          <>
            <div
              className="absolute bottom-0 right-0 w-3 h-3 bg-white border-2 border-blue-500 rounded-full cursor-se-resize"
              onMouseDown={handleResize}
            />
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex space-x-2 bg-white rounded shadow p-1">
              {["left", "center", "right"].map((alignment) => (
                <button
                  type="button"
                  key={alignment}
                  onClick={() => handleAlign(alignment as "left" | "center" | "right")}
                  onKeyDown={(e) => handleKeyDown(e, alignment as "left" | "center" | "right")}
                  className="p-1 hover:bg-gray-100 rounded"
                  aria-label={`Align image ${alignment}`}
                >
                  <img
                    src={`https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/format_align_${alignment}/default/20px.svg`}
                    alt={`Align ${alignment}`}
                    className="w-5 h-5"
                  />
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageResizeComponent;
