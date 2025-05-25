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
import { defaultContent } from "@/lib/plate/default-content";
import { trimEmptyNodes } from "@/lib/plate/trim-empty-nodes";
import { useDocumentStorage } from "@/hooks/use-document-storage";

export default function PlateEditor(
  props: PropsWithChildren & {
    showToolbar?: boolean;
    showToc?: boolean;
    username?: string;
    readOnly?: boolean;
    pathname?: string;
    appToken?: string;
    value?: string;
  },
) {
  const documentId = props?.pathname?.split("?")?.[0]?.split("/")?.at(-1) ?? "erroredDocumentId";
  const searchParams = useSearchParams();
  const isPreview = searchParams.has("preview");
  const isReadOnly = props.readOnly || isPreview;
  const isMounted = useMounted();
  const imported = searchParams.has("import");
  const { getDocument, saveDocument } = useDocumentStorage();

  const [value, setValue] = useState<any>(
    !props.appToken && !isReadOnly ? getDocument(documentId)?.contentJson || defaultContent : [],
  );

  const editor = createPlateEditor({
    plugins: [...getEditorPlugins(documentId, props.appToken, isReadOnly)],
    override: {
      components: getRichElements(),
    },
    skipInitialization: false,
    value:
      !props.appToken && !isReadOnly
        ? value
        : props.readOnly
          ? trimEmptyNodes(JSON.parse(props.value as string))
          : undefined,
  });

  useEffect(() => {
    if (props.appToken || isReadOnly) return;

    const loadDraft = async () => {
      try {
        const res = await fetch(`/api/drafts?id=${documentId}`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          const draft = data.draft;
          if (draft) {
            setValue(draft.contentJson || defaultContent);
            saveDocument(documentId, draft);
          }
        } else {
          const local = getDocument(documentId);
          if (local) setValue(local.contentJson);
        }
      } catch (_e) {
        const local = getDocument(documentId);
        if (local) setValue(local.contentJson);
      }
    };

    loadDraft();
  }, [documentId, props.appToken, isReadOnly]);

  useEffect(() => {
    if (!imported || editor || !isMounted) return;

    // TODO: remove last 3 nodes
  }, [imported, editor, isMounted]);

  useEffect(() => {
    if (!isMounted || props.readOnly || !props.appToken) return;

    editor.getApi(YjsPlugin).yjs.init({
      id: documentId,
      value: defaultContent,
      autoSelect: "end",
    });

    return () => {
      editor.getApi(YjsPlugin).yjs.destroy();
    };
  }, [isMounted, editor, props.appToken]);

  return (
    <DndProvider backend={HTML5Backend}>
      <Plate
        editor={editor}
        readOnly={isReadOnly}
        value={!props.appToken && !isReadOnly ? value : undefined}
        onChange={!props.appToken && !isReadOnly ? setValue : undefined}
      >
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

          {!isReadOnly && !props.appToken && <AutoSave documentId={documentId} />}

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
    plugins: [...getEditorPlugins("nopath")],
    override: {
      components: getElements(),
    },
  });
};
