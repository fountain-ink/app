"use client";

import type { Draft } from "@/components/draft/draft";
import { LoadingSpinner } from "@/components/misc/loading-spinner";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { useEditorState } from "@udecode/plate-common/react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckIcon } from "lucide-react";
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
        
        const draft = {
          ...(existingDraft || {}),
          id: Date.now(),
          documentId,
          authorId: "local",
          contentJson: content,
          updatedAt: now,
          createdAt: existingDraft?.createdAt || now,
          title: existingDraft?.title || "",
          subtitle: existingDraft?.subtitle || null,
          contentHtml: null,
          contributors: null,
          yDoc: null,
          // Local-only fields for UI state
          tags: existingDraft?.tags || [],
          coverImage: existingDraft?.coverImage || null,
        } as Draft;

        saveDocument(documentId, draft);
        setSaveSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="fixed bottom-4 right-4 flex items-center gap-2 rounded-md bg-background px-4 py-2 text-sm shadow-lg"
        >
          {isSaving ? (
            <>
              <LoadingSpinner size={16} />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <CheckIcon className="h-4 w-4 text-green-500" />
              <span>Saved</span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
