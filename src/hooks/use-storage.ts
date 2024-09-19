import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppSettings {
  isBlurEnabled: boolean;
  isSmoothScrolling: boolean;
  isAutoSyncEnabled: boolean;
  toggleBlurEffect: () => void;
  toggleSmoothScrolling: () => void;
}

export const useStorage = create<AppSettings>()(
  persist(
    (set) => ({
      isSmoothScrolling: true,
      isBlurEnabled: true,
      isAutoSyncEnabled: false,
      toggleSmoothScrolling: () => set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
      toggleBlurEffect: () => set((state) => ({ isBlurEnabled: !state.isBlurEnabled })),
    }),
    {
      name: "app-settings",
    },
  ),
);
