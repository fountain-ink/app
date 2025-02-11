"use client";

import type { Draft } from "@/components/draft/draft";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { extractMetadata } from "@/lib/extract-metadata";
import { useEditorState } from "@udecode/plate/react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

export function AutoSave({ documentId }: { documentId: string }) {
  const editor = useEditorState();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { saveDocument, getDocument } = useDocumentStorage();

  const saveContent = useCallback(
    async (content: unknown) => {
      setIsSaving(true);
      setIsVisible(true);
      setSaveSuccess(false);
      try {
        const now = new Date().toISOString();
        const existingDraft = getDocument(documentId);
        const { title, subtitle, coverUrl } = extractMetadata(editor.children as any);

        const draft = {
          ...(existingDraft || {}),
          id: Date.now(),
          documentId,
          author: "local",
          contentJson: content,
          updatedAt: now,
          createdAt: existingDraft?.createdAt || now,
          title,
          subtitle,
          contentHtml: null,
          contributors: null,
          yDoc: null,
          // Local-only fields for UI state
          tags: existingDraft?.tags || [],
          coverUrl,
        } as Draft;

        saveDocument(documentId, draft);
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

  const debouncedSave = useDebouncedCallback(saveContent, 3000);

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
