import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ThemeType } from "@/styles/themes";

interface AppSettings {
  isBlurEnabled: boolean;
  isSmoothScrolling: boolean;
  isAutoSyncEnabled: boolean;
  theme: ThemeType;
  toggleBlurEffect: () => void;
  toggleSmoothScrolling: () => void;
  toggleAutoSync: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const useStorage = create<AppSettings>()(
  persist(
    (set) => ({
      isSmoothScrolling: false,
      isBlurEnabled: false,
      isAutoSyncEnabled: false,
      theme: "light" as ThemeType,
      toggleSmoothScrolling: () => set((state) => ({ isSmoothScrolling: !state.isSmoothScrolling })),
      toggleBlurEffect: () => set((state) => ({ isBlurEnabled: !state.isBlurEnabled })),
      toggleAutoSync: () => set((state) => ({ isAutoSyncEnabled: !state.isAutoSyncEnabled })),
      setTheme: (theme: ThemeType) => set({ theme }),
    }),

    {
      name: "app-settings",
    },
  ),
);
