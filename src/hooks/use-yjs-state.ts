import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "syncing" | "synced";

interface DocumentState {
  [path: string]: {
    status: ConnectionStatus;
    error?: string;
    isCollaborative?: boolean;
  };
}

interface YjsState {
  documents: DocumentState;
  activeDocument: string | null;
  setStatus: (path: string, status: ConnectionStatus) => void;
  setError: (path: string, error: string) => void;
  getState: (path: string) => { status: ConnectionStatus; error?: string; isCollaborative?: boolean } | null;
  removeDocument: (path: string) => void;
  setActiveDocument: (path: string | null) => void;
  setCollaborative: (path: string, isCollaborative: boolean) => void;
}

export const useYjsState = create<YjsState>()(
  persist(
    (set, get) => ({
      documents: {},
      activeDocument: null,
      setStatus: (path: string, status: ConnectionStatus) =>
        set((state) => ({
          documents: {
            ...state.documents,
            [path]: {
              ...state.documents[path],
              status,
              error: undefined,
            },
          },
        })),
      setError: (path: string, error: string) =>
        set((state) => ({
          documents: {
            ...state.documents,
            [path]: {
              ...state.documents[path],
              status: "disconnected" as const,
              error,
            },
          },
        })),
      getState: (path: string) => get().documents[path] || null,
      removeDocument: (path: string) =>
        set((state) => {
          const { [path]: _, ...remainingDocuments } = state.documents;
          return { documents: remainingDocuments };
        }),
      setActiveDocument: (path: string | null) => set({ activeDocument: path }),
      setCollaborative: (path: string, isCollaborative: boolean) =>
        set((state) => ({
          documents: {
            ...state.documents,
            [path]: {
              ...state.documents[path],
              isCollaborative,
              status: state.documents[path]?.status || "disconnected",
            },
          },
        })),
    }),
    {
      name: "yjs-state",
    },
  ),
);

export type { ConnectionStatus };
