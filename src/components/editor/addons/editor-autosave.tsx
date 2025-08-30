"use client";

import { Value } from "@udecode/plate";
import { useEditorPlugin, useEditorState } from "@udecode/plate/react";
import { MarkdownPlugin } from "@udecode/plate-markdown";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";
import type { Draft } from "@/components/draft/draft";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { useYjsState } from "@/hooks/use-yjs-state";
import { extractMetadata } from "@/lib/extract-metadata";
import { Cloud, CloudUpload, CloudOff, CloudCheck } from "lucide-react";
import { toast } from "sonner";

export function AutoSave({ documentId, collaborative = false }: { documentId: string; collaborative?: boolean }) {
  const editor = useEditorState();
  const { api } = useEditorPlugin(MarkdownPlugin);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const { saveDocument, getDocument } = useDocumentStorage();

  // Get the Yjs state to check sync status
  const yjsState = useYjsState((state) => state.getState(documentId));
  const isSynced = yjsState?.status === "synced" || yjsState?.status === "connected";

  const saveContent = useCallback(
    async (content: Value) => {
      setIsSaving(true);
      setSaveSuccess(false);
      setSaveError(false);
      try {
        const now = new Date().toISOString();
        const existingDraft = getDocument(documentId);
        const { images, subtitle, title, coverUrl } = extractMetadata(editor.children as any);
        const contentMarkdown = api.markdown.serialize({ value: editor.children });

        const uniqueImages = [...(existingDraft?.images || [])];
        for (const img of images) {
          if (!uniqueImages.includes(img)) {
            uniqueImages.push(img);
          }
        }

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

        // Save to server if not collaborative OR if collaborative and synced
        if (!collaborative || (collaborative && isSynced)) {
          const response = await fetch(`/api/drafts?id=${documentId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content, title, subtitle, coverUrl }),
          });
          
          if (!response.ok) {
            throw new Error(`Save failed: ${response.status}`);
          }
        }
        
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
        }, 3000);
      } catch (error) {
        console.error("Error saving draft:", error);
        setIsSaving(false);
        setSaveError(true);
        
        toast.error("Failed to save draft", {
          description: "Check your internet connection and try again. If the problem persists, check the browser console for details.",
          duration: 5000,
        });
        
        setTimeout(() => {
          setSaveError(false);
        }, 5000);
      }
    },
    [documentId, saveDocument, getDocument, collaborative, isSynced, editor],
  );

  const debouncedSave = useDebouncedCallback(saveContent, 500);

  useEffect(() => {
    if (!editor) return;
    debouncedSave(editor.children);
  }, [editor, editor?.children, debouncedSave]);

  // Save when collaborative document becomes synced
  useEffect(() => {
    if (collaborative && isSynced && editor) {
      saveContent(editor.children);
    }
  }, [collaborative, isSynced, editor, saveContent]);

  return (
    <div className="fixed bottom-4 right-4">
      <div className="relative w-5 h-5">
        <motion.div
          animate={{ opacity: !isSaving && !saveError && !saveSuccess ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Cloud className="h-5 w-5" />
        </motion.div>
        <motion.div
          animate={{ opacity: isSaving ? 0.5 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <Cloud className="h-5 w-5" />
        </motion.div>
        <motion.div
          animate={{ opacity: saveError ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <CloudOff className="h-5 w-5" />
        </motion.div>
        <motion.div
          animate={{ opacity: saveSuccess ? 0.6 : 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          <CloudCheck className="h-5 w-5" />
        </motion.div>
      </div>
    </div>
  );
}
