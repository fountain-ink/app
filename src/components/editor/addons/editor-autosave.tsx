"use client";

import type { Draft } from "@/components/draft/draft";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { extractMetadata } from "@/lib/extract-metadata";
import { serializeHtml, Value } from "@udecode/plate";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { useEditorPlugin, useEditorState } from "@udecode/plate/react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import { getStaticEditor, staticComponents } from "../static";

export function AutoSave({ documentId }: { documentId: string }) {
  const editor = useEditorState();
  const { api } = useEditorPlugin(MarkdownPlugin);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { saveDocument, getDocument } = useDocumentStorage();

  const saveContent = useCallback(
    async (content: Value) => {
      setIsSaving(true);
      setIsVisible(true);
      setSaveSuccess(false);
      try {
        const now = new Date().toISOString();
        const existingDraft = getDocument(documentId);
        const { images, subtitle, title, coverUrl } = extractMetadata(editor.children as any);
        const contentMarkdown = api.markdown.serialize({ value: editor.children });

        const uniqueImages = [...existingDraft?.images || []];
        images.forEach(img => {
          if (!uniqueImages.includes(img)) {
            uniqueImages.push(img);
          }
        });

        const draft = {
          ...(existingDraft || {}),
          id: Date.now(),
          published_id: existingDraft?.published_id || null,
          documentId,
          author: "local",
          contentJson: content as any,
          contentMarkdown,
          updatedAt: now,
          createdAt: existingDraft?.createdAt || now,
          title,
          subtitle,
          images: uniqueImages,
          contentHtml: null,
          contributors: null,
          yDoc: null,
          tags: existingDraft?.tags || [],
        };

        // FIXME: possibly an issue with the type inference here
        saveDocument(documentId, draft as Draft);
        setSaveSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 500);
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        setIsSaving(false);
      }
    },
    [documentId, saveDocument, getDocument],
  );

  const debouncedSave = useDebouncedCallback(saveContent, 500);

  useEffect(() => {
    if (!editor) return;
    debouncedSave(editor.children);
  }, [editor, editor?.children, debouncedSave]);

  return null;
  // return (
  //   <AnimatePresence>
  //     {isVisible && (
  //       <motion.div
  //         initial={{ opacity: 0, y: 10 }}
  //         animate={{ opacity: 1, y: 0 }}
  //         exit={{ opacity: 0, y: 10 }}
  //         className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md bg-background px-4 py-2 text-sm shadow-lg"
  //       >
  //         {isSaving ? (
  //           <>
  //             <LoadingSpinner size={16} />
  //             <span>Saving...</span>
  //           </>
  //         ) : (
  //           <>
  //             <CheckIcon className="h-4 w-4 text-green-500" />
  //             <span>Saved</span>
  //           </>
  //         )}
  //       </motion.div>
  //     )}
  //   </AnimatePresence>
  // );
}
