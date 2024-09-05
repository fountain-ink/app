import { create } from "zustand";
import { persist } from "zustand/middleware";

interface DocumentState {
	[documentId: string]: object;
}

interface AppState {
	isSmoothScrolling: boolean;
	documents: DocumentState;
	toggleSmoothScrolling: () => void;
	saveDocument: (documentId: string, content: object) => void;
	getDocument: (documentId: string) => object | null;
}

export const useStorage = create<AppState>()(
	persist(
		(set, get) => ({
			isSmoothScrolling: true,

			documents: {},
			toggleSmoothScrolling: () =>
				set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
			saveDocument: (documentId: string, content: object) =>
				set((state) => ({
					documents: { ...state.documents, [documentId]: content },
				})),
			getDocument: (documentId: string) => get().documents[documentId] || null,
		}),
		{
			name: "app-storage",
		},
	),
);
