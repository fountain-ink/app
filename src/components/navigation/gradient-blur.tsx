"use client";

import { usePathname } from "next/navigation";

import { useStorage } from "@/hooks/use-storage";

export const Blur = () => {
  const pathname = usePathname();

  const { isBlurEnabled } = useStorage();

  if (pathname !== "/" && !pathname.startsWith("/p")) {
    return null;
  }

  if (!isBlurEnabled) {
    return null;
  }

  return (
    <>
      <div className="z-[36] h-[10%] w-full fixed top-0 bg-gradient-to-b from-background to-transparent" />
      <div className="z-[35] gradient-blur-top h-[35%] w-full fixed top-0" />

      <div className="z-[35] gradient-blur-bot h-[35%] w-full fixed bottom-0" />
      <div className="z-[36] h-[10%] w-full fixed bottom-0 bg-gradient-to-t from-background to-transparent" />
    </>
  );
};
