import { type CursorOverlayData, useRemoteCursorOverlayPositions } from "@slate-yjs/react";
import clsx from "clsx";
import React, { type CSSProperties, type PropsWithChildren, useRef } from "react";

export function addAlpha(hexColor: string, opacity: number): string {
  const normalized = Math.round(Math.min(Math.max(opacity, 0), 1) * 255);
  return hexColor + normalized.toString(16).toUpperCase();
}
export type CursorData = {
  name: string;
  color: string;
};
type CaretProps = Pick<CursorOverlayData<CursorData>, "caretPosition" | "data">;

function Caret({ caretPosition, data }: CaretProps) {
  const caretStyle: CSSProperties = {
    ...caretPosition,
    background: data?.color,
  };

  const labelStyle: CSSProperties = {
    transform: "translateY(-100%)",
    background: data?.color,
  };

  return (
    <div style={caretStyle} className="absolute w-0.5">
      <div
        className="absolute top-0 whitespace-nowrap rounded rounded-bl-none px-1.5 py-0.5 text-xs text-white"
        style={labelStyle}
      >
        {data?.name}
      </div>
    </div>
  );
}

function RemoteSelection({ data, selectionRects, caretPosition }: CursorOverlayData<CursorData>) {
  if (!data) {
    return null;
  }

  const selectionStyle: CSSProperties = {
    // Add a opacity to the background color
    backgroundColor: addAlpha(data.color, 0.5),
  };

  return (
    <React.Fragment>
      {selectionRects.map((position: any, i: any) => (
        <div
          style={{ ...selectionStyle, ...position }}
          className="pointer-events-none absolute"
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          key={i}
        />
      ))}
      {caretPosition && <Caret caretPosition={caretPosition} data={data} />}
    </React.Fragment>
  );
}

type RemoteCursorsProps = PropsWithChildren<{
  className?: string;
}>;

export function RemoteCursorOverlay({ className, children }: RemoteCursorsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursors] = useRemoteCursorOverlayPositions<CursorData>({
    containerRef,
  });
  return (
    <div className={clsx("relative", className)} ref={containerRef}>
      {children}
      {cursors.map((cursor: any) => (
        <RemoteSelection key={cursor.clientId} {...cursor} />
      ))}
    </div>
  );
}
