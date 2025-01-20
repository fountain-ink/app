"use client";

import { Plate, createPlateEditor, usePlateEditor } from "@udecode/plate-common/react";
import { useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommentsPopover } from "../ui/comments-popover";
import { Editor } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { TocSideBar } from "../ui/toc-sidebar";
import { AutoSave } from "./addons/editor-autosave";
import { getRichElements } from "./elements";
import { getEditorPlugins } from "./plugins";

export default function PlateEditor(
  props: PropsWithChildren & {
    showToolbar?: boolean;
    showToc?: boolean;
    handle?: string;
    readOnly?: boolean;
    value?: string;
    pathname?: string;
    refreshToken?: string;
    appToken?: string;
  },
) {
  const documentId = props?.pathname?.split("?")?.[0]?.split("/")?.at(-1) ?? "erroredDocumentId";
  const searchParams = useSearchParams();
  const isPreview = searchParams.has("preview");
  const isReadOnly = props.readOnly || isPreview;
  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.appToken, isReadOnly)],
    override: {
      components: getRichElements(),
    },
    value: props.value ? JSON.parse(props.value) || "" : undefined,
  });

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate editor={editor} readOnly={isReadOnly}>
        <div data-plate-selectable="true">
          {props.showToc && <TocSideBar className="top-[80px]" topOffset={30} />}

          {props.showToolbar && (
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
          )}

          {props.children}

          <Editor
            className={
              "overflow-visible w-full max-w-full sm:max-w-3xl md:max-w-4xl p-10 pt-0 sm:px-30 md:px-40 mx-auto"
            }
            variant="fullWidth"
            autoFocus
          />

          {!isReadOnly && <AutoSave documentId={documentId} />}

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <CommentsPopover />

          <div className="absolute right-0 top-0 h-full w-4 select-none" />
        </div>
      </Plate>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...getEditorPlugins("nopath")],
    override: {
      components: getRichElements(),
    },
  });
};
