import { YjsEditor } from "@slate-yjs/core";
import { type TElement, insertNodes, isEditor, removeNodes } from "@udecode/plate-common";
import { useEditorPlugin } from "@udecode/plate-common/react";
import { type YjsConfig, BaseYjsPlugin } from "@udecode/plate-yjs";
import { useEffect, useMemo } from "react";
import { RemoteCursorOverlay } from "./yjs-overlay";

export const RenderAboveEditableYjs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { editor, useOption } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

  const provider = useOption("provider");
  const isSynced = useOption("isSynced");
  
  useMemo(() => {
    const { normalizeNode } = editor;
    editor.normalizeNode = (entry: any) => {
      const [node] = entry;
      const children = node.children as TElement[];

      if (isEditor(node)) {
        let normalized = false;

        // Handle empty document case
        if (children.length === 0) {
          insertNodes(
            editor,
            [
              { type: "h1", children: [{ text: "" }] },
              { type: "h2", children: [{ text: "" }] },
            ],
            { at: [0] },
          );
          normalized = true;
        }

        // Ensure first node is h1
        if (!normalized && children?.[0]?.type !== "h1") {
          const existingContent = children[0]?.children || [{ text: "" }];
          removeNodes(editor, { at: [0] });
          insertNodes(editor, { type: "h1", children: existingContent }, { at: [0] });
          normalized = true;
        }

        // Process remaining nodes in a single pass
        if (!normalized) {
          const updatedNodes = children.map((child, index) => {
            if (index === 0) return child; // Keep h1
            if (index === 1) return child; // Keep index 1 as-is
            if (child.type === "h1" || child.type === "h2") {
              return { type: "p", children: child.children };
            }
            return child;
          });

          if (JSON.stringify(children) !== JSON.stringify(updatedNodes)) {
            editor.children = updatedNodes;
            normalized = true;
          }
        }

        if (!normalized) {
          normalizeNode(entry);
        }
      } else {
        normalizeNode(entry);
      }
    };
  }, []);

  useEffect(() => {
    void provider.connect();

    return () => provider.disconnect();
  }, [provider]);

  useEffect(() => {
    if (!provider.isConnected) {
      YjsEditor.connect(editor as any);
    }

    return () => YjsEditor.disconnect(editor as any);
  }, [provider.awareness, provider.document]);

  if (!isSynced) return null;

  return <RemoteCursorOverlay className="flex justify-center">{children}</RemoteCursorOverlay>;
};

// TODO refactor for v38

// export const RenderAboveEditableYjs =
//   (doc: Y.Doc, pageId?: string) =>
//   ({ children }: { children: ReactNode }) => {
//     const { editor, useOption } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

//     const provider = useOption("provider");
//     const isSynced = useOption("isSynced");

//     useMemo(() => {
//       // Ensure editor always has at least 1 valid child
//       const { normalizeNode } = editor;
//       editor.normalizeNode = (entry) => {
//         const [node] = entry;
//         const children = node.children as TElement[];
//         console.log(isEditor(node), children);
//         if (isEditor(node) && children.length > 1) {
//           if (
//             children[0] &&
//             children[0].children[0]?.text === "" &&
//             children[1] &&
//             children[1]?.children[0]?.text === ""
//           ) {
//             return removeNodes(editor, { at: [0] });
//           }
//         }
//         if (!isEditor(node) || children.length > 0) {
//           return normalizeNode(entry);
//         }

//         insertNodes(editor, { type: "p", children: [{ text: "" }] }, { at: [0] });
//       };
//     }, []);

//     const idbProvider = useMemo(() => {
//       const provider = pageId ? new IndexeddbPersistence(pageId, doc) : null;
//       return provider;
//     }, [pageId, doc]);

//     useEffect(() => {
//       return () => {
//         idbProvider?.destroy();
//       };
//     }, [idbProvider]);

//     // useEffect(() => {
//     //   void provider.connect();

//     //   return () => {
//     //     provider.disconnect();
//     //   };
//     // }, [provider]);

//     useEffect(() => {
//       if (!provider.isConnected) {
//         YjsEditor.connect(editor as any);
//       }

//       return () => {
//         if (provider.isConnected) {
//           YjsEditor.disconnect(editor as any);
//         }
//       };
//       // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, [provider.awareness, provider.document]);

//     const idbSynced = useMemo(async () => {
//       return idbProvider && (await idbProvider?.whenSynced.then(() => true));
//     }, [idbProvider]);

//     if (!isSynced && !idbSynced) return null;

//     return <RemoteCursorOverlay className="flex justify-center">{children}</RemoteCursorOverlay>;
//   };
