import { YjsEditor } from "@slate-yjs/core";
import { useEditorPlugin } from "@udecode/plate-common/react";
import { type YjsConfig, BaseYjsPlugin } from "@udecode/plate-yjs";
import { useEffect } from "react";
import { RemoteCursorOverlay } from "./yjs-overlay";

export const RenderAboveEditableYjs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { editor, useOption } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

  const provider = useOption("provider");
  const isSynced = useOption("isSynced");


  useEffect(() => {
    if (!provider.isConnected) {
      void provider.connect();
    }

    return () => {
      if (provider.isConnected) {
        provider.disconnect();
      }
    };
  }, [provider]);

  useEffect(() => {
      YjsEditor.connect(editor as any);

    return () => {
        YjsEditor.disconnect(editor as any);
    };
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
