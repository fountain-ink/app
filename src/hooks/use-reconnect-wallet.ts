"use client";
import { useModal } from "connectkit";

export const useReconnectWallet = () => {
  const { setOpen } = useModal();
  return () => setOpen(true);
};
