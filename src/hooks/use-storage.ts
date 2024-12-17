import { defaultThemeName, type ThemeType } from "@/styles/themes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppSettings {
  isBlurEnabled: boolean;
  isSmoothScrolling: boolean;
  toggleBlurEffect: () => void;
  toggleSmoothScrolling: () => void;
}

export const useStorage = create<AppSettings>()(
  persist(
    (set) => ({
      isSmoothScrolling: false,
      isBlurEnabled: false,
      isAutoSyncEnabled: false,
      toggleSmoothScrolling: () => set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
      toggleBlurEffect: () => set((state) => ({ isBlurEnabled: !state.isBlurEnabled })),
    }),

    {
      name: "app-settings",
    },
  ),
);
