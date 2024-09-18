import type { Draft } from "@/components/draft/draft";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocumentState {
  [documentId: string]: Draft;
}

interface AppState {

  isBlurEnabled: boolean;
  toggleBlurEffect: () => void;  

  isSmoothScrolling: boolean;
  documents: DocumentState;
  toggleSmoothScrolling: () => void;
  saveDocument: (documentId: string, draft: Draft) => void;
  getDocument: (documentId: string) => Draft | null;
  deleteDocument: (documentId: string) => void;
}

export const useStorage = create<AppState>()(
  persist(
    (set, get) => ({
      isSmoothScrolling: true,
      
      isBlurEnabled: true,      

      documents: {},
      toggleSmoothScrolling: () => set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
      
      toggleBlurEffect: () => set((state) => ({ isBlurEnabled: !state.isBlurEnabled })),      
      
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
      name: "app-storage",
    },
  ),
);
