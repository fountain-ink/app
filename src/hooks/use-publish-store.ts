import { create } from "zustand";

interface PublishState {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

export const usePublishStore = create<PublishState>((set) => ({
  isOpen: false,
  setIsOpen: (open) => set({ isOpen: open }),
}));
