"use client";

import { createPlateEditor, Plate, PlateStoreProvider, usePlateEditor } from "@udecode/plate-common/react";
import { usePathname } from "next/navigation";
import { type PropsWithChildren, useRef } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommentsPopover } from "../ui/comments-popover";
import { SelectionOverlay } from "../ui/cursor-overlay";
import { Editor } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { TocSideBar } from "../ui/toc-sidebar";
import { getUiComponents } from "./plate-create-ui";
import { getEditorPlugins } from "./plate-plugins";

export default function PlateEditor(
  props: PropsWithChildren & { showToolbar?: boolean; showToc?: boolean; refreshToken?: string; handle?: string },
) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const pathname = usePathname();
  const documentId = pathname.split("/").at(-1) || "erroredDocumentId";

  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.handle, props.refreshToken)],
    override: {
      components: getUiComponents(),
    },
    options: {},
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <PlateStoreProvider>
        <Plate editor={editor}>
          <div ref={containerRef} data-plate-selectable>
            {props.showToc && <TocSideBar className="top-[80px]" topOffset={30} />}

            {props.showToolbar && (
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            )}

            {props.children}

            <Editor
              ref={editorRef}
              disableDefaultStyles
              className={
                "overflow-visible justify-self-stretch grow w-full max-w-full sm:max-w-3xl md:max-w-4xl p-10 sm:px-30 md:px-40 mx-auto"
              }
              autoFocus
              variant="fullWidth"
            />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <CommentsPopover />

            <div className="absolute right-0 top-0 h-full w-4 select-none" />

            <SelectionOverlay containerRef={containerRef} />
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
