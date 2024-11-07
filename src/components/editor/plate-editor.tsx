"use client";

import { cn } from "@udecode/cn";
import { createPlateEditor, Plate, PlateStoreProvider, usePlateEditor } from "@udecode/plate-common/react";
import { usePathname } from "next/navigation";
import { type PropsWithChildren, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommentsPopover } from "../ui/comments-popover";
import { Editor } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { getUiComponents } from "./plate-create-ui";
import { getEditorPlugins } from "./plate-plugins";

export default function PlateEditor(
  props: PropsWithChildren & { showToolbar?: boolean; refreshToken?: string; handle?: string },
) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const pathname = usePathname();
  const documentId = pathname.split("/").at(-1) || "erroredDocumentId";

  console.log(documentId, props.handle, props.refreshToken);
  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.handle, props.refreshToken)],
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
              "overflow-visible w-full",
              // Block selection
              "[&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10",
            )}
          >
            {props.showToolbar && (
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            )}

            {props.children}
            <Editor
              data-plate-selectable
              ref={editorRef}
              disableDefaultStyles
              className={"overflow-visible scroll_container w-full"}
              autoFocus
              variant="fullWidth"
            />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <CommentsPopover />
            <div className="absolute right-0 top-0 h-full w-4 select-none" />

            {/* <CursorOverlay containerRef={containerRef} /> */}
          </div>

          {/* <SettingsDialog /> */}
        </Plate>
      </PlateStoreProvider>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...getEditorPlugins("nopath")],
    override: {
      components: getUiComponents(),
    },
  });
};
