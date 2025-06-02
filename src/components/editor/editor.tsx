"use client";

import { Plate, createPlateEditor, useEditorMounted, usePlateEditor } from "@udecode/plate/react";
import { useSearchParams } from "next/navigation"; // useRouter not used currently
import { useEffect, type PropsWithChildren } from "react"; // useState not used currently
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Editor as UiEditor, EditorContainer } from "../ui/editor"; // Renamed Editor to UiEditor to avoid conflict
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
import { Value } from "@udecode/plate-common"; // Import Value for Plate's content type

// Updated Props for PlateEditor
type PlateEditorProps = PropsWithChildren & {
  documentId: string;
  initialContentJson: Value;
  isCollaborative: boolean;
  showToolbar?: boolean;
  showToc?: boolean;
  username?: string;
  readOnly?: boolean;
  appToken?: string;
};

export default function PlateEditor(props: PlateEditorProps) {
  const { documentId, initialContentJson, isCollaborative, appToken, readOnly: propsReadOnly, username } = props;

  const searchParams = useSearchParams();
  const isPreview = searchParams.has("preview");
  const isReadOnly = propsReadOnly || isPreview;
  const isMounted = useMounted();
  const imported = searchParams.has("import"); // Retaining 'imported' logic for now

  const editor = createPlateEditor({
    id: documentId, // Assigning documentId as editor id
    plugins: getEditorPlugins(documentId, isCollaborative, appToken, isReadOnly),
    override: {
      components: getRichElements(),
    },
    // Configure value and skipInitialization based on collaborative mode
    value: !isCollaborative || isReadOnly ? trimEmptyNodes(initialContentJson) : undefined,
    skipInitialization: isCollaborative && !isReadOnly, // Skip Plate's own init if Yjs will handle it
  });

  useEffect(() => {
    if (!imported || !editor || !isMounted) return; // Corrected editor check: !editor
    // TODO: remove last 3 nodes (existing TODO)
  }, [imported, editor, isMounted]);

  // Yjs initialization useEffect
  useEffect(() => {
    if (isMounted && isCollaborative && !isReadOnly && appToken && editor.pluginsMap[YjsPlugin.key]) {
      // Ensure YjsPlugin is actually loaded before trying to get its API
      editor.getApi(YjsPlugin).yjs.init({
        id: documentId, // Use prop documentId
        value: initialContentJson || defaultContent, // Seed Yjs doc with initial content if available
        autoSelect: "end",
      });

      return () => {
        // Check if yjs API exists before trying to destroy
        if (editor.getApi(YjsPlugin)?.yjs) {
           editor.getApi(YjsPlugin).yjs.destroy();
        }
      };
    }
  }, [isMounted, isCollaborative, isReadOnly, appToken, editor, documentId, initialContentJson]);

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
              <UiEditor variant={"fullWidth"} autoFocus /> {/* Changed Editor to UiEditor */}
            </div>
          </EditorContainer>
          {!isReadOnly && <AutoSave documentId={documentId} isCollaborative={isCollaborative} />} {/* Pass isCollaborative */}
          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>

          <div className="absolute right-0 top-0 h-full w-4 select-none" />
        </div>
      </Plate>
    </DndProvider>
  );
}

// useMyEditor might need similar adjustments if used for non-collab editing elsewhere,
// or could be deprecated if PlateEditor is the sole entry point.
// For now, its getEditorPlugins call is updated to show the new signature requirement.
export const useMyEditor = () => {
  return usePlateEditor({
    plugins: [...getEditorPlugins("nopath", false)], // Example: non-collaborative, no appToken
    override: {
      components: getElements(),
    },
  });
};
