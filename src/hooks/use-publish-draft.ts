import { useCallback } from "react";
import type { Draft } from "@/components/draft/draft";
import { useDocumentStorage } from "@/hooks/use-document-storage";

export const usePublishDraft = (documentId?: string) => {
  const { getDocument, saveDocument } = useDocumentStorage();

  const getDraft = useCallback(() => {
    if (!documentId) return null;
    return getDocument(documentId);
  }, [documentId]);

  const updateDraft = useCallback(
    (updates: Partial<Draft>) => {
      if (!documentId) return;

      const draft = getDocument(documentId);
      if (!draft) return;

      const updatedDraft = {
        ...draft,
        ...updates,
      };

      saveDocument(documentId, updatedDraft);
    },
    [documentId],
  );

  return {
    getDraft,
    updateDraft,
    documentId,
  };
};
