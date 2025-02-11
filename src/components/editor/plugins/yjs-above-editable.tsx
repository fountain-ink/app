import { YjsEditor } from "@slate-yjs/core";
import { HEADING_KEYS } from "@udecode/plate-heading";
import { BaseYjsPlugin, type YjsConfig } from "@udecode/plate-yjs";
import { useEffect } from "react";
import { RemoteCursorOverlay } from "./yjs-overlay";
import { useEditorPlugin, usePluginOption } from "@udecode/plate/react";

export const RenderAboveEditableYjs: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { editor } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

  const provider = usePluginOption(BaseYjsPlugin, 'provider');
  const isSynced = usePluginOption(BaseYjsPlugin, 'isSynced');


  useEffect(() => {
    void provider.connect();

    return () => provider.disconnect();
  }, [provider]);


  useEffect(() => {
    YjsEditor.connect(editor as any);

    return () => YjsEditor.disconnect(editor as any);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [provider.awareness, provider.document]);

  if (!isSynced) return null;

  if (!isSynced) return null;

  // return <RemoteCursorOverlay className="flex justify-center">{children}</RemoteCursorOverlay>;
  return <>{children}</>;
};

// TODO refactor for v38

// export const RenderAboveEditableYjs =
//   (doc: Y.Doc, pageId?: string) =>
//   ({ children }: { children: ReactNode }) => {
//     const { editor, getOption } = useEditorPlugin<YjsConfig>(BaseYjsPlugin);

//     const provider = getOption("provider");
//     const isSynced = getOption("isSynced");

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
