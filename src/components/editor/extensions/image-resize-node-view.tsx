"use client";

import { NodeViewWrapper } from "@tiptap/react";

const ImageResizeComponent = (props: any) => {
  const handler = (mouseDownEvent: React.MouseEvent<HTMLImageElement>) => {
    const parent = (mouseDownEvent.target as HTMLElement).closest(".image-resizer");
    const image = parent?.querySelector("img.postimage") ?? null;
    if (image === null) return;
    const startSize = { x: image.clientWidth, y: image.clientHeight };
    const startPosition = { x: mouseDownEvent.pageX, y: mouseDownEvent.pageY };

    function onMouseMove(mouseMoveEvent: MouseEvent) {
      props.updateAttributes({
        width: startSize.x - startPosition.x + mouseMoveEvent.pageX,
        height: startSize.y - startPosition.y + mouseMoveEvent.pageY,
      });
    }
    function onMouseUp() {
      document.body.removeEventListener("mousemove", onMouseMove);
    }

    mouseDownEvent.stopPropagation();
    document.body.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseup", onMouseUp, { once: true });
  };

  return (
    <NodeViewWrapper
      class="drag-handle"
      contentEditable="false"
      data-drag-handle
      draggable="true"
      className="inline-flex relative flex-grow-0 group hover:border-accent group-hover:border-2 rounded-xl image-resizer"
    >
      <img {...props.node.attrs} className="postimage" />
      <div
        className="resize-trigger absolute -right-2 -bottom-2 opacity-0 transition-opacity duration-300 text-accent ease-in-out hover:opacity-100 group-hover:opacity-100"
        onMouseDown={handler}
      >
        {props.extension.options.resizeIcon}
      </div>
    </NodeViewWrapper>
  );
};

export default ImageResizeComponent;
