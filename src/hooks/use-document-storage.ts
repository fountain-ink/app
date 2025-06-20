import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Draft } from "@/components/draft/draft";

interface DocumentState {
  [documentId: string]: Draft;
}

interface DocumentStorage {
  documents: DocumentState;
  saveDocument: (documentId: string, draft: Draft) => void;
  getDocument: (documentId: string) => Draft | null;
  deleteDocument: (documentId: string) => void;
}

export const useDocumentStorage = create<DocumentStorage>()(
  persist(
    (set, get) => ({
      documents: {},
      saveDocument: (documentId: string, draft: Draft) =>
        set((state) => ({
          documents: { ...state.documents, [documentId]: draft },
        })),
      getDocument: (documentId: string) => get().documents[documentId] || null,
      deleteDocument: (documentId: string) =>
        set((state) => {
          const { [documentId]: _, ...remainingDocuments } = state.documents;
          return { documents: remainingDocuments };
        }),
    }),
    {
      name: "document-storage",
    },
  ),
);
