import { defaultThemeName, type ThemeType } from "@/styles/themes";
import { create } from "zustand";
import { persist } from "zustand/middleware";

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
      theme: defaultThemeName,
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
