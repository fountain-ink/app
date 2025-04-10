"use client";

import React, { type CSSProperties, useEffect, useState } from "react";

import { type CursorOverlayData, useRemoteCursorOverlayPositions } from "@slate-yjs/react";
import { useEditorContainerRef, useEditorRef } from "@udecode/plate/react";

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);

  return hexColor + normalized.toString(16).toUpperCase();
}

export type CursorData = {
  color: string;
  name: string;
};

type CaretProps = Pick<CursorOverlayData<CursorData>, "caretPosition" | "data">;
const cursorOpacity = 0.7;
const hoverOpacity = 1;

function Caret({ caretPosition, data }: CaretProps) {
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };
  const caretStyle: CSSProperties = {
    ...caretPosition,
    background: data?.color,
    opacity: cursorOpacity,
    transition: "opacity 0.2s",
  };
  const caretStyleHover = { ...caretStyle, opacity: hoverOpacity };

  const labelStyle: CSSProperties = {
    background: data?.color,
    opacity: cursorOpacity,
    transform: "translateY(-100%)",
    transition: "opacity 0.2s",
  };
  const labelStyleHover = { ...labelStyle, opacity: hoverOpacity };

  return (
    <div className="absolute w-0.5" style={isHover ? caretStyleHover : caretStyle}>
      <div
        className="absolute top-0 rounded rounded-bl-none px-1.5 py-0.5 text-xs whitespace-nowrap text-white"
        style={isHover ? labelStyleHover : labelStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {data?.name}
      </div>
    </div>
  );
}

function RemoteSelection({ caretPosition, data, selectionRects }: CursorOverlayData<CursorData>) {
  if (!data) {
    return null;
  }

  const selectionStyle: CSSProperties = {
    // Add a opacity to the background color
    backgroundColor: addAlpha(data.color, 0.5),
  };

  return (
    <React.Fragment>
      {selectionRects.map((position, i) => (
        <div
          key={`${data.color}-${i}`}
          className="pointer-events-none absolute"
          style={{ ...selectionStyle, ...position }}
        />
      ))}
      {caretPosition && <Caret data={data} caretPosition={caretPosition} />}
    </React.Fragment>
  );
}

export function RemoteCursorOverlay() {
  const containerRef: any = useEditorContainerRef();
  const editor = useEditorRef();
  const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  });

  // useEffect(() => {
    // editor.tf.select()
    // editor.tf.focus({ edge: "endEditor" });
  // }, []);

  return (
    <>
      {cursors.map((cursor) => (
        <RemoteSelection key={cursor.clientId} {...cursor} />
      ))}
    </>
  );
}
