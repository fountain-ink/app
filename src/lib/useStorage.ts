import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
	isSmoothScrolling: boolean;
	toggleSmoothScrolling: () => void;
}

export const useStorage = create<AppState>()(
	persist(
		(set) => ({
			isSmoothScrolling: true,
			toggleSmoothScrolling: () =>
				set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
		}),
		{
			name: "app-storage",
		},
	),
);
