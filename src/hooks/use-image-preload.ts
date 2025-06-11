import { useCallback } from "react";

export function useImagePreload() {
  const preloadImage = useCallback((src: string) => {
    if (typeof window === "undefined" || !src) return;
    
    const img = new Image();
    img.src = src;
  }, []);

  return preloadImage;
}