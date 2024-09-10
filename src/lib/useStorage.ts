import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocumentState {
	[documentId: string]: string;
}

interface AppState {
	isSmoothScrolling: boolean;
	documents: DocumentState;
	toggleSmoothScrolling: () => void;
	saveDocument: (documentId: string, content: string) => void;
	getDocument: (documentId: string) => string | null;
}

export const useStorage = create<AppState>()(
  
	persist(
		(set, get) => ({
			isSmoothScrolling: true,

			documents: {},
			toggleSmoothScrolling: () =>
				set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
			saveDocument: (id: string, content_json: string) =>
				set((state) => ({
					documents: { ...state.documents, [id]: content_json },
				})),
			getDocument: (documentId: string) => get().documents[documentId] || null,
		}),
		{
			name: "app-storage",
		},
	),
);
