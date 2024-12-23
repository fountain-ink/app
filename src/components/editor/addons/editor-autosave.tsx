"use client";

import { LoadingSpinner } from "@/components/loading-spinner";
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

  const saveContent = useCallback(
    async (content: object) => {
      setIsSaving(true);
      setIsVisible(true);
      setSaveSuccess(false);
      try {
        localStorage.setItem(`${documentId}`, JSON.stringify({
          content,
          updatedAt: new Date().toISOString(),
        }));
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
    [documentId],
  );

  const debouncedSave = useDebouncedCallback(saveContent, 1000);

  useEffect(() => {
    if (!editor) return;

    const content = editor.children;
    debouncedSave(content);

  }, [editor, debouncedSave]);

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
