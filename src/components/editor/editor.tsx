"use client";

import { Plate, PlateStoreProvider, createPlateEditor, usePlateEditor } from "@udecode/plate-common/react";
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
import { TocSideBar } from "../ui/toc-sidebar";
import { getEditorPlugins } from "./plugins";
import { getUiComponents } from "./ui-components";

export default function PlateEditor(
  props: PropsWithChildren & {
    showToolbar?: boolean;
    showToc?: boolean;
    refreshToken?: string;
    handle?: string;
    readOnly?: boolean;
    value?: string;
  },
) {
  const containerRef = useRef(null);
  const editorRef = useRef(null);
  const pathname = usePathname();
  const documentId = pathname.split("/").at(-1) || "erroredDocumentId";

  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.handle, props.refreshToken, props.readOnly)],
    override: {
      components: getUiComponents(),
    },
    options: {},
    value: props.value ? JSON.parse(props.value) || "" : undefined,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <PlateStoreProvider>
        <Plate editor={editor} readOnly={props.readOnly}>
          <div ref={containerRef} data-plate-selectable="true">
            {props.showToc && <TocSideBar className="top-[80px]" topOffset={30} />}

            {props.showToolbar && (
              <FixedToolbar>
                <FixedToolbarButtons />
              </FixedToolbar>
            )}

            {props.children}

            <Editor
              ref={editorRef}
              className={"overflow-visible w-full max-w-full sm:max-w-3xl md:max-w-4xl p-10 sm:px-30 md:px-40 mx-auto"}
              autoFocus
              variant="fullWidth"
            />

            <FloatingToolbar>
              <FloatingToolbarButtons />
            </FloatingToolbar>

            <CommentsPopover />

            <div className="absolute right-0 top-0 h-full w-4 select-none" />
          </div>
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
