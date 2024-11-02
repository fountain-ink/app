"use client";

import { cn } from "@udecode/cn";
import { Plate, usePlateEditor } from "@udecode/plate-common/react";
import { useRef } from "react";
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
import { commonPlugins } from "./plate-plugins";

export default function PlateEditor({ showToolbar = false }: { showToolbar?: boolean }) {
  const containerRef = useRef(null);
  const editor = useMyEditor();

  return (
    <DndProvider backend={HTML5Backend}>
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
          {showToolbar && (
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
          )}

          <Editor disableDefaultStyles className={"overflow-visible"} autoFocus focusRing={false} variant="ghost" />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <CommentsPopover />

          <CursorOverlay containerRef={containerRef} />
        </div>

        {/* <SettingsDialog /> */}
      </Plate>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...commonPlugins],
    override: {
      components: getUiComponents(),
    },
  });
};
