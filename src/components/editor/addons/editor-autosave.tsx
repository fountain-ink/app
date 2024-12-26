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

  const { saveDocument } = useDocumentStorage();

  const saveContent = useCallback(
    async (content: object) => {
      setIsSaving(true);
      setIsVisible(true);
      setSaveSuccess(false);
      try {
        const now = new Date().toISOString();
        const draft: Draft = {
          id: Date.now(),
          isLocal: true,
          documentId,
          authorId: "local",
          contentJson: content,
          updatedAt: now,
          createdAt: now,
        };

        saveDocument(documentId, draft);
        setSaveSuccess(true);
        setTimeout(() => {
          setIsVisible(false);
        }, 2000);
      } catch (error) {
        console.error("Error saving draft:", error);
      } finally {
        console.log("saved:", content);
        setIsSaving(false);
      }
    },
    [documentId, saveDocument],
  );

  const debouncedSave = useDebouncedCallback(saveContent, 3000);

  useEffect(() => {
    if (!editor) return;

    debouncedSave(editor.children);
  }, [editor, editor?.children, debouncedSave]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="opacity-50 rounded-full p-2"
          >
            {isSaving && <LoadingSpinner className="w-6 h-6 " />}
            {saveSuccess && <CheckIcon className="w-6 h-6" />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
