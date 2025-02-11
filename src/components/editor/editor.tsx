"use client";

import { createPlateEditor, Plate, usePlateEditor } from "@udecode/plate/react";
import { useSearchParams } from "next/navigation";
import type { PropsWithChildren } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { CommentsPopover } from "../ui/comments-popover";
import { Editor, EditorContainer } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { TocSidebar } from "../ui/toc-sidebar";
import { AutoSave } from "./addons/editor-autosave";
import { getRichElements } from "./elements";
import { getEditorPlugins } from "./plugins";

export default function PlateEditor(
  props: PropsWithChildren & {
    showToolbar?: boolean;
    showToc?: boolean;
    username?: string;
    readOnly?: boolean;
    value?: string;
    pathname?: string;
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
          {props.showToc && <TocSidebar className="top-[80px]" topOffset={30} />}

          {props.showToolbar && (
            <FixedToolbar>
              <FixedToolbarButtons />
            </FixedToolbar>
          )}

          {props.children}

          <EditorContainer className={"w-full overflow-visible"} data-plate-selectable>
            <div className="w-[65ch] mx-auto overflow-visible">
              <Editor variant={"fullWidth"} autoFocus />
            </div>
          </EditorContainer>

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
