"use client";

import { Plate, createPlateEditor, useEditorMounted, usePlateEditor } from "@udecode/plate/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, type PropsWithChildren } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Editor, EditorContainer } from "../ui/editor";
import { FixedToolbar } from "../ui/fixed-toolbar";
import { FixedToolbarButtons } from "../ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "../ui/floating-toolbar";
import { FloatingToolbarButtons } from "../ui/floating-toolbar-buttons";
import { TocSidebar } from "../ui/toc-sidebar";
import { AutoSave } from "./addons/editor-autosave";
import { getElements, getRichElements } from "./elements";
import { getEditorPlugins } from "./plugins";
import { useMounted } from "@/hooks/use-mounted";
import { YjsPlugin } from "@udecode/plate-yjs/react";
import { trimEmptyNodes } from "@/lib/plate/trim-empty-nodes";

export default function PlateEditor(
  props: PropsWithChildren & {
    showToolbar?: boolean;
    showToc?: boolean;
    username?: string;
    readOnly?: boolean;
    pathname?: string;
    appToken?: string;
    value?: string;
    collaborative?: boolean;
  },
) {
  const documentId = props?.pathname?.split("?")?.[0]?.split("/")?.at(-1) ?? "erroredDocumentId";
  const searchParams = useSearchParams();
  const isPreview = searchParams.has("preview");
  const isReadOnly = props.readOnly || isPreview;
  const isCollaborative = props.collaborative ?? false;
  const isMounted = useMounted();
  const imported = searchParams.has("import");
  const parsedValue = JSON.parse(props.value as string);
  const value = props.readOnly ? trimEmptyNodes(parsedValue) : parsedValue;

  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.appToken, isReadOnly, isCollaborative)],
    override: {
      components: getRichElements(),
    },
    skipInitialization: isCollaborative,
    value: isCollaborative ? undefined : value,
  });

  useEffect(() => {
    if (!isMounted || props.readOnly || !isCollaborative) return;

    editor.getApi(YjsPlugin).yjs.init({
      id: documentId,
      value: undefined,
      autoSelect: "end",
    });

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
  }, [isMounted, editor, isCollaborative]);

  if (!documentId) {
    return null;
  }

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

          <EditorContainer data-plate-selectable>
            <div className="max-w-[65ch] w-full mx-auto">
              <Editor variant={"fullWidth"} autoFocus />
            </div>
          </EditorContainer>

          {!isReadOnly && <AutoSave documentId={documentId} collaborative={isCollaborative} />}

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <div className="absolute right-0 top-0 h-full w-4 select-none" />
        </div>
      </Plate>
    </DndProvider>
  );
}

export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...getEditorPlugins("nopath", undefined, false, false)],
    override: {
      components: getElements(),
    },
  });
};
