/* eslint-disable tailwindcss/no-custom-classname */
"use client";

import React from "react";

import type { TEditor } from "@udecode/plate-common";
import type { DropTargetMonitor } from "react-dnd";

import { MemoizedChildren, cn, withRef } from "@udecode/cn";
import {
  type PlateElementProps,
  useEditorPlugin,
  useEditorRef,
  useElement,
  withHOC,
} from "@udecode/plate-common/react";
import {
  type DragItemNode,
  DraggableProvider,
  useDraggable,
  useDraggableGutter,
  useDraggableState,
  useDropLine,
} from "@udecode/plate-dnd";
import { BlockSelectionPlugin } from "@udecode/plate-selection/react";
import { GripVertical } from "lucide-react";

import { useMounted } from "@/hooks/use-mounted";

import { BlockMenu } from "./block-menu";
import { Button } from "./button";
import { DraggableInsertHandle } from "./draggable-insert-handler";

export interface DraggableProps extends PlateElementProps {
  onDropHandler?: (
    editor: TEditor,
    props: {
      id: string;
      dragItem: DragItemNode;
      monitor: DropTargetMonitor<DragItemNode, unknown>;
      nodeRef: any;
    },
  ) => boolean;
}

export const Draggable = withHOC(
  DraggableProvider,
  withRef<"div", DraggableProps>(({ className, onDropHandler, ...props }, ref) => {
    const { children, element } = props;

    const state = useDraggableState({ element, onDropHandler });
    const { isDragging } = state;
    const { previewRef, handleRef } = useDraggable(state);
    const mounted = useMounted();

    return (
      <div ref={ref} className={cn("relative", isDragging && "opacity-50", "group", className)}>
        <Gutter>
          <div className={cn("slate-blockToolbarWrapper", "flex h-[1.5em]")}>
            <div className={cn("slate-blockToolbar", "pointer-events-auto mr-0.5 flex items-center")}>
              <DraggableInsertHandle />

              <div ref={handleRef} className="h-6" data-key={mounted ? (element.id as string) : undefined}>
                <DragHandle />
              </div>
            </div>
          </div>
        </Gutter>

        <div ref={previewRef} className="slate-blockWrapper">
          <MemoizedChildren>{children}</MemoizedChildren>

          <DropLine />
        </div>
      </div>
    );
  }),
);

const Gutter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ children, className, ...props }, ref) => {
    const { useOption } = useEditorPlugin(BlockSelectionPlugin);
    const isSelectionAreaVisible = useOption("isSelectionAreaVisible");
    const gutter = useDraggableGutter();

    return (
      <div
        ref={ref}
        className={cn(
          "slate-gutterLeft",
          "absolute top-[3px] z-50 flex -translate-x-full cursor-text opacity-0 transition-opacity duration-100 ease-in hover:opacity-100 group-hover:opacity-100",
          isSelectionAreaVisible && "hidden",
          className,
        )}
        {...props}
        {...gutter.props}
      >
        {children}
      </div>
    );
  },
);

const DragHandle = React.memo(({ handleRef, ...props }: any) => {
  const editor = useEditorRef();
  const element = useElement();

  return (
    <BlockMenu id={element.id as string} placement="left" animateZoom>
      <Button
        ref={handleRef}
        {...props}
        variant="ghost"
        className="h-6 w-[18px] shrink-0 rounded-sm p-0"
        onMouseDown={() => {
          editor.getApi(BlockSelectionPlugin).blockSelection.addSelectedRow(element.id as string);
        }}
        tabIndex={-1}
        tooltip={
          <div className="text-center">
            Drag <span className="text-gray-400">to move</span>
            <br />
            Click <span className="text-gray-400">to open menu</span>
          </div>
        }
        tooltipContentProps={{
          side: "bottom",
        }}
      >
        <GripVertical className="size-4 text-muted-foreground/70" />
      </Button>
    </BlockMenu>
  );
});

const DropLine = React.memo(
  React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ children, className, ...props }, ref) => {
    const state = useDropLine();

    if (!state.dropLine) return null;

    return (
      <div
        ref={ref}
        {...props}
        {...state.props}
        className={cn(
          "slate-dropLine",
          "absolute inset-x-0 h-[3px] opacity-100 transition-opacity",
          "bg-primary/50",
          state.dropLine === "top" && "top-[-2px]",
          state.dropLine === "bottom" && "bottom-[-2px]",
          className,
        )}
      >
        {children}
      </div>
    );
  }),
);
