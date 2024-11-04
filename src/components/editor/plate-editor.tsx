"use client";

import { cn } from "@udecode/cn";
import { createPlateEditor, Plate, PlateStoreProvider, usePlateEditor } from "@udecode/plate-common/react";
import { PropsWithChildren, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommentsPopover } from "../ui/comments-popover";
import { CursorOverlay } from "../ui/cursor-overlay";
import { Editor } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { getUiComponents } from "./plate-create-ui";
import { editorPlugins } from "./plate-plugins";

export default function PlateEditor(props: PropsWithChildren & { showToolbar?: boolean }) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const editor = createPlateEditor({
    plugins: [...editorPlugins],
    override: {
      components: getUiComponents(),
    },
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <PlateStoreProvider>
        <Plate editor={editor}>
          <div
            id="scroll_container"
            ref={containerRef}
            className={cn(
              "relative",
              // Block selection
              "[&_.slate-start-area-left]:!w-[64px] [&_.slate-start-area-right]:!w-[64px] [&_.slate-start-area-top]:!h-4 overflow-visible",
            )}
          >
            {props.showToolbar && (
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            )}

            {props.children}
            <Editor ref={editorRef} disableDefaultStyles className={"overflow-visible"} autoFocus variant="fullWidth" />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <CommentsPopover />

            <CursorOverlay containerRef={containerRef} />
          </div>

          {/* <SettingsDialog /> */}
        </Plate>
      </PlateStoreProvider>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...editorPlugins],
    override: {
      components: getUiComponents(),
    },
  });
};
