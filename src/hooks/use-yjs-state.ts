import { create } from "zustand";
import { persist } from "zustand/middleware";

type ConnectionStatus = "disconnected" | "connecting" | "connected" | "syncing" | "synced";

interface DocumentState {
  [path: string]: {
    status: ConnectionStatus;
    error?: string;
  };
}

interface YjsState {
  documents: DocumentState;
  setStatus: (path: string, status: ConnectionStatus) => void;
  setError: (path: string, error: string) => void;
  getState: (path: string) => { status: ConnectionStatus; error?: string } | null;
  removeDocument: (path: string) => void;
}

export const useYjsState = create<YjsState>()(
  persist(
    (set, get) => ({
      documents: {},
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
    }),
    {
      name: "yjs-state",
    },
  ),
);

export type { ConnectionStatus };
