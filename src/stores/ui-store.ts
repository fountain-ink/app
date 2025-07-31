import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UIState {
  isProfileSelectModalOpen: boolean;
  setProfileSelectModalOpen: (isOpen: boolean) => void;
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  lastNotificationCheck: number;
  setLastNotificationCheck: (timestamp: number) => void;
  lastNotificationSeen: number;
  setLastNotificationSeen: (timestamp: number) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      isProfileSelectModalOpen: false,
      setProfileSelectModalOpen: (isOpen: boolean) => set({ isProfileSelectModalOpen: isOpen }),
      notificationCount: 0,
      setNotificationCount: (count: number) => set({ notificationCount: count }),
      lastNotificationCheck: 0,
      setLastNotificationCheck: (timestamp: number) => set({ lastNotificationCheck: timestamp }),
      lastNotificationSeen: 0,
      setLastNotificationSeen: (timestamp: number) => set({ lastNotificationSeen: timestamp }),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        lastNotificationCheck: state.lastNotificationCheck,
        lastNotificationSeen: state.lastNotificationSeen,
      }),
    },
  ),
);
