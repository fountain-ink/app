import { create } from "zustand";

interface UIState {
  isProfileSelectModalOpen: boolean;
  setProfileSelectModalOpen: (isOpen: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isProfileSelectModalOpen: false,
  setProfileSelectModalOpen: (isOpen: boolean) => set({ isProfileSelectModalOpen: isOpen }),
})); 